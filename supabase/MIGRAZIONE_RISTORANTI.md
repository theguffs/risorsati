# Migrazione Ristoranti - Solo Nome

## 📋 Cosa cambia

La tabella `ristoranti` viene semplificata:
- ❌ **Rimosso**: campo `codice` 
- ❌ **Rimosso**: campo `codice_completo` (generated column)
- ✅ **Mantenuto**: campo `nome` (ora univoco)

## 🔧 Passi da seguire

### 1. Esegui la migrazione del database

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `migrate_ristoranti_solo_nome.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

Questo script:
- Rimuove il vincolo UNIQUE su `codice`
- Rimuove la colonna `codice_completo`
- Rimuove la colonna `codice`
- Aggiunge vincolo UNIQUE su `nome`

### 2. Inserisci i ristoranti (opzionale)

Se vuoi inserire i 65 ristoranti dalla lista:

1. Nel **SQL Editor**, crea una nuova query
2. Copia e incolla il contenuto del file `insert_ristoranti_solo_nome.sql`
3. Clicca su **Run**

### 3. Verifica

Dopo la migrazione, verifica che:
- La tabella `ristoranti` abbia solo le colonne: `id`, `nome`, `created_at`, `updated_at`
- Il campo `nome` sia univoco
- L'applicazione funzioni correttamente

## ⚠️ Attenzione

- **Backup**: Prima di eseguire la migrazione, assicurati di avere un backup del database
- **Dati esistenti**: Se hai già dati nella tabella `ristoranti`, verranno mantenuti ma perderanno il campo `codice`
- **Relazioni**: Se altre tabelle fanno riferimento a `ristoranti.codice`, dovranno essere aggiornate

## 📝 Note

- Il campo `nome` è ora univoco, quindi non puoi avere due ristoranti con lo stesso nome
- L'applicazione React è già stata aggiornata per usare solo il campo `nome`
- Il form ora mostra solo il campo "Nome Ristorante"

