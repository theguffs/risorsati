# Ordine Corretto delle Migrazioni

## ⚠️ IMPORTANTE: Esegui le migrazioni in questo ordine!

### 1. Prima: Aggiungi il campo owner_email

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `migrate_add_owner_email.sql`
6. Clicca su **Run**

Questo aggiunge il campo `owner_email` alle tabelle `ruoli`, `ristoranti`, `risorse`.

### 2. Secondo: Aggiorna le policies RLS

1. Nel **SQL Editor**, crea una nuova query
2. Copia e incolla il contenuto del file `update_rls_policies_owner.sql`
3. Clicca su **Run**

Questo aggiorna le policies per filtrare i dati per utente.

### 3. Terzo: Inserisci i dati

Ora puoi inserire i dati con `owner_email`:

- Per `hrspecialistey@gmail.com`: esegui `insert_ruoli_hrspecialistey.sql`
- Per `youssefabdelmalak01@gmail.com`: esegui gli script di inserimento con `owner_email`

## 🔍 Verifica

Dopo la migrazione, verifica che il campo esista:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ruoli' AND column_name = 'owner_email';
```

Se la query restituisce un risultato, il campo è stato aggiunto correttamente.

