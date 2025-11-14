# Setup Database Supabase

## 📋 Prerequisiti

1. Account Supabase (crea un progetto su https://supabase.com)
2. PHP 7.4+ (per lo script di importazione)
3. File Excel: `File Extra&Fissi 2025 - NEW.xlsx` nella root del progetto

## 🚀 Passo 1: Crea il Database

### Opzione A: Supabase Dashboard (Consigliato)

**IMPORTANTE:** Se le tabelle sono già state create (vedi lo schema SQL nel database), salta al **Passo 1B** per completare lo schema.

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto (o creane uno nuovo)
3. Vai su **SQL Editor** nel menu laterale
4. Clicca su **New Query**
5. Copia e incolla il contenuto completo di `supabase/schema.sql`
6. Clicca su **Run** (o premi Ctrl+Enter)
7. Verifica che tutte le tabelle siano state create correttamente

### Passo 1B: Completa lo Schema (IMPORTANTE!)

Se le tabelle sono già state create ma mancano indici, funzioni, trigger, viste e RLS:

1. Vai su **SQL Editor** in Supabase Dashboard
2. Clicca su **New Query**
3. Copia e incolla il contenuto completo di `supabase/schema_complete.sql`
4. Clicca su **Run** (o premi Ctrl+Enter)
5. Verifica che tutto sia stato creato correttamente

**Questo script aggiunge:**
- ✅ Indici per ottimizzare le query
- ✅ Funzioni SQL per calcoli automatici (calcola_paga, calcola_fee)
- ✅ Trigger per aggiornare automaticamente `updated_at`
- ✅ Viste per dashboard e reporting
- ✅ Row Level Security (RLS) policies

### Opzione B: Supabase CLI

```bash
# Installa Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al tuo progetto
supabase link --project-ref your-project-ref

# Applica lo schema
supabase db push
```

## 🔑 Passo 2: Configura le Variabili d'Ambiente

Crea un file `.env` nella root del progetto con:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Dove trovare le credenziali:**
1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 📥 Passo 3: Importa i Dati dall'Excel

### Installa le dipendenze PHP

**Opzione A: Con Composer (consigliato)**

Se hai Composer installato:
```bash
composer install
```

**Opzione B: Installa Composer**

Se non hai Composer:
1. Scarica Composer da: https://getcomposer.org/download/
2. Segui le istruzioni per Windows
3. Oppure scarica `composer.phar` e usalo direttamente:
   ```bash
   php composer.phar install
   ```

**Opzione C: Installa PhpSpreadsheet manualmente**

Se non vuoi usare Composer, puoi scaricare PhpSpreadsheet manualmente:
1. Scarica da: https://github.com/PHPOffice/PhpSpreadsheet/releases
2. Estrai nella cartella `vendor/phpoffice/phpspreadsheet`
3. Modifica lo script per caricare le classi manualmente

### Esegui lo script di importazione

**Con file .env:**
```bash
php supabase/import_excel_data.php
```

**Con argomenti da riga di comando:**
```bash
php supabase/import_excel_data.php --url=https://your-project.supabase.co --key=your-anon-key
```

Lo script:
- ✅ Importa ruoli, ristoranti e risorse dalla tabella Anagrafica
- ✅ Importa tutti i servizi dai fogli mensili (Gennaio, Febbraio, ecc.)
- ✅ Importa le assunzioni fisse dal foglio FISSI
- ✅ Collega automaticamente risorse e ruoli tramite ID

**Nota:** Lo script potrebbe richiedere alcuni minuti per importare tutti i dati.

## ✅ Verifica

Dopo l'importazione, verifica i dati:

1. Vai su Supabase Dashboard → **Table Editor**
2. Controlla che le tabelle contengano i dati:
   - `ruoli` - Dovrebbe avere tutti i ruoli
   - `ristoranti` - Dovrebbe avere tutti i clienti
   - `risorse` - Dovrebbe avere tutti i dipendenti
   - `servizi` - Dovrebbe avere tutti i servizi mensili
   - `fissi` - Dovrebbe avere le assunzioni fisse

## 🔍 Query di Test

Puoi testare il database con queste query nel SQL Editor:

```sql
-- Conta i servizi per mese
SELECT mese, anno, COUNT(*) as totale
FROM servizi
GROUP BY mese, anno
ORDER BY anno DESC, mese DESC;

-- Fatturato totale per cliente
SELECT cliente, SUM(paga + fee) as fatturato_totale
FROM servizi
GROUP BY cliente
ORDER BY fatturato_totale DESC;

-- Usa la vista dashboard
SELECT * FROM vista_dashboard;
```

## 🐛 Risoluzione Problemi

### Errore: "relation does not exist"
- Assicurati di aver eseguito lo script `schema.sql` completamente
- Controlla che non ci siano errori nella console SQL

### Errore: "permission denied"
- Verifica che RLS (Row Level Security) sia configurato correttamente
- Assicurati di essere autenticato quando esegui le query

### Errore durante l'importazione PHP
- Verifica che il file Excel sia nella root del progetto
- Controlla che le variabili d'ambiente siano configurate correttamente
- Assicurati che PhpSpreadsheet sia installato (via Composer o manualmente)
- Verifica che PHP abbia l'estensione `curl` abilitata: `php -m | findstr curl`

## 📚 Prossimi Passi

Dopo aver configurato il database:
1. ✅ Il database è pronto per essere usato dall'app React
2. ✅ Puoi iniziare a sviluppare le interfacce per visualizzare e gestire i dati
3. ✅ Le funzioni SQL automatiche calcoleranno durata, paga e fee

