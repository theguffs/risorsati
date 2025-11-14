<?php
/**
 * Script per importare i dati dal file Excel nel database Supabase
 * 
 * Uso:
 *     php import_excel_data.php
 *     php import_excel_data.php --url=https://your-project.supabase.co --key=your-key
 * 
 * Prerequisiti:
 *     composer require phpoffice/phpspreadsheet
 */

// Aumenta il limite di memoria per file Excel grandi
ini_set('memory_limit', '1024M');
ini_set('max_execution_time', 0); // Nessun limite di tempo

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;

// Carica variabili d'ambiente
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $lineNum => $line) {
        $line = trim($line);
        // Salta righe vuote o commenti
        if (empty($line) || strpos($line, '#') === 0) continue;
        
        // Dividi in nome e valore (massimo 2 parti per gestire valori con =)
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            // Rimuovi virgolette se presenti
            $value = trim($value, '"\'');
            $_ENV[$name] = $value;
        }
    }
}

// Parse argomenti da riga di comando
$options = getopt('', ['url:', 'key:']);

// Configurazione Supabase
$supabaseUrl = $options['url'] ?? $_ENV['VITE_SUPABASE_URL'] ?? $_ENV['SUPABASE_URL'] ?? null;
$supabaseKey = $options['key'] ?? $_ENV['VITE_SUPABASE_ANON_KEY'] ?? $_ENV['SUPABASE_ANON_KEY'] ?? null;

if (!$supabaseUrl || !$supabaseKey) {
    echo "\nERRORE: SUPABASE_URL e SUPABASE_ANON_KEY sono obbligatori\n";
    echo "   Configura le variabili nel file .env o come variabili d'ambiente\n";
    echo "   Esempio .env:\n";
    echo "   VITE_SUPABASE_URL=https://your-project.supabase.co\n";
    echo "   VITE_SUPABASE_ANON_KEY=your-anon-key\n";
    echo "\n   Oppure usa:\n";
    echo "   php import_excel_data.php --url=<URL> --key=<KEY>\n";
    exit(1);
}

// Classe helper per chiamate API Supabase
class SupabaseClient {
    private $url;
    private $key;
    
    public function __construct($url, $key) {
        $this->url = rtrim($url, '/');
        $this->key = $key;
    }
    
    public function request($method, $table, $data = null, $filters = []) {
        $url = $this->url . '/rest/v1/' . $table;
        
        if (!empty($filters)) {
            $queryParams = [];
            foreach ($filters as $key => $value) {
                if ($key === 'select') {
                    $queryParams['select'] = $value;
                } elseif ($key === 'limit') {
                    $queryParams['limit'] = $value;
                } else {
                    // Filtri PostgREST: column=operator.value
                    $queryParams[$key] = $value;
                }
            }
            $url .= '?' . http_build_query($queryParams);
        }
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'apikey: ' . $this->key,
                'Authorization: Bearer ' . $this->key,
                'Content-Type: application/json',
                'Prefer: return=representation'
            ],
            CURLOPT_CUSTOMREQUEST => $method
        ]);
        
        if ($data && in_array($method, ['POST', 'PATCH', 'PUT'])) {
            // Se $data è un array di array, è un batch insert (PostgREST supporta array di oggetti)
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception("HTTP $httpCode: $response");
        }
        
        return json_decode($response, true) ?: [];
    }
    
    public function from($table) {
        return new SupabaseQueryBuilder($this, $table);
    }
}

class SupabaseQueryBuilder {
    private $client;
    private $table;
    private $filters = [];
    
    public function __construct($client, $table) {
        $this->client = $client;
        $this->table = $table;
    }
    
    public function select($columns) {
        $this->filters['select'] = $columns;
        return $this;
    }
    
    public function eq($column, $value) {
        $this->filters[$column] = 'eq.' . $value;
        return $this;
    }
    
    public function ilike($column, $pattern) {
        // PostgREST usa il formato: column=ilike.*pattern*
        $this->filters[$column] = 'ilike.*' . str_replace(['*', '%'], '', $pattern) . '*';
        return $this;
    }
    
    public function limit($count) {
        $this->filters['limit'] = $count;
        return $this;
    }
    
    public function insert($data) {
        return new SupabaseInsert($this->client, $this->table, $data);
    }
    
    public function insertBatch($dataArray) {
        // Inserisce un array di record in batch
        return new SupabaseInsert($this->client, $this->table, $dataArray);
    }
    
    public function execute() {
        $result = $this->client->request('GET', $this->table, null, $this->filters);
        // PostgREST restituisce un array, non un oggetto
        return (object)['data' => is_array($result) ? $result : []];
    }
}

class SupabaseInsert {
    private $client;
    private $table;
    private $data;
    
    public function __construct($client, $table, $data) {
        $this->client = $client;
        $this->table = $table;
        $this->data = $data;
    }
    
    public function execute() {
        $result = $this->client->request('POST', $this->table, $this->data);
        // PostgREST con Prefer: return=representation restituisce l'oggetto inserito
        // Gestisce diversi formati di risposta
        if (is_array($result)) {
            // Se è un array, potrebbe essere array di oggetti o array associativo
            if (isset($result[0]) && is_array($result[0])) {
                // Array di oggetti: [ {...}, {...} ]
                return (object)['data' => $result];
            } elseif (!empty($result) && isset($result['id'])) {
                // Singolo oggetto come array associativo
                return (object)['data' => [$result]];
            } else {
                // Array vuoto o formato non riconosciuto
                return (object)['data' => []];
            }
        } elseif (is_object($result)) {
            // Se è un oggetto, convertilo in array
            return (object)['data' => [(array)$result]];
        } else {
            return (object)['data' => []];
        }
    }
}

// Inizializza client Supabase
$supabase = new SupabaseClient($supabaseUrl, $supabaseKey);

// Path del file Excel
$excelFile = __DIR__ . '/../File Extra&Fissi 2025 - NEW.xlsx';

if (!file_exists($excelFile)) {
    echo "[ERR] Errore: File $excelFile non trovato!\n";
    exit(1);
}

/**
 * Converte un valore Excel in time object
 */
function parseTime($value) {
    if ($value === null || $value === '') {
        return null;
    }
    
    if ($value instanceof DateTime) {
        return $value->format('H:i:s');
    }
    
    if (is_string($value)) {
        $value = trim($value);
        
        // Gestisce casi come "1900-01-01 03:30:00"
        if (strpos($value, '1900-01-01') === 0) {
            try {
                $dt = DateTime::createFromFormat('Y-m-d H:i:s', $value);
                if ($dt) return $dt->format('H:i:s');
            } catch (Exception $e) {}
        }
        
        // Prova formati standard
        $formats = ['H:i:s', 'H:i', 'H:i:s.u'];
        foreach ($formats as $format) {
            try {
                $dt = DateTime::createFromFormat($format, $value);
                if ($dt) return $dt->format('H:i:s');
            } catch (Exception $e) {}
        }
        
        // Se contiene "-" potrebbe essere un range, prendi solo la prima parte
        if (strpos($value, '-') !== false && strpos($value, ':') !== false) {
            $parts = explode('-', $value);
            $firstPart = trim($parts[0]);
            try {
                $dt = DateTime::createFromFormat('H:i', $firstPart);
                if ($dt) return $dt->format('H:i:s');
            } catch (Exception $e) {}
        }
    }
    
    return null;
}

/**
 * Converte un valore Excel in date object
 */
function parseDate($value) {
    if ($value === null || $value === '') {
        return null;
    }
    
    if ($value instanceof DateTime) {
        return $value->format('Y-m-d');
    }
    
    if (is_numeric($value)) {
        // Excel serial date
        try {
            $date = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
            if ($date) {
                return $date->format('Y-m-d');
            }
        } catch (Exception $e) {}
    }
    
    if (is_string($value)) {
        $formats = ['Y-m-d', 'd/m/Y', 'Y-m-d H:i:s'];
        foreach ($formats as $format) {
            try {
                $dt = DateTime::createFromFormat($format, $value);
                if ($dt) return $dt->format('Y-m-d');
            } catch (Exception $e) {}
        }
    }
    
    return null;
}

/**
 * Importa dati dalla tabella Anagrafica
 */
function importAnagrafica($spreadsheet, $supabase) {
    echo "\n[INFO] Importazione Anagrafica...\n";
    
    $sheet = $spreadsheet->getSheetByName('Anagrafica');
    if (!$sheet) {
        echo "[ERR] Foglio 'Anagrafica' non trovato!\n";
        return [[], [], []];
    }
    
    $ruoliMap = [];
    $ristorantiMap = [];
    $risorseMap = [];
    
    $highestRow = $sheet->getHighestRow();
    
    for ($row = 2; $row <= $highestRow; $row++) {
        $livello = $sheet->getCellByColumnAndRow(2, $row)->getValue();
        $ruolo = $sheet->getCellByColumnAndRow(3, $row)->getValue();
        $listino = $sheet->getCellByColumnAndRow(4, $row)->getValue();
        $fee = $sheet->getCellByColumnAndRow(5, $row)->getValue();
        
        // Importa Ruoli
        if ($ruolo && !isset($ruoliMap[$ruolo])) {
            try {
                // Verifica se esiste già
                $existing = $supabase->from('ruoli')
                    ->select('id')
                    ->eq('ruolo', $ruolo)
                    ->limit(1)
                    ->execute();
                
                if (!empty($existing->data)) {
                    $ruoliMap[$ruolo] = $existing->data[0]['id'];
                    echo "  [->] Ruolo gia esistente: $ruolo\n";
                } else {
                    $result = $supabase->from('ruoli')
                        ->insert([
                            'livello' => $livello ? (int)$livello : null,
                            'ruolo' => (string)$ruolo,
                            'listino' => $listino ? (float)$listino : 0,
                            'fee_per_ora' => $fee ? (float)$fee : 0
                        ])
                        ->execute();
                    
                    // Supabase genera automaticamente l'ID, recuperiamolo dopo l'inserimento
                    $check = $supabase->from('ruoli')
                        ->select('id')
                        ->eq('ruolo', $ruolo)
                        ->limit(1)
                        ->execute();
                    if (!empty($check->data) && isset($check->data[0]['id'])) {
                        $ruoliMap[$ruolo] = $check->data[0]['id'];
                        echo "  [OK] Ruolo importato: $ruolo\n";
                    }
                }
            } catch (Exception $e) {
                echo "  [ERR] Errore importazione ruolo $ruolo: " . $e->getMessage() . "\n";
            }
        }
        
        // Importa Ristoranti (colonne G, H)
        $codiceRist = $sheet->getCellByColumnAndRow(7, $row)->getValue();
        $nomeRist = $sheet->getCellByColumnAndRow(8, $row)->getValue();
        
        if ($codiceRist && !isset($ristorantiMap[$codiceRist])) {
            try {
                $existing = $supabase->from('ristoranti')
                    ->select('id')
                    ->eq('codice', $codiceRist)
                    ->limit(1)
                    ->execute();
                
                if (!empty($existing->data)) {
                    $ristorantiMap[$codiceRist] = $existing->data[0]['id'];
                } else {
                    $result = $supabase->from('ristoranti')
                        ->insert([
                            'codice' => (string)$codiceRist,
                            'nome' => $nomeRist ? (string)$nomeRist : ''
                        ])
                        ->execute();
                    
                    // Supabase genera automaticamente l'ID, recuperiamolo dopo l'inserimento
                    $check = $supabase->from('ristoranti')
                        ->select('id')
                        ->eq('codice', $codiceRist)
                        ->limit(1)
                        ->execute();
                    if (!empty($check->data) && isset($check->data[0]['id'])) {
                        $ristorantiMap[$codiceRist] = $check->data[0]['id'];
                        echo "  [OK] Ristorante importato: $codiceRist - $nomeRist\n";
                    }
                }
            } catch (Exception $e) {
                echo "  [ERR] Errore importazione ristorante $codiceRist: " . $e->getMessage() . "\n";
            }
        }
        
        // Importa Risorse (colonne K, L)
        $codiceRis = $sheet->getCellByColumnAndRow(11, $row)->getValue();
        $nomeRis = $sheet->getCellByColumnAndRow(12, $row)->getValue();
        
        if ($codiceRis && !isset($risorseMap[$codiceRis])) {
            try {
                $existing = $supabase->from('risorse')
                    ->select('id')
                    ->eq('codice', $codiceRis)
                    ->limit(1)
                    ->execute();
                
                if (!empty($existing->data)) {
                    $risorseMap[$codiceRis] = $existing->data[0]['id'];
                } else {
                    $result = $supabase->from('risorse')
                        ->insert([
                            'codice' => (string)$codiceRis,
                            'nome' => $nomeRis ? (string)$nomeRis : ''
                        ])
                        ->execute();
                    
                    // Supabase genera automaticamente l'ID, recuperiamolo dopo l'inserimento
                    $check = $supabase->from('risorse')
                        ->select('id')
                        ->eq('codice', $codiceRis)
                        ->limit(1)
                        ->execute();
                    if (!empty($check->data) && isset($check->data[0]['id'])) {
                        $risorseMap[$codiceRis] = $check->data[0]['id'];
                        echo "  [OK] Risorsa importata: $codiceRis - $nomeRis\n";
                    }
                }
            } catch (Exception $e) {
                echo "  [ERR] Errore importazione risorsa $codiceRis: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n[OK] Anagrafica completata: " . count($ruoliMap) . " ruoli, " . count($ristorantiMap) . " ristoranti, " . count($risorseMap) . " risorse\n";
    return [$ruoliMap, $ristorantiMap, $risorseMap];
}

/**
 * Importa servizi da un foglio mensile
 */
function importServiziMese($spreadsheet, $sheetName, $supabase) {
    echo "\n[INFO] Importazione $sheetName...\n";
    
    $sheet = $spreadsheet->getSheetByName($sheetName);
    if (!$sheet) {
        echo "  [WARN] Foglio '$sheetName' non trovato, saltato\n";
        return 0;
    }
    
    // Trova la riga di intestazione (di solito riga 2)
    $headerRow = 2;
    $headers = [];
    $highestColumn = $sheet->getHighestColumn();
    $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);
    
    for ($col = 1; $col <= $highestColumnIndex; $col++) {
        $header = $sheet->getCellByColumnAndRow($col, $headerRow)->getValue();
        if ($header) {
            $headers[strtolower(trim($header))] = $col;
        }
    }
    
    $serviziImportati = 0;
    $highestRow = $sheet->getHighestRow();
    $batch = [];
    $batchSize = 50; // Inserisce 50 record alla volta
    
    for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
        $cliente = $sheet->getCellByColumnAndRow($headers['cliente'] ?? 2, $row)->getValue();
        $dataCell = $sheet->getCellByColumnAndRow($headers['data'] ?? 3, $row)->getValue();
        $risorsaNome = $sheet->getCellByColumnAndRow($headers['risorsa'] ?? 4, $row)->getValue();
        $ruoloNome = $sheet->getCellByColumnAndRow($headers['ruolo'] ?? 5, $row)->getValue();
        $orarioInizio = $sheet->getCellByColumnAndRow($headers['orario inizio'] ?? 6, $row)->getValue();
        $orarioFine = $sheet->getCellByColumnAndRow($headers['orario fine'] ?? 7, $row)->getValue();
        $paga = $sheet->getCellByColumnAndRow($headers['paga'] ?? 10, $row)->getValue();
        $fee = $sheet->getCellByColumnAndRow($headers['fee'] ?? 11, $row)->getValue();
        
        if (!$cliente || !$dataCell) {
            continue;
        }
        
        $data = parseDate($dataCell);
        if (!$data) {
            continue;
        }
        
        // Trova ID risorsa e ruolo
        $risorsaId = null;
        $ruoloId = null;
        
        if ($risorsaNome) {
            try {
                $result = $supabase->from('risorse')
                    ->select('id')
                    ->ilike('nome', '%' . $risorsaNome . '%')
                    ->limit(1)
                    ->execute();
                if (!empty($result->data)) {
                    $risorsaId = $result->data[0]['id'];
                }
            } catch (Exception $e) {}
        }
        
        if ($ruoloNome) {
            try {
                $result = $supabase->from('ruoli')
                    ->select('id')
                    ->eq('ruolo', $ruoloNome)
                    ->limit(1)
                    ->execute();
                if (!empty($result->data)) {
                    $ruoloId = $result->data[0]['id'];
                }
            } catch (Exception $e) {}
        }
        
        try {
            $servizioData = [
                'cliente' => (string)$cliente,
                'data' => $data,
                'risorsa_nome' => $risorsaNome ? (string)$risorsaNome : null,
                'ruolo_nome' => $ruoloNome ? (string)$ruoloNome : null,
                'orario_inizio' => parseTime($orarioInizio),
                'orario_fine' => parseTime($orarioFine),
                'paga' => ($paga && is_numeric($paga)) ? (float)$paga : null,
                'fee' => ($fee && is_numeric($fee)) ? (float)$fee : null
            ];
            
            if ($risorsaId) {
                $servizioData['risorsa_id'] = $risorsaId;
            }
            if ($ruoloId) {
                $servizioData['ruolo_id'] = $ruoloId;
            }
            
            // Verifica se il servizio esiste già (evita duplicati)
            try {
                $checkQuery = $supabase->from('servizi')
                    ->select('id')
                    ->eq('cliente', $servizioData['cliente'])
                    ->eq('data', $servizioData['data']);
                
                if ($risorsaId) {
                    $checkQuery = $checkQuery->eq('risorsa_id', $risorsaId);
                } elseif ($servizioData['risorsa_nome']) {
                    $checkQuery = $checkQuery->eq('risorsa_nome', $servizioData['risorsa_nome']);
                }
                
                if ($ruoloId) {
                    $checkQuery = $checkQuery->eq('ruolo_id', $ruoloId);
                } elseif ($servizioData['ruolo_nome']) {
                    $checkQuery = $checkQuery->eq('ruolo_nome', $servizioData['ruolo_nome']);
                }
                
                if ($servizioData['orario_inizio']) {
                    $checkQuery = $checkQuery->eq('orario_inizio', $servizioData['orario_inizio']);
                }
                
                $existing = $checkQuery->limit(1)->execute();
                
                if (!empty($existing->data)) {
                    // Servizio già esistente, salta
                    continue;
                }
            } catch (Exception $e) {
                // Se la verifica fallisce, procedi comunque con l'inserimento
            }
            
            $batch[] = $servizioData;
            
            // Inserisce in batch quando raggiunge la dimensione
            if (count($batch) >= $batchSize) {
                try {
                    $result = $supabase->from('servizi')->insertBatch($batch)->execute();
                    $count = is_array($result->data) ? count($result->data) : (empty($result->data) ? 0 : 1);
                    $serviziImportati += $count;
                echo "  ... $serviziImportati servizi importati...\n";
                    $batch = [];
                } catch (Exception $e) {
                    // Se l'inserimento batch fallisce, prova uno alla volta
                    echo "  [WARN] Errore batch, inserimento singolo: " . $e->getMessage() . "\n";
                    foreach ($batch as $single) {
                        try {
                            $supabase->from('servizi')->insert($single)->execute();
                            $serviziImportati++;
                        } catch (Exception $e2) {
                            // Ignora errori di duplicati
                            if (strpos($e2->getMessage(), 'duplicate') === false) {
                                echo "  [ERR] " . $e2->getMessage() . "\n";
                            }
                        }
                    }
                    $batch = [];
                }
            }
        } catch (Exception $e) {
            echo "  [ERR] Errore preparazione servizio riga $row: " . $e->getMessage() . "\n";
            echo "        Dati: cliente=$cliente, data=$data\n";
        }
    }
    
    // Inserisce i record rimanenti
    if (!empty($batch)) {
        try {
            $result = $supabase->from('servizi')->insertBatch($batch)->execute();
            $count = is_array($result->data) ? count($result->data) : (empty($result->data) ? 0 : 1);
            $serviziImportati += $count;
        } catch (Exception $e) {
            echo "  [ERR] Errore importazione batch finale: " . $e->getMessage() . "\n";
        }
    }
    
    echo "  [OK] $serviziImportati servizi importati da $sheetName\n";
    return $serviziImportati;
}

/**
 * Importa dati dalla tabella FISSI
 */
function importFissi($spreadsheet, $supabase) {
    echo "\n[INFO] Importazione FISSI...\n";
    
    $sheet = $spreadsheet->getSheetByName('FISSI');
    if (!$sheet) {
        echo "[WARN] Foglio 'FISSI' non trovato, saltato\n";
        return 0;
    }
    
    // Trova la riga di intestazione
    $headerRow = 3;
    $headers = [];
    $highestColumn = $sheet->getHighestColumn();
    $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);
    
    for ($col = 1; $col <= $highestColumnIndex; $col++) {
        $header = $sheet->getCellByColumnAndRow($col, $headerRow)->getValue();
        if ($header) {
            $headers[strtolower(trim($header))] = $col;
        }
    }
    
    $fissiImportati = 0;
    $highestRow = $sheet->getHighestRow();
    
    for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
        $cliente = $sheet->getCellByColumnAndRow($headers['cliente'] ?? 2, $row)->getValue();
        $dataCell = $sheet->getCellByColumnAndRow($headers['data'] ?? 3, $row)->getValue();
        $risorsaNome = $sheet->getCellByColumnAndRow($headers['risorsa'] ?? 5, $row)->getValue();
        $ruoloNome = $sheet->getCellByColumnAndRow($headers['ruolo'] ?? 6, $row)->getValue();
        $orariDiurni = $sheet->getCellByColumnAndRow($headers['orari diurni'] ?? 7, $row)->getValue();
        $orariSerali = $sheet->getCellByColumnAndRow($headers['orari serali'] ?? 8, $row)->getValue();
        $colloquio = $sheet->getCellByColumnAndRow($headers['colloquio'] ?? 9, $row)->getValue();
        $prova = $sheet->getCellByColumnAndRow($headers['prova '] ?? 10, $row)->getValue();
        $assunzione = $sheet->getCellByColumnAndRow($headers[' assunzione'] ?? 11, $row)->getValue();
        $fee = $sheet->getCellByColumnAndRow($headers['fee'] ?? 12, $row)->getValue();
        
        if (!$cliente || !$dataCell) {
            continue;
        }
        
        $data = parseDate($dataCell);
        if (!$data) {
            continue;
        }
        
        // Trova ID risorsa e ruolo
        $risorsaId = null;
        $ruoloId = null;
        
        if ($risorsaNome) {
            try {
                $result = $supabase->from('risorse')
                    ->select('id')
                    ->ilike('nome', '%' . $risorsaNome . '%')
                    ->limit(1)
                    ->execute();
                if (!empty($result->data)) {
                    $risorsaId = $result->data[0]['id'];
                }
            } catch (Exception $e) {}
        }
        
        if ($ruoloNome) {
            try {
                $result = $supabase->from('ruoli')
                    ->select('id')
                    ->eq('ruolo', $ruoloNome)
                    ->limit(1)
                    ->execute();
                if (!empty($result->data)) {
                    $ruoloId = $result->data[0]['id'];
                }
            } catch (Exception $e) {}
        }
        
        try {
            $fissoData = [
                'cliente' => (string)$cliente,
                'data' => $data,
                'risorsa_nome' => $risorsaNome ? (string)$risorsaNome : null,
                'ruolo_nome' => $ruoloNome ? (string)$ruoloNome : null,
                'orari_diurni' => $orariDiurni ? (string)$orariDiurni : null,
                'orari_serali' => $orariSerali ? (string)$orariSerali : null,
                'colloquio' => (strtolower($colloquio) === 'si'),
                'prova' => (strtolower($prova) === 'si'),
                'assunzione' => (strtolower($assunzione) === 'si'),
                'fee' => ($fee && is_numeric($fee)) ? (float)$fee : 0
            ];
            
            if ($risorsaId) {
                $fissoData['risorsa_id'] = $risorsaId;
            }
            if ($ruoloId) {
                $fissoData['ruolo_id'] = $ruoloId;
            }
            
            // Verifica se il fisso esiste già (evita duplicati)
            try {
                $checkQuery = $supabase->from('fissi')
                    ->select('id')
                    ->eq('cliente', $fissoData['cliente'])
                    ->eq('data', $fissoData['data']);
                
                if ($risorsaId) {
                    $checkQuery = $checkQuery->eq('risorsa_id', $risorsaId);
                } elseif ($fissoData['risorsa_nome']) {
                    $checkQuery = $checkQuery->eq('risorsa_nome', $fissoData['risorsa_nome']);
                }
                
                if ($ruoloId) {
                    $checkQuery = $checkQuery->eq('ruolo_id', $ruoloId);
                } elseif ($fissoData['ruolo_nome']) {
                    $checkQuery = $checkQuery->eq('ruolo_nome', $fissoData['ruolo_nome']);
                }
                
                $existing = $checkQuery->limit(1)->execute();
                
                if (!empty($existing->data)) {
                    // Fisso già esistente, salta
                    continue;
                }
            } catch (Exception $e) {
                // Se la verifica fallisce, procedi comunque con l'inserimento
            }
            
            try {
            $supabase->from('fissi')->insert($fissoData)->execute();
            $fissiImportati++;
            } catch (Exception $e) {
                // Ignora errori di duplicati
                if (strpos($e->getMessage(), 'duplicate') === false && strpos($e->getMessage(), 'unique') === false) {
                    echo "  [ERR] Errore importazione fisso riga $row: " . $e->getMessage() . "\n";
                }
            }
        } catch (Exception $e) {
            echo "  [ERR] Errore preparazione fisso riga $row: " . $e->getMessage() . "\n";
        }
    }
    
    echo "  [OK] $fissiImportati assunzioni fisse importate\n";
    return $fissiImportati;
}

/**
 * Importa dati dalla tabella servizi_svizzera
 */
function importServiziSvizzera($spreadsheet, $supabase) {
    echo "\n[INFO] Importazione servizi_svizzera...\n";
    
    // Prova diversi nomi possibili per il foglio
    $possibleNames = ['SVIZZERA', 'Svizzera', 'SVIZZERA_SERVIZI', 'Servizi Svizzera'];
    $sheet = null;
    $sheetName = null;
    
    foreach ($possibleNames as $name) {
        $sheet = $spreadsheet->getSheetByName($name);
        if ($sheet) {
            $sheetName = $name;
            break;
        }
    }
    
    if (!$sheet) {
        echo "[WARN] Foglio per servizi Svizzera non trovato (cercati: " . implode(', ', $possibleNames) . "), saltato\n";
        return 0;
    }
    
    // Trova la riga di intestazione (di solito riga 1 o 2)
    $headerRow = 1;
    $headers = [];
    $highestColumn = $sheet->getHighestColumn();
    $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);
    
    // Prova riga 1, se non trova header prova riga 2
    for ($col = 1; $col <= $highestColumnIndex; $col++) {
        $header = $sheet->getCellByColumnAndRow($col, $headerRow)->getValue();
        if ($header) {
            $headers[strtolower(trim($header))] = $col;
        }
    }
    
    // Se non ha trovato header, prova riga 2
    if (empty($headers)) {
        $headerRow = 2;
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $header = $sheet->getCellByColumnAndRow($col, $headerRow)->getValue();
            if ($header) {
                $headers[strtolower(trim($header))] = $col;
            }
        }
    }
    
    $serviziImportati = 0;
    $highestRow = $sheet->getHighestRow();
    
    for ($row = $headerRow + 1; $row <= $highestRow; $row++) {
        $dataCell = $sheet->getCellByColumnAndRow($headers['data'] ?? 1, $row)->getValue();
        $oraInizio = $sheet->getCellByColumnAndRow($headers['ora_inizio'] ?? $headers['ora inizio'] ?? $headers['inizio'] ?? 2, $row)->getValue();
        $oraFine = $sheet->getCellByColumnAndRow($headers['ora_fine'] ?? $headers['ora fine'] ?? $headers['fine'] ?? 3, $row)->getValue();
        $ore = $sheet->getCellByColumnAndRow($headers['ore'] ?? 4, $row)->getValue();
        $paga = $sheet->getCellByColumnAndRow($headers['paga'] ?? 5, $row)->getValue();
        $fee = $sheet->getCellByColumnAndRow($headers['fee'] ?? 6, $row)->getValue();
        $luogo = $sheet->getCellByColumnAndRow($headers['luogo'] ?? 7, $row)->getValue();
        $persona = $sheet->getCellByColumnAndRow($headers['persona'] ?? 8, $row)->getValue();
        $benzina = $sheet->getCellByColumnAndRow($headers['benzina'] ?? 9, $row)->getValue();
        
        if (!$dataCell) {
            continue;
        }
        
        $data = parseDate($dataCell);
        if (!$data) {
            continue;
        }
        
        try {
            $servizioData = [
                'data' => $data,
                'ora_inizio' => parseTime($oraInizio),
                'ora_fine' => parseTime($oraFine),
                'ore' => ($ore && is_numeric($ore)) ? (float)$ore : null,
                'paga' => ($paga && is_numeric($paga)) ? (float)$paga : null,
                'fee' => ($fee && is_numeric($fee)) ? (float)$fee : 0,
                'luogo' => $luogo ? (string)$luogo : null,
                'persona' => $persona ? (string)$persona : null,
                'benzina' => (strtolower($benzina) === 'si' || $benzina === true || $benzina === 1)
            ];
            
            $supabase->from('servizi_svizzera')->insert($servizioData)->execute();
            $serviziImportati++;
            
            if ($serviziImportati % 50 == 0) {
                echo "  ... $serviziImportati servizi importati...\n";
            }
        } catch (Exception $e) {
            echo "  [ERR] Errore importazione servizio Svizzera riga $row: " . $e->getMessage() . "\n";
        }
    }
    
    echo "  [OK] $serviziImportati servizi Svizzera importati\n";
    return $serviziImportati;
}

// ============================================
// MAIN
// ============================================

echo "======================================================================\n";
echo "IMPORTAZIONE DATI EXCEL -> SUPABASE\n";
echo "======================================================================\n";

try {
    // Carica il file Excel
    echo "\n[INFO] Caricamento file Excel...\n";
    $spreadsheet = IOFactory::load($excelFile);
    
    // 1. Importa Anagrafica
    list($ruoliMap, $ristorantiMap, $risorseMap) = importAnagrafica($spreadsheet, $supabase);
    
    // 2. Importa Servizi mensili
    $mesi = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO',
             'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];
    
    $totaleServizi = 0;
    foreach ($mesi as $mese) {
        try {
            $count = importServiziMese($spreadsheet, $mese, $supabase);
            $totaleServizi += $count;
        } catch (Exception $e) {
            echo "  [WARN] Errore importazione $mese: " . $e->getMessage() . "\n";
        }
    }
    
    // 3. Importa FISSI
    $totaleFissi = importFissi($spreadsheet, $supabase);
    
    // 4. Importa servizi_svizzera (DISABILITATO per ora)
    // $totaleSvizzera = importServiziSvizzera($spreadsheet, $supabase);
    
    echo "\n" . str_repeat("=", 70) . "\n";
    echo "[OK] IMPORTAZIONE COMPLETATA!\n";
    echo "   - Servizi mensili importati: $totaleServizi\n";
    echo "   - Assunzioni fisse importate: $totaleFissi\n";
    // echo "   - Servizi Svizzera importati: $totaleSvizzera\n";
    echo str_repeat("=", 70) . "\n";
    
} catch (Exception $e) {
    echo "\n[ERR] Errore durante l'importazione: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

