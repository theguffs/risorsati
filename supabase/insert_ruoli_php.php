<?php
/**
 * Script per inserire i ruoli predefiniti nel database Supabase
 * 
 * Uso:
 *     php supabase/insert_ruoli_php.php
 */

require __DIR__ . '/../vendor/autoload.php';

// Carica variabili d'ambiente
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $name = trim($parts[0]);
            $value = trim($parts[1]);
            $value = trim($value, '"\'');
            $_ENV[$name] = $value;
        }
    }
}

$supabaseUrl = $_ENV['VITE_SUPABASE_URL'] ?? $_ENV['SUPABASE_URL'] ?? null;
$supabaseKey = $_ENV['VITE_SUPABASE_ANON_KEY'] ?? $_ENV['SUPABASE_ANON_KEY'] ?? null;

if (!$supabaseUrl || !$supabaseKey) {
    echo "ERRORE: SUPABASE_URL e SUPABASE_ANON_KEY sono obbligatori nel file .env\n";
    exit(1);
}

// Classe helper per chiamate API Supabase (riutilizza quella esistente)
class SupabaseClient {
    private $url;
    private $key;
    
    public function __construct($url, $key) {
        $this->url = rtrim($url, '/');
        $this->key = $key;
    }
    
    public function request($method, $table, $data = null) {
        $url = $this->url . '/rest/v1/' . $table;
        
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
    
    public function limit($count) {
        $this->filters['limit'] = $count;
        return $this;
    }
    
    public function update($data) {
        return new SupabaseUpdate($this->client, $this->table, $data, $this->filters);
    }
    
    public function insert($data) {
        return new SupabaseInsert($this->client, $this->table, $data);
    }
    
    public function execute() {
        $result = $this->client->request('GET', $this->table, null, $this->filters);
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
        if (is_array($result)) {
            if (isset($result[0]) && is_array($result[0])) {
                return (object)['data' => $result];
            } elseif (!empty($result) && isset($result['id'])) {
                return (object)['data' => [$result]];
            } else {
                return (object)['data' => []];
            }
        } elseif (is_object($result)) {
            return (object)['data' => [(array)$result]];
        } else {
            return (object)['data' => []];
        }
    }
}

class SupabaseUpdate {
    private $client;
    private $table;
    private $data;
    private $filters;
    
    public function __construct($client, $table, $data, $filters) {
        $this->client = $client;
        $this->table = $table;
        $this->data = $data;
        $this->filters = $filters;
    }
    
    public function eq($column, $value) {
        $this->filters[$column] = 'eq.' . $value;
        return $this;
    }
    
    public function execute() {
        $url = $this->client->request('PATCH', $this->table, $this->data, $this->filters);
        return (object)['data' => []];
    }
}

$supabase = new SupabaseClient($supabaseUrl, $supabaseKey);

// Dati dei ruoli da inserire
$ruoli = [
    ['livello' => 3, 'ruolo' => 'Maitre', 'listino' => 15, 'fee_per_ora' => 4],
    ['livello' => 3, 'ruolo' => 'Pulizie', 'listino' => 15, 'fee_per_ora' => 5],
    ['livello' => 2, 'ruolo' => 'Barman', 'listino' => 12, 'fee_per_ora' => 3],
    ['livello' => 2, 'ruolo' => 'Chef de Rang', 'listino' => 12, 'fee_per_ora' => 3],
    ['livello' => 2, 'ruolo' => 'Banconista', 'listino' => 12, 'fee_per_ora' => 3],
    ['livello' => 2, 'ruolo' => 'Cuoco, sushi-man', 'listino' => 12, 'fee_per_ora' => 3],
    ['livello' => 1, 'ruolo' => 'Cameriere', 'listino' => 10, 'fee_per_ora' => 2],
    ['livello' => 1, 'ruolo' => 'Hostess/Steward', 'listino' => 10, 'fee_per_ora' => 2],
    ['livello' => 1, 'ruolo' => 'Lavapiatti', 'listino' => 10, 'fee_per_ora' => 2],
    ['livello' => 1, 'ruolo' => 'Pizzaiolo', 'listino' => 12, 'fee_per_ora' => 2],
    ['livello' => 1, 'ruolo' => 'Aiuto cuoco', 'listino' => 10, 'fee_per_ora' => 2],
    ['livello' => 2, 'ruolo' => 'Commis di sala', 'listino' => 12, 'fee_per_ora' => 2],
    ['livello' => 3, 'ruolo' => 'Trasferta/Notturno', 'listino' => 20, 'fee_per_ora' => 5],
    ['livello' => 1, 'ruolo' => 'Runner', 'listino' => 10, 'fee_per_ora' => 1.25],
    ['livello' => 2, 'ruolo' => 'Palmarista', 'listino' => 12, 'fee_per_ora' => 1.25],
];

echo "======================================================================\n";
echo "INSERIMENTO RUOLI PREDEFINITI\n";
echo "======================================================================\n\n";

$inseriti = 0;
$aggiornati = 0;
$errori = 0;

foreach ($ruoli as $ruolo) {
    try {
        // Verifica se esiste già
        $existing = $supabase->from('ruoli')
            ->select('id')
            ->eq('ruolo', $ruolo['ruolo'])
            ->limit(1)
            ->execute();
        
        if (!empty($existing->data)) {
            // Aggiorna se esiste
            $id = $existing->data[0]['id'];
            $supabase->request('PATCH', 'ruoli', $ruolo, ['id' => 'eq.' . $id]);
            echo "  [OK] Ruolo aggiornato: {$ruolo['ruolo']}\n";
            $aggiornati++;
        } else {
            // Inserisci se non esiste
            $result = $supabase->from('ruoli')->insert($ruolo)->execute();
            if (!empty($result->data)) {
                echo "  [OK] Ruolo inserito: {$ruolo['ruolo']}\n";
                $inseriti++;
            }
        }
    } catch (Exception $e) {
        echo "  [ERR] Errore per {$ruolo['ruolo']}: " . $e->getMessage() . "\n";
        $errori++;
    }
}

echo "\n" . str_repeat("=", 70) . "\n";
echo "[OK] COMPLETATO!\n";
echo "   - Ruoli inseriti: $inseriti\n";
echo "   - Ruoli aggiornati: $aggiornati\n";
if ($errori > 0) {
    echo "   - Errori: $errori\n";
}
echo str_repeat("=", 70) . "\n";

