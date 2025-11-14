# Migrazione Completa: Isolamento Dati per Utente

## 📋 Obiettivo

Ogni utente deve avere i propri dati isolati per:
- ✅ Ruoli
- ✅ Ristoranti
- ✅ Risorse
- ✅ Servizi
- ✅ Fissi

## 🔧 Passi da seguire (IN ORDINE)

### 1. Aggiungi il campo owner_email a tutte le tabelle

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `migrate_add_owner_email.sql`
6. Clicca su **Run**

Questo aggiunge `owner_email` a:
- `ruoli`
- `ristoranti`
- `risorse`
- `servizi`
- `fissi`

E assegna tutti i dati esistenti a `youssefabdelmalak01@gmail.com`.

### 2. Aggiorna le policies RLS

1. Nel **SQL Editor**, crea una nuova query
2. Copia e incolla il contenuto del file `update_rls_policies_owner.sql`
3. Clicca su **Run**

Questo aggiorna le policies per filtrare i dati per utente su tutte le tabelle.

### 3. Verifica

Dopo le migrazioni, verifica che tutto funzioni:

```sql
-- Verifica che owner_email esista in tutte le tabelle
SELECT column_name, table_name
FROM information_schema.columns
WHERE column_name = 'owner_email'
  AND table_name IN ('ruoli', 'ristoranti', 'risorse', 'servizi', 'fissi')
ORDER BY table_name;
```

## ✅ Risultato

Dopo la migrazione:
- Ogni utente vedrà solo i propri dati
- I dati esistenti sono assegnati a `youssefabdelmalak01@gmail.com`
- Quando un utente crea un nuovo record, viene automaticamente assegnato al suo account
- Le policies RLS garantiscono l'isolamento completo dei dati

## 📝 Modifiche al Codice

Ho già aggiornato i servizi JavaScript per aggiungere automaticamente `owner_email` quando si creano:
- ✅ Ruoli (`ruoliService.create`)
- ✅ Ristoranti (`ristorantiService.create`)
- ✅ Risorse (`risorseService.create`)
- ✅ Servizi (`serviziService.create`)
- ✅ Fissi (`fissiService.create` - nuovo servizio creato)

## ⚠️ Note Importanti

- **Backup**: Prima di eseguire le migrazioni, assicurati di avere un backup
- **Ordine**: Esegui le migrazioni nell'ordine indicato
- **Dati esistenti**: Tutti i dati esistenti vengono assegnati a `youssefabdelmalak01@gmail.com`
- **Nuovi dati**: I nuovi dati vengono automaticamente assegnati all'utente corrente

