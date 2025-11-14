# Svuotamento Dati

## 📋 Cosa fa questo script

Lo script `clear_all_data.sql` elimina **tutti i dati** dalle tabelle principali:
- `ruoli`
- `ristoranti`
- `risorse`
- `servizi`
- `fissi`
- `servizi_svizzera`

## ✅ Cosa NON tocca

- **Tabelle di autenticazione**: `auth.users`, `auth.sessions`, etc. (rimangono intatte)
- **Struttura delle tabelle**: Le tabelle rimangono con la stessa struttura
- **Policies RLS**: Le policies rimangono attive
- **Indici e trigger**: Tutti gli indici e trigger rimangono intatti

## 🔧 Come eseguire

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `clear_all_data.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

## ⚠️ ATTENZIONE

- **Irreversibile**: Questa operazione è irreversibile! I dati eliminati non possono essere recuperati
- **Backup**: Se vuoi conservare i dati, esportali prima di eseguire lo script
- **Verifica**: Lo script include una query di verifica che mostra il conteggio dei record rimasti (dovrebbero essere tutti 0)

## 📊 Verifica

Dopo l'esecuzione, lo script mostra il conteggio dei record in ogni tabella. Tutti dovrebbero essere 0.

## 🔄 Dopo lo svuotamento

Dopo aver svuotato i dati, puoi:
1. Eseguire la migrazione `migrate_add_owner_email.sql` per aggiungere il campo `owner_email`
2. Eseguire `update_rls_policies_owner.sql` per aggiornare le policies
3. Inserire i dati solo per l'account `youssefabdelmalak01@gmail.com` usando gli script di inserimento

