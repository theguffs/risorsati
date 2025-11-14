<?php
// Script di test per verificare la struttura del file Excel

ini_set('memory_limit', '512M');
require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$excelFile = __DIR__ . '/../File Extra&Fissi 2025 - NEW.xlsx';

if (!file_exists($excelFile)) {
    echo "ERRORE: File Excel non trovato: $excelFile\n";
    exit(1);
}

echo "======================================================================\n";
echo "ANALISI FILE EXCEL\n";
echo "======================================================================\n\n";

try {
    echo "[INFO] Caricamento file Excel...\n";
    $spreadsheet = IOFactory::load($excelFile);
    
    echo "[OK] File caricato correttamente!\n\n";
    
    // Mostra tutti i fogli disponibili
    echo "FOGLI DISPONIBILI:\n";
    echo str_repeat("-", 70) . "\n";
    $sheetNames = $spreadsheet->getSheetNames();
    foreach ($sheetNames as $index => $name) {
        $sheet = $spreadsheet->getSheet($index);
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();
        echo sprintf("  %d. %s (Righe: %s, Colonne: %s)\n", 
            $index + 1, 
            $name, 
            $highestRow, 
            $highestColumn
        );
    }
    
    echo "\n" . str_repeat("=", 70) . "\n";
    echo "ANALISI FOGLIO 'ANAGRAFICA':\n";
    echo str_repeat("-", 70) . "\n";
    
    $sheet = $spreadsheet->getSheetByName('Anagrafica');
    if ($sheet) {
        echo "[OK] Foglio 'Anagrafica' trovato\n";
        echo "Righe totali: " . $sheet->getHighestRow() . "\n";
        echo "Colonne totali: " . $sheet->getHighestColumn() . "\n\n";
        
        // Mostra prime 5 righe
        echo "Prime 5 righe:\n";
        for ($row = 1; $row <= min(5, $sheet->getHighestRow()); $row++) {
            echo "Riga $row: ";
            for ($col = 1; $col <= 12; $col++) {
                $value = $sheet->getCellByColumnAndRow($col, $row)->getValue();
                echo "[" . ($value ? substr($value, 0, 20) : '') . "] ";
            }
            echo "\n";
        }
    } else {
        echo "[ERR] Foglio 'Anagrafica' NON trovato!\n";
    }
    
    echo "\n" . str_repeat("=", 70) . "\n";
    echo "ANALISI FOGLIO 'GENNAIO' (primo mese):\n";
    echo str_repeat("-", 70) . "\n";
    
    $sheet = $spreadsheet->getSheetByName('GENNAIO');
    if ($sheet) {
        echo "[OK] Foglio 'GENNAIO' trovato\n";
        echo "Righe totali: " . $sheet->getHighestRow() . "\n";
        echo "Colonne totali: " . $sheet->getHighestColumn() . "\n\n";
        
        // Mostra intestazioni (riga 2)
        echo "Intestazioni (riga 2):\n";
        $highestColumn = $sheet->getHighestColumn();
        $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
        for ($col = 1; $col <= min(15, $highestColumnIndex); $col++) {
            $header = $sheet->getCellByColumnAndRow($col, 2)->getValue();
            echo "  Col $col: " . ($header ? $header : '(vuoto)') . "\n";
        }
        
        // Mostra prime 3 righe dati
        echo "\nPrime 3 righe dati:\n";
        for ($row = 3; $row <= min(5, $sheet->getHighestRow()); $row++) {
            echo "Riga $row: ";
            for ($col = 1; $col <= min(10, $highestColumnIndex); $col++) {
                $value = $sheet->getCellByColumnAndRow($col, $row)->getValue();
                echo "[" . ($value ? substr((string)$value, 0, 15) : '') . "] ";
            }
            echo "\n";
        }
    } else {
        echo "[ERR] Foglio 'GENNAIO' NON trovato!\n";
    }
    
    echo "\n" . str_repeat("=", 70) . "\n";
    echo "[OK] Analisi completata!\n";
    echo str_repeat("=", 70) . "\n";
    
} catch (Exception $e) {
    echo "\n[ERR] Errore durante l'analisi: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}





