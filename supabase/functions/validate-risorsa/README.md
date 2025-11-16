# Edge Function: validate-risorsa

## 📋 Descrizione

Questa Edge Function valida se una risorsa esiste nel database dell'utente. Viene usata per verificare che il nome inserito nel Google Form corrisponda a una risorsa registrata.

## 🔧 Deploy

### Opzione 1: Supabase Dashboard

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca su **Create a new function**
3. Nome: `validate-risorsa`
4. Copia il contenuto di `index.ts` nell'editor
5. Clicca su **Deploy**

### Opzione 2: Supabase CLI

```bash
supabase functions deploy validate-risorsa
```

## 🔑 Variabili d'Ambiente

La funzione usa automaticamente:
- `SUPABASE_URL`: URL del progetto (automatico)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (automatico)

## 📝 Endpoint

**URL**: `https://your-project.supabase.co/functions/v1/validate-risorsa`

**Method**: `POST`

**Headers**:
```
X-Form-Token: YOUR_FORM_TOKEN
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
apikey: YOUR_SUPABASE_ANON_KEY
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "risorsa_nome": "Mario Rossi"
}
```

**Response** (Success - Risorsa trovata):
```json
{
  "valid": true,
  "risorsa_id": "uuid-della-risorsa",
  "risorsa_nome": "Mario Rossi"
}
```

**Response** (Success - Risorsa non trovata):
```json
{
  "valid": false,
  "message": "Nome risorsa non registrato. Verifica di aver scritto correttamente nome e cognome."
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
- La ricerca è case-insensitive (non importa maiuscole/minuscole)
- La ricerca è limitata alle risorse dell'utente proprietario del token
- CORS è abilitato per permettere chiamate da Google Apps Script

## 📝 Note

- La ricerca è case-insensitive: "mario rossi" = "Mario Rossi" = "MARIO ROSSI"
- Gli spazi vengono rimossi all'inizio e alla fine del nome
- Se la risorsa viene trovata, viene restituito il nome esatto dal database

