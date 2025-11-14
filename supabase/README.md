# Schema Database Supabase - Risorsati

Questo documento descrive lo schema del database creato per replicare la struttura del file Excel.

## 📋 Struttura Database

### Tabelle Principali

1. **ruoli** - Ruoli lavorativi con tariffari
   - `livello`: Livello gerarchico
   - `ruolo`: Nome del ruolo (es. "Cameriere", "Chef de Rang")
   - `listino`: Tariffa oraria per la paga (€/h)
   - `fee_per_ora`: Tariffa oraria per il fee (€/h)

2. **ristoranti** - Anagrafica clienti/ristoranti
   - `codice`: Codice univoco (es. "C1")
   - `nome`: Nome del ristorante
   - `codice_completo`: Generato automaticamente come "codice-nome"

3. **risorse** - Anagrafica dipendenti/risorse
   - `codice`: Codice univoco (es. "R1")
   - `nome`: Nome completo della risorsa
   - `codice_completo`: Generato automaticamente come "codice-nome"

4. **servizi** - Tabella unificata per tutti i servizi mensili
   - `cliente`: Nome del cliente
   - `data`: Data del servizio
   - `mese`, `anno`: Generati automaticamente dalla data
   - `risorsa_id`: Riferimento alla tabella risorse
   - `risorsa_nome`: Nome risorsa (per compatibilità)
   - `ruolo_id`: Riferimento alla tabella ruoli
   - `ruolo_nome`: Nome ruolo (per compatibilità)
   - `orario_inizio`, `orario_fine`: Orari del servizio
   - `durata_ore`: Calcolata automaticamente
   - `durata_ore_numeric`: Durata in ore (numero)
   - `paga`: Calcolata o inserita manualmente
   - `fee`: Calcolata o inserita manualmente

5. **fissi** - Assunzioni fisse
   - `cliente`: Nome del cliente
   - `data`: Data assunzione
   - `mese`: Generato automaticamente
   - `risorsa_id`, `risorsa_nome`: Risorsa assunta
   - `ruolo_id`, `ruolo_nome`: Ruolo
   - `orari_diurni`, `orari_serali`: Orari di lavoro
   - `colloquio`, `prova`, `assunzione`: Flag booleani
   - `fee`: Fee per l'assunzione

6. **servizi_svizzera** - Servizi speciali per la Svizzera
   - `data`: Data del servizio
   - `ora_inizio`, `ora_fine`: Orari
   - `ore`: Durata in ore
   - `paga`, `fee`: Compensi
   - `luogo`: Luogo del servizio
   - `persona`: Nome della persona
   - `benzina`: Flag per rimborso benzina

## 🔧 Funzioni SQL

### `calcola_paga(durata_ore_numeric, ruolo_id)`
Calcola automaticamente la paga basata sulla durata e sul listino del ruolo.

### `calcola_fee(cliente_nome, durata_ore_numeric, ruolo_id)`
Calcola automaticamente il fee, applicando la riduzione del 50% per clienti speciali:
- Nuova Arena
- Pedevilla
- Hosteria Della Musica

## 📊 Viste

### `vista_fatturato_mensile`
Vista aggregata per cliente/mese con:
- Numero servizi
- Totale paga
- Totale fee
- Fatturato totale

### `vista_dashboard`
Vista generale per dashboard con:
- Totale clienti
- Totale servizi
- Fatturato totale
- Durata media servizi

## 🔐 Sicurezza (RLS)

Tutte le tabelle hanno Row Level Security (RLS) abilitato:
- Solo utenti autenticati possono vedere i dati
- Solo utenti autenticati possono inserire/modificare/eliminare dati

## 🚀 Come Applicare lo Schema

### Opzione 1: Supabase Dashboard (Consigliato)

1. Vai al tuo progetto Supabase: https://supabase.com/dashboard
2. Vai su **SQL Editor**
3. Copia e incolla il contenuto di `schema.sql`
4. Esegui lo script

### Opzione 2: Supabase CLI

```bash
# Installa Supabase CLI se non l'hai già
npm install -g supabase

# Login
supabase login

# Link al tuo progetto
supabase link --project-ref your-project-ref

# Applica lo schema
supabase db push
```

### Opzione 3: Import Script PHP

Usa lo script `import_excel_data.php` per importare automaticamente i dati dall'Excel:

```bash
# Installa le dipendenze (se necessario)
composer install

# Esegui lo script
php supabase/import_excel_data.php
```

Vedi [README_PHP.md](README_PHP.md) per la documentazione completa dello script PHP.

## 📝 Note Importanti

1. **Campi Calcolati**: I campi `durata_ore`, `durata_ore_numeric`, `mese`, `anno` sono generati automaticamente
2. **Codici Completi**: I campi `codice_completo` in `ristoranti` e `risorse` sono generati automaticamente
3. **Trigger**: Il campo `updated_at` viene aggiornato automaticamente ad ogni modifica
4. **Indici**: Sono stati creati indici per ottimizzare le query più comuni

## 🔄 Migrazioni Future

Per aggiungere modifiche allo schema:

1. Crea un nuovo file di migrazione: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Aggiungi le modifiche necessarie
3. Applica la migrazione tramite Supabase Dashboard o CLI


