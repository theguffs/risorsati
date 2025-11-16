# Istruzioni: Configurare Google Forms per inviare dati a Supabase

## 📋 Prerequisiti

1. Account Google con accesso a Google Forms
2. Token API generato dall'app Gestio (vedi pagina "Form Pubblici")
3. URL del tuo progetto Supabase

## 🚀 Passo 1: Crea il Google Form

1. Vai su https://forms.google.com
2. Crea un nuovo form
3. Aggiungi le domande necessarie con questi **nomi esatti**:

### Domande Obbligatorie:
- **"Luogo di lavoro"** (Menu a tendina o Elenco a discesa) - OBBLIGATORIO
  - Questo dropdown verrà popolato automaticamente con i ristoranti dell'utente
  - La risorsa deve selezionare dalla lista
- **"Data"** (Data) - OBBLIGATORIO
- **"Risorsa"** (Testo breve) - OBBLIGATORIO
  - Campo di testo dove la risorsa inserisce il proprio nome e cognome
  - Il nome verrà validato: se esiste nel database, il form può essere inviato
  - Se il nome non è registrato, apparirà un errore e il form non verrà inviato
  - Non importa se scrivi con maiuscole o minuscole (es. "mario rossi" = "Mario Rossi")

### Domande Opzionali:
- **"Ruolo"** (Menu a tendina o Elenco a discesa)
  - Questo dropdown verrà popolato automaticamente con i ruoli dell'utente
  - La risorsa può selezionare dalla lista OPPURE scrivere il proprio ruolo
- **"Orario Inizio"** (Ora o Testo breve)
  - **"Ora"** (consigliato): Mostra un selettore orario facile da usare
  - **"Testo breve"**: Permette di scrivere manualmente (formato: HH:MM, es. 09:00)
  - La risorsa inserisce l'orario di inizio del servizio
- **"Orario Fine"** (Ora o Testo breve)
  - **"Ora"** (consigliato): Mostra un selettore orario facile da usare
  - **"Testo breve"**: Permette di scrivere manualmente (formato: HH:MM, es. 17:00)
  - La risorsa inserisce l'orario di fine del servizio

**IMPORTANTE**: 
- I nomi delle domande devono corrispondere ESATTAMENTE a quelli sopra (inclusi spazi e maiuscole/minuscole)
- "Luogo di lavoro" e "Ruolo" devono essere dropdown ("Menu a tendina" o "Elenco a discesa")
- "Risorsa" deve essere un campo di testo ("Testo breve")
- Il nome della risorsa verrà validato: se non esiste nel database, il form non verrà inviato

## 🔧 Passo 2: Configura Google Apps Script

1. Nel tuo Google Form, clicca sui **tre puntini (⋮)** in alto a destra
2. Seleziona **"Script editor"**
3. Cancella tutto il codice esistente
4. Copia e incolla il contenuto del file `template-form-submit.js`
5. **Modifica la configurazione**:
   - Sostituisci `SUPABASE_URL` con il tuo URL Supabase (es. `https://xxxxx.supabase.co`)
   - Sostituisci `FORM_TOKEN` con il token generato dall'app Gestio

## 📝 Passo 3: Popola i Dropdown Automaticamente

1. Nel Google Apps Script, salva il file
2. Esegui la funzione `onOpen()` manualmente:
   - Clicca su **"Esegui"** (icona play)
   - Seleziona `onOpen` dal menu a tendina
   - Clicca su **"Esegui"**
3. Lo script popolerà automaticamente i dropdown con:
   - **Cliente**: Tutti i ristoranti del tuo account
   - **Risorsa**: Tutte le risorse del tuo account
   - **Ruolo**: Tutti i ruoli del tuo account

**Nota**: I dropdown possono essere di tipo "Menu a tendina" o "Elenco a discesa" (non "Caselle di controllo").

## 🔐 Passo 4: Autorizza lo Script

1. Nel Google Apps Script, clicca su **"Salva"** (icona floppy disk)
2. Clicca su **"Esegui"** (icona play) → Seleziona `testOptions` per testare il caricamento opzioni
3. Google ti chiederà di autorizzare lo script:
   - Clicca su **"Verifica autorizzazioni"**
   - Seleziona il tuo account Google
   - Clicca su **"Avanzate"** → **"Vai a [nome progetto] (non sicuro)"**
   - Clicca su **"Consenti"**

## ⚙️ Passo 5: Crea il Trigger

1. Nel Google Apps Script, clicca su **"Modifica"** → **"Trigger"**
2. Clicca su **"Aggiungi trigger"** (in basso a destra)
3. Configura il trigger:
   - **Funzione da eseguire**: `onFormSubmit`
   - **Origine evento**: `Dal modulo`
   - **Tipo di evento**: `All'invio del modulo`
4. Clicca su **"Salva"**

## 🔄 Passo 6: Aggiorna i Dropdown Periodicamente (Opzionale)

Se aggiungi nuovi ristoranti, risorse o ruoli nell'app, puoi aggiornare i dropdown del form:

1. Apri lo Script Editor del form
2. Esegui manualmente la funzione `onOpen()`
3. I dropdown verranno aggiornati con le nuove opzioni

**Suggerimento**: Puoi creare un trigger periodico per aggiornare automaticamente i dropdown ogni giorno.

## ✅ Passo 7: Test

1. Vai al tuo Google Form
2. Verifica che i dropdown siano popolati con le opzioni corrette
3. Compila e invia un form di test
4. Controlla i log in Google Apps Script:
   - Vai su **"Esecuzioni"** nel menu laterale
   - Verifica che non ci siano errori
5. Controlla nell'app Gestio che il servizio sia stato inserito correttamente nella tabella Servizi

## 🐛 Risoluzione Problemi

### I dropdown sono vuoti
- Verifica che il token sia attivo nell'app
- Esegui manualmente `onOpen()` nello script
- Controlla i log per errori di connessione
- Verifica che i nomi delle domande corrispondano esattamente

### Errore: "Token non valido"
- Verifica che il token nell'app sia attivo
- Controlla di aver copiato il token completo senza spazi
- Se hai rigenerato il token, usa il nuovo token

### Errore: "Campi obbligatori mancanti"
- Verifica che le domande "Cliente" e "Data" siano compilate
- Controlla che i nomi delle domande corrispondano esattamente a quelli in `FIELD_MAPPING`

### I dropdown non si aggiornano
- Esegui manualmente `onOpen()` nello script
- Verifica che le domande siano di tipo "Menu a tendina" o "Elenco a discesa"
- Controlla che i nomi delle domande contengano le parole chiave (cliente, risorsa, ruolo)

### Il form non invia dati
- Verifica che il trigger sia configurato correttamente
- Controlla i log in Google Apps Script → "Esecuzioni"
- Assicurati di aver autorizzato lo script

## 📞 Supporto

Se hai problemi, controlla:
1. I log in Google Apps Script
2. I log della Edge Function in Supabase Dashboard
3. La pagina "Form Pubblici" nell'app per vedere statistiche di utilizzo
