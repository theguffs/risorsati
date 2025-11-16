# 🚀 Guida Passo-Passo: Creare il Google Form

## 📋 PREREQUISITI

Prima di iniziare, assicurati di avere:
1. ✅ Un account Google
2. ✅ Un token API generato dall'app Gestio (vai su "Form Pubblici" e crea un token)
3. ✅ L'URL del tuo progetto Supabase (es. `https://xxxxx.supabase.co`)

---

## PASSO 1: Crea il Google Form

### 1.1 Apri Google Forms
1. Vai su **https://forms.google.com**
2. Accedi con il tuo account Google se necessario
3. Clicca su **"Vuoto"** (o **"Blank"**) per creare un nuovo form

### 1.2 Imposta il Titolo
1. Clicca su **"Modulo senza titolo"** in alto
2. Scrivi un titolo, ad esempio: **"Inserimento Servizio"**
3. (Opzionale) Aggiungi una descrizione sotto il titolo

### 1.3 Aggiungi la Prima Domanda: "Luogo di lavoro"
1. Clicca sul campo **"Domanda senza titolo"**
2. Scrivi esattamente: **`Luogo di lavoro`** (con L maiuscola e spazio tra le parole)
3. Clicca sull'icona del menu a tendina a destra (o "Elenco a discesa")
4. Seleziona **"Menu a tendina"** o **"Elenco a discesa"**
5. ✅ Spunta **"Obbligatorio"** in basso a destra
6. **NON** aggiungere opzioni manualmente - verranno popolate automaticamente!

### 1.4 Aggiungi la Seconda Domanda: "Data"
1. Clicca su **"+"** per aggiungere una nuova domanda
2. Scrivi esattamente: **`Data`** (con la D maiuscola)
3. Clicca sull'icona del menu a tendina a destra
4. Seleziona **"Data"**
5. ✅ Spunta **"Obbligatorio"** in basso a destra

### 1.5 Aggiungi la Terza Domanda: "Risorsa"
1. Clicca su **"+"** per aggiungere una nuova domanda
2. Scrivi esattamente: **`Risorsa`** (con la R maiuscola)
3. Clicca sull'icona del menu a tendina a destra
4. Seleziona **"Testo breve"** (IMPORTANTE: non dropdown!)
5. ✅ Spunta **"Obbligatorio"** in basso a destra
6. (Opzionale) Aggiungi un suggerimento: "Inserisci nome e cognome"

### 1.6 Aggiungi la Quarta Domanda: "Ruolo"
1. Clicca su **"+"** per aggiungere una nuova domanda
2. Scrivi esattamente: **`Ruolo`** (con la R maiuscola)
3. Clicca sull'icona del menu a tendina a destra
4. Seleziona **"Menu a tendina"** o **"Elenco a discesa"**
5. ❌ **NON** spuntare "Obbligatorio" (è opzionale)
6. **NON** aggiungere opzioni manualmente

### 1.7 Aggiungi la Quinta Domanda: "Orario Inizio"
1. Clicca su **"+"** per aggiungere una nuova domanda
2. Scrivi esattamente: **`Orario Inizio`** (con O maiuscola e spazio)
3. Clicca sull'icona del menu a tendina a destra
4. Seleziona **"Ora"** (consigliato) OPPURE **"Testo breve"**
   - **"Ora"**: Più facile da usare, mostra un selettore orario
   - **"Testo breve"**: Permette di scrivere manualmente (es. 09:00)
5. ❌ **NON** spuntare "Obbligatorio" (è opzionale)

### 1.8 Aggiungi la Sesta Domanda: "Orario Fine"
1. Clicca su **"+"** per aggiungere una nuova domanda
2. Scrivi esattamente: **`Orario Fine`** (con O maiuscola e spazio)
3. Clicca sull'icona del menu a tendina a destra
4. Seleziona **"Ora"** (consigliato) OPPURE **"Testo breve"**
   - **"Ora"**: Più facile da usare, mostra un selettore orario
   - **"Testo breve"**: Permette di scrivere manualmente (es. 17:00)
5. ❌ **NON** spuntare "Obbligatorio" (è opzionale)

### 1.9 Verifica i Nomi delle Domande
Controlla che i nomi siano ESATTAMENTE così (copia e incolla per sicurezza):
- ✅ `Luogo di lavoro` (obbligatorio, dropdown)
- ✅ `Data` (obbligatorio)
- ✅ `Risorsa` (obbligatorio, testo breve)
- ✅ `Ruolo` (opzionale, dropdown)
- ✅ `Orario Inizio` (opzionale)
- ✅ `Orario Fine` (opzionale)

---

## PASSO 2: Ottieni Token e URL Supabase

### 2.1 Ottieni il Token dall'App Gestio
1. Apri l'app Gestio e accedi
2. Vai su **"Form Pubblici"** nella sidebar
3. Clicca su **"+ Crea Nuovo Token"**
4. Inserisci un nome (es. "Form Ristorante X") o lascia vuoto
5. Clicca su **"Crea Token"**
6. **COPIA** il token che appare (è lungo, assicurati di copiarlo tutto)
7. Tienilo da parte, ti servirà tra poco

### 2.2 Ottieni l'URL Supabase
1. Nell'app Gestio, vai su **"Form Pubblici"**
2. **COPIA** l'URL Endpoint che vedi (es. `https://xxxxx.supabase.co/functions/v1/submit-form`)
3. Rimuovi `/functions/v1/submit-form` dalla fine
4. Ti rimane l'URL base (es. `https://xxxxx.supabase.co`)
5. Tienilo da parte

---

## PASSO 3: Configura Google Apps Script

### 3.1 Apri lo Script Editor
1. Nel tuo Google Form, clicca sui **tre puntini (⋮)** in alto a destra
2. Seleziona **"Script editor"** (o **"Script editor"**)
3. Si aprirà una nuova scheda con l'editor di codice

### 3.2 Cancella il Codice Esistente
1. Seleziona tutto il codice esistente (Ctrl+A o Cmd+A)
2. Eliminalo (Canc o Delete)
3. Lascia l'editor vuoto

### 3.3 Copia il Template
1. Apri il file `google-apps-script/template-form-submit.js` dal progetto
2. Seleziona tutto il contenuto (Ctrl+A o Cmd+A)
3. Copia (Ctrl+C o Cmd+C)
4. Incolla nel Google Apps Script (Ctrl+V o Cmd+V)

### 3.4 Modifica la Configurazione
Cerca queste righe nel codice (circa righe 19-22):

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const FORM_TOKEN = 'your-form-token-here';
```

**Sostituisci:**
1. `'https://your-project.supabase.co'` con il tuo URL Supabase (quello che hai copiato al passo 2.2)
   - Esempio: `'https://abcdefghijklmnop.supabase.co'`
2. `'your-form-token-here'` con il tuo token (quello che hai copiato al passo 2.1)
   - Esempio: `'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6'`

**IMPORTANTE**: Mantieni le virgolette singole `'` attorno ai valori!

### 3.5 Salva lo Script
1. Clicca su **"Salva"** (icona floppy disk) o premi **Ctrl+S** (Cmd+S su Mac)
2. Assegna un nome al progetto (es. "Form Gestio")
3. Clicca su **"OK"**

---

## PASSO 4: Autorizza lo Script

### 4.1 Esegui la Funzione di Test
1. Nel Google Apps Script, clicca su **"Esegui"** (icona play ▶️) in alto
2. Seleziona `testOptions` dal menu a tendina
3. Clicca su **"Esegui"** (icona play)

### 4.2 Autorizza l'Accesso
1. Google ti chiederà di autorizzare lo script
2. Clicca su **"Verifica autorizzazioni"**
3. Seleziona il tuo account Google
4. Potresti vedere un avviso "Google non ha verificato questa app"
5. Clicca su **"Avanzate"**
6. Clicca su **"Vai a [nome progetto] (non sicuro)"**
7. Clicca su **"Consenti"**

### 4.3 Verifica l'Autorizzazione
1. Dopo l'autorizzazione, dovresti vedere "Esecuzione completata" in basso
2. Clicca su **"Esecuzioni"** nel menu laterale sinistro
3. Dovresti vedere l'esecuzione di `testOptions`
4. Clicca sull'esecuzione per vedere i log
5. Dovresti vedere qualcosa come: "Opzioni caricate: ..."

---

## PASSO 5: Popola i Dropdown

### 5.1 Esegui la Funzione onOpen
1. Nel Google Apps Script, clicca su **"Esegui"** (icona play ▶️)
2. Seleziona `onOpen` dal menu a tendina
3. Clicca su **"Esegui"** (icona play)

### 5.2 Verifica i Log
1. Clicca su **"Esecuzioni"** nel menu laterale
2. Clicca sull'esecuzione più recente
3. Dovresti vedere "Esecuzione completata" senza errori

### 5.3 Controlla il Form
1. Torna al Google Form (scheda del browser)
2. Aggiorna la pagina (F5 o Ctrl+R)
3. Controlla i dropdown:
   - **Cliente**: dovrebbe contenere i tuoi ristoranti
   - **Risorsa**: dovrebbe contenere le tue risorse
   - **Ruolo**: dovrebbe contenere i tuoi ruoli

Se i dropdown sono vuoti:
- Verifica che il token sia attivo nell'app Gestio
- Controlla i log in Google Apps Script per errori
- Verifica che i nomi delle domande siano esatti

---

## PASSO 6: Crea il Trigger

### 6.1 Apri i Trigger
1. Nel Google Apps Script, clicca su **"Modifica"** (menu in alto)
2. Seleziona **"Trigger"** (o **"Triggers"**)

### 6.2 Aggiungi un Nuovo Trigger
1. Clicca su **"Aggiungi trigger"** (in basso a destra)
2. Si aprirà una finestra di configurazione

### 6.3 Configura il Trigger
Imposta questi valori:
- **Funzione da eseguire**: Seleziona `onFormSubmit` dal menu
- **Origine evento**: Seleziona `Dal modulo` (o `From form`)
- **Tipo di evento**: Seleziona `All'invio del modulo` (o `On form submit`)

### 6.4 Salva il Trigger
1. Clicca su **"Salva"**
2. Potresti dover autorizzare nuovamente lo script
3. Segui le stesse istruzioni del Passo 4.2

---

## PASSO 7: Test Completo

### 7.1 Test del Form
1. Torna al Google Form
2. Compila tutti i campi:
   - **Cliente**: Seleziona un ristorante dal dropdown
   - **Data**: Seleziona una data
   - **Risorsa**: Seleziona una risorsa (o scrivi un nome)
   - **Ruolo**: Seleziona un ruolo (o scrivi un ruolo)
   - **Orario Inizio**: Scrivi un orario (es. 09:00)
   - **Orario Fine**: Scrivi un orario (es. 17:00)
3. Clicca su **"Invia"**

### 7.2 Verifica l'Invio
1. Dovresti vedere un messaggio di conferma
2. Vai su Google Apps Script → **"Esecuzioni"**
3. Dovresti vedere una nuova esecuzione di `onFormSubmit`
4. Clicca sull'esecuzione per vedere i log
5. Dovresti vedere "SUCCESSO: Servizio inserito con ID: ..."

### 7.3 Verifica nell'App Gestio
1. Apri l'app Gestio
2. Vai su **"Servizi"**
3. Cerca il servizio che hai appena inviato
4. Dovrebbe essere presente con tutti i dati corretti

---

## 🐛 RISOLUZIONE PROBLEMI

### I dropdown sono vuoti
**Soluzione:**
1. Verifica che il token sia attivo nell'app Gestio
2. Esegui nuovamente `onOpen()` nello script
3. Controlla i log per errori (Google Apps Script → Esecuzioni)
4. Verifica che i nomi delle domande siano esatti (Cliente, Risorsa, Ruolo)

### Errore: "Token non valido"
**Soluzione:**
1. Verifica di aver copiato il token completo (è molto lungo)
2. Controlla che non ci siano spazi prima/dopo il token
3. Verifica che il token sia attivo nell'app Gestio
4. Se hai rigenerato il token, usa il nuovo token

### Errore: "Campi obbligatori mancanti"
**Soluzione:**
1. Verifica che le domande "Cliente" e "Data" siano compilate
2. Controlla che i nomi delle domande siano esattamente "Cliente" e "Data"

### Il form non invia dati
**Soluzione:**
1. Verifica che il trigger sia configurato correttamente (Passo 6)
2. Controlla i log in Google Apps Script → Esecuzioni
3. Assicurati di aver autorizzato lo script (Passo 4)

### I dropdown non si aggiornano
**Soluzione:**
1. Esegui manualmente `onOpen()` nello script
2. Verifica che le domande siano di tipo "Menu a tendina" o "Elenco a discesa"
3. Controlla che i nomi delle domande contengano le parole chiave (cliente, risorsa, ruolo)

---

## ✅ CHECKLIST FINALE

Prima di considerare completato, verifica:

- [ ] Il form ha tutte e 6 le domande con i nomi esatti
- [ ] "Cliente" e "Data" sono obbligatorie
- [ ] Il codice Google Apps Script è stato copiato e configurato
- [ ] SUPABASE_URL e FORM_TOKEN sono stati sostituiti correttamente
- [ ] Lo script è stato autorizzato
- [ ] I dropdown sono popolati con le opzioni corrette
- [ ] Il trigger è stato creato e configurato
- [ ] Un test di invio è stato completato con successo
- [ ] Il servizio appare nella tabella Servizi dell'app Gestio

---

## 🎉 COMPLETATO!

Se hai completato tutti i passi e il test funziona, il tuo Google Form è pronto!

Ora le risorse possono:
- Compilare il form con i loro dati
- I dati verranno automaticamente inseriti nella tabella Servizi
- Solo tu (proprietario del token) vedrai i servizi nel tuo account

---

## 📞 BISOGNO DI AIUTO?

Se hai problemi:
1. Controlla i log in Google Apps Script → Esecuzioni
2. Controlla i log della Edge Function in Supabase Dashboard
3. Verifica la pagina "Form Pubblici" nell'app per statistiche di utilizzo

