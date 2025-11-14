# Migrazione: Aggiunta owner_email per isolamento dati per utente

## 📋 Problema

Attualmente tutti gli utenti autenticati vedono tutti i dati (ruoli, ristoranti, risorse). Vogliamo che ogni utente veda solo i propri dati.

## 🔧 Soluzione

Aggiungiamo un campo `owner_email` alle tabelle e aggiorniamo le policies RLS per filtrare i dati in base all'email dell'utente corrente.

## 📝 Passi da seguire

### 1. Aggiungi il campo owner_email alle tabelle

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `migrate_add_owner_email.sql`
6. Clicca su **Run**

Questo script:
- Aggiunge `owner_email` alle tabelle `ruoli`, `ristoranti`, `risorse`
- Imposta tutti i dati esistenti come appartenenti a `youssefabdelmalak01@gmail.com`
- Rende il campo NOT NULL
- Crea indici per migliorare le performance

### 2. Aggiorna le policies RLS

1. Nel **SQL Editor**, crea una nuova query
2. Copia e incolla il contenuto del file `update_rls_policies_owner.sql`
3. Clicca su **Run**

Questo script:
- Rimuove le vecchie policies che permettono a tutti di vedere tutto
- Crea nuove policies che filtrano i dati in base all'email dell'utente corrente
- Ogni utente vedrà solo i propri dati

## ✅ Risultato

Dopo la migrazione:
- Ogni utente vedrà solo i propri ruoli, ristoranti e risorse
- I dati esistenti sono assegnati a `youssefabdelmalak01@gmail.com`
- Quando un utente crea un nuovo record, viene automaticamente assegnato al suo account
- Le policies RLS garantiscono l'isolamento dei dati

## ⚠️ Note importanti

- **Backup**: Prima di eseguire la migrazione, assicurati di avere un backup del database
- **Dati esistenti**: Tutti i dati esistenti vengono assegnati a `youssefabdelmalak01@gmail.com`
- **Nuovi record**: I nuovi record creati dall'app vengono automaticamente assegnati all'utente corrente (già implementato nei servizi)

## 🔍 Verifica

Dopo la migrazione, verifica:
1. Accedi con `youssefabdelmalak01@gmail.com` → dovresti vedere tutti i dati
2. Accedi con un altro account → non dovresti vedere nessun dato (o solo quelli che hai creato tu)

