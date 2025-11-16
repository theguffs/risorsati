# Implementazione Form Pubblici - Guida Completa

## 📋 Panoramica

Questa implementazione permette agli utenti di creare Google Forms che inviano automaticamente dati alla tabella `servizi` del loro account.

## 🚀 Passi da Seguire (IN ORDINE)

### Passo 1: Crea la Tabella Form Tokens

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor**
4. Clicca su **New Query**
5. Copia e incolla il contenuto di `create_form_tokens_table.sql`
6. Clicca su **Run**

**Verifica**: Esegui `SELECT * FROM form_tokens LIMIT 1;` per verificare che la tabella esista.

### Passo 2: Deploy delle Edge Functions

Devi deployare DUE funzioni:

#### Funzione 1: submit-form (per ricevere i dati)

**Opzione A: Supabase Dashboard (Consigliato)**

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Se non hai ancora creato funzioni, clicca su **Create a new function**
3. Nome funzione: `submit-form`
4. Copia il contenuto di `supabase/functions/submit-form/index.ts` nell'editor
5. Clicca su **Deploy**

**Opzione B: Supabase CLI**

```bash
supabase functions deploy submit-form
```

#### Funzione 2: get-form-options (per ottenere le opzioni dei dropdown)

**Opzione A: Supabase Dashboard**

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Clicca su **Create a new function**
3. Nome funzione: `get-form-options`
4. Copia il contenuto di `supabase/functions/get-form-options/index.ts` nell'editor
5. Clicca su **Deploy**

**Opzione B: Supabase CLI**

```bash
supabase functions deploy get-form-options
```

**Verifica**: Dopo il deploy, gli endpoint saranno disponibili a:
- `https://your-project.supabase.co/functions/v1/submit-form`
- `https://your-project.supabase.co/functions/v1/get-form-options`

### Passo 3: Test dell'Implementazione

1. Accedi all'app Gestio
2. Vai su **"Form Pubblici"** nella sidebar
3. Clicca su **"+ Crea Nuovo Token"**
4. Inserisci un nome (opzionale) e clicca **"Crea Token"**
5. Copia il **Token API** e l'**URL Endpoint**

### Passo 4: Configura Google Forms

Segui le istruzioni dettagliate in `google-apps-script/ISTRUZIONI_GOOGLE_FORMS.md`

**Riassunto rapido**:
1. Crea un Google Form con i campi necessari
2. Apri "Script editor" nel form
3. Copia il template da `google-apps-script/template-form-submit.js`
4. Sostituisci `SUPABASE_URL` e `FORM_TOKEN`
5. Crea un trigger "All'invio del modulo"

## 📝 Struttura Dati

### Campi Obbligatori
- `cliente`: Nome del cliente/ristorante
- `data`: Data del servizio (formato: YYYY-MM-DD)

### Campi Opzionali
- `risorsa_nome`: Nome della risorsa (se esiste nel DB, viene collegata automaticamente)
- `ruolo_nome`: Nome del ruolo (se esiste nel DB, viene collegato automaticamente)
- `orario_inizio`: Orario di inizio (formato: HH:MM, es. 09:00)
- `orario_fine`: Orario di fine (formato: HH:MM, es. 17:00)

## 🔐 Sicurezza

- Ogni token è univoco e legato a un utente specifico
- I token possono essere disattivati senza eliminarli
- I dati vengono inseriti automaticamente con `owner_email` dell'utente proprietario del token
- Le RLS policies garantiscono che ogni utente veda solo i propri dati

## ✅ Funzionalità

- **Creazione token**: Ogni utente può creare più token
- **Attivazione/Disattivazione**: I token possono essere temporaneamente disattivati
- **Rigenerazione**: I token possono essere rigenerati (il vecchio smette di funzionare)
- **Statistiche**: Vedi quanti invii ha fatto ogni token e quando è stato usato l'ultima volta
- **Eliminazione**: I token possono essere eliminati

## 🐛 Troubleshooting

### Il form non invia dati
1. Verifica che il token sia attivo nell'app
2. Controlla i log in Google Apps Script
3. Verifica che l'URL Supabase sia corretto
4. Controlla i log della Edge Function in Supabase Dashboard

### Errore "Token non valido"
1. Verifica di aver copiato il token completo
2. Controlla che il token sia attivo
3. Se hai rigenerato il token, usa il nuovo token nel Google Apps Script

### I dati non compaiono nella tabella servizi
1. Verifica che i campi obbligatori siano presenti
2. Controlla che il formato della data sia corretto (YYYY-MM-DD)
3. Verifica i log della Edge Function per errori specifici

## 📚 File Creati

1. `supabase/create_form_tokens_table.sql` - Script SQL per creare la tabella
2. `supabase/functions/submit-form/index.ts` - Edge Function per ricevere dati
3. `src/services/formTokensService.js` - Servizio per gestire i token
4. `src/pages/FormPubblici.jsx` - Pagina per gestire i token
5. `google-apps-script/template-form-submit.js` - Template per Google Apps Script
6. `google-apps-script/ISTRUZIONI_GOOGLE_FORMS.md` - Istruzioni dettagliate

