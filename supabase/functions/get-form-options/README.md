# Edge Function: get-form-options

## 📋 Descrizione

Questa Edge Function restituisce le opzioni (ristoranti, risorse, ruoli) per popolare i dropdown del Google Form. Le opzioni sono filtrate per l'utente proprietario del token.

## 🔧 Deploy

### Opzione 1: Supabase Dashboard

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca su **Create a new function**
3. Nome: `get-form-options`
4. Copia il contenuto di `index.ts` nell'editor
5. Clicca su **Deploy**

### Opzione 2: Supabase CLI

```bash
supabase functions deploy get-form-options
```

## 🔑 Variabili d'Ambiente

La funzione usa automaticamente:
- `SUPABASE_URL`: URL del progetto (automatico)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (automatico)

## 📝 Endpoint

**URL**: `https://your-project.supabase.co/functions/v1/get-form-options`

**Method**: `GET`

**Headers**:
```
Authorization: Bearer YOUR_FORM_TOKEN
```

**Response** (Success):
```json
{
  "success": true,
  "ristoranti": ["Ristorante 1", "Ristorante 2", ...],
  "risorse": ["Risorsa 1", "Risorsa 2", ...],
  "ruoli": ["Ruolo 1", "Ruolo 2", ...]
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
- Le opzioni restituite sono solo quelle dell'utente proprietario del token
- CORS è abilitato per permettere chiamate da Google Apps Script

