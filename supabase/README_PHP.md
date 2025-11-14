# Importazione Dati con PHP

Script PHP per importare i dati dal file Excel nel database Supabase.

## 📋 Prerequisiti

1. PHP 7.4 o superiore
2. Composer installato
3. File Excel: `File Extra&Fissi 2025 - NEW.xlsx` nella root del progetto

## 🚀 Installazione

1. Installa le dipendenze con Composer:

```bash
composer install
```

Questo installerà:
- `phpoffice/phpspreadsheet` - Per leggere file Excel

Lo script usa direttamente le API REST di Supabase tramite cURL (non richiede librerie aggiuntive).

## ⚙️ Configurazione

Crea un file `.env` nella root del progetto con:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Oppure passa le credenziali come argomenti:

```bash
php supabase/import_excel_data.php --url=https://your-project.supabase.co --key=your-anon-key
```

## 🎯 Uso

### Opzione 1: Con file .env

```bash
php supabase/import_excel_data.php
```

### Opzione 2: Con argomenti da riga di comando

```bash
php supabase/import_excel_data.php --url=https://your-project.supabase.co --key=your-anon-key
```

## 📊 Cosa Importa

Lo script importa:

1. **Anagrafica** (dal foglio "Anagrafica"):
   - Ruoli (livello, ruolo, listino, fee_per_ora)
   - Ristoranti (codice, nome)
   - Risorse (codice, nome)

2. **Servizi Mensili** (dai fogli Gennaio-Dicembre):
   - Cliente, data, risorsa, ruolo
   - Orari (inizio, fine)
   - Paga e fee

3. **Assunzioni Fisse** (dal foglio "FISSI"):
   - Cliente, data, risorsa, ruolo
   - Orari diurni/serali
   - Flag colloquio, prova, assunzione
   - Fee

4. **Servizi Svizzera** (dal foglio "SVIZZERA" o varianti):
   - Data, orari (inizio, fine)
   - Ore, paga, fee
   - Luogo, persona
   - Flag benzina

## 🔍 Note

- Lo script verifica se i record esistono già prima di inserirli (evita duplicati)
- Gli orari vengono convertiti automaticamente da vari formati Excel
- Le date vengono convertite dal formato seriale Excel
- Lo script mostra il progresso durante l'importazione

## 🐛 Risoluzione Problemi

### Errore: "Class not found"
Assicurati di aver eseguito `composer install`

### Errore: "File Excel non trovato"
Verifica che il file Excel sia nella root del progetto con il nome esatto:
`File Extra&Fissi 2025 - NEW.xlsx`

### Errore: "SUPABASE_URL e SUPABASE_ANON_KEY sono obbligatori"
Configura le variabili nel file `.env` o passale come argomenti

