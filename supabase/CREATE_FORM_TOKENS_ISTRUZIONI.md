# Creazione Tabella Form Tokens

## 📋 Obiettivo

Creare la tabella per gestire i token API che permettono ai Google Forms di inviare dati alla tabella `servizi`.

## 🚀 Passi da seguire

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `create_form_tokens_table.sql`
6. Clicca su **Run**

## ✅ Verifica

Dopo l'esecuzione, verifica che la tabella sia stata creata:

```sql
SELECT * FROM form_tokens LIMIT 1;
```

## 📝 Cosa fa questo script

- Crea la tabella `form_tokens` con:
  - `id`: ID univoco
  - `owner_email`: Email del proprietario del token
  - `token`: Token segreto univoco per l'API
  - `nome_form`: Nome descrittivo del form (opzionale)
  - `attivo`: Flag per abilitare/disabilitare il token
  - `created_at`, `updated_at`: Timestamp
  - `last_used_at`: Ultima volta che il token è stato usato
  - `total_submissions`: Contatore totale di invii

- Crea indici per performance
- Configura RLS policies per isolamento dati per utente
- Aggiunge trigger per aggiornare `updated_at`

