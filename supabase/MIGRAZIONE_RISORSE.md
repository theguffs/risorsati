# Migrazione Risorse - Solo Nome

## 📋 Cosa cambia

La tabella `risorse` viene semplificata:
- ❌ **Rimosso**: campo `codice` 
- ❌ **Rimosso**: campo `codice_completo` (generated column)
- ✅ **Mantenuto**: campo `nome` (ora univoco)

## 🔧 Passi da seguire

### 1. Esegui la migrazione del database

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `migrate_risorse_solo_nome.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

Questo script:
- Rimuove il vincolo UNIQUE su `codice`
- Rimuove la colonna `codice_completo`
- Rimuove la colonna `codice`
- Aggiunge vincolo UNIQUE su `nome`

### 2. Verifica

Dopo la migrazione, verifica che:
- La tabella `risorse` abbia solo le colonne: `id`, `nome`, `created_at`, `updated_at`
- Il campo `nome` sia univoco
- L'applicazione funzioni correttamente

## ⚠️ Attenzione

- **Backup**: Prima di eseguire la migrazione, assicurati di avere un backup del database
- **Dati esistenti**: Se hai già dati nella tabella `risorse`, verranno mantenuti ma perderanno il campo `codice`
- **Relazioni**: Le tabelle `servizi` e `fissi` che fanno riferimento a `risorse` continueranno a funzionare (usano `risorsa_id` che rimane invariato)

## 📝 Note

- Il campo `nome` è ora univoco, quindi non puoi avere due risorse con lo stesso nome
- L'applicazione React è già stata aggiornata per usare solo il campo `nome`
- Il form ora mostra solo il campo "Nome Completo"
- Le query nei servizi sono state aggiornate per non cercare più il campo `codice`

