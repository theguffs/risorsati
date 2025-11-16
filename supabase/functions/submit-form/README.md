# Edge Function: submit-form

## 📋 Descrizione

Questa Edge Function riceve dati da Google Apps Script e li inserisce nella tabella `servizi` dell'utente proprietario del token.

## 🔧 Deploy

### Opzione 1: Supabase Dashboard

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca su **Create a new function**
3. Nome: `submit-form`
4. Copia il contenuto di `index.ts` nell'editor
5. Clicca su **Deploy**

### Opzione 2: Supabase CLI

```bash
# Installa Supabase CLI se non l'hai già
npm install -g supabase

# Login
supabase login

# Link al progetto
supabase link --project-ref your-project-ref

# Deploy della funzione
supabase functions deploy submit-form
```

## 🔑 Variabili d'Ambiente

La funzione usa automaticamente:
- `SUPABASE_URL`: URL del progetto (automatico)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (automatico)

## 📝 Endpoint

**URL**: `https://your-project.supabase.co/functions/v1/submit-form`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer YOUR_FORM_TOKEN
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "cliente": "Nome Cliente",
  "data": "2025-01-15",
  "risorsa_nome": "Nome Risorsa",
  "ruolo_nome": "Nome Ruolo",
  "orario_inizio": "09:00",
  "orario_fine": "17:00"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Servizio inserito con successo",
  "id": "uuid-del-servizio"
}
```

**Response** (Error):
```json
{
  "error": "Messaggio di errore"
}
```

## 🔐 Sicurezza

- Il token viene validato contro la tabella `form_tokens`
- Solo token attivi possono essere usati
- I dati vengono inseriti con `owner_email` del proprietario del token
- CORS è abilitato per permettere chiamate da Google Apps Script

