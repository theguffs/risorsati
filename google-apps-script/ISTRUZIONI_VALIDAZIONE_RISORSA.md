# ⚠️ IMPORTANTE: Validazione Risorsa e Limitazioni di Google Forms

## 🔴 Problema Conosciuto

**Google Forms non può bloccare l'invio del form o mostrare errori all'utente dopo l'invio.**

Quando un utente compila e invia il form:
1. Il form viene **sempre inviato** (l'utente vede "Form inviato con successo")
2. Il trigger `onFormSubmit` viene eseguito **DOPO** che il form è stato inviato
3. Se la validazione fallisce, il form è già stato inviato, ma i dati **NON** vengono inseriti nel database

## ✅ Come Funziona la Validazione

### 1. Validazione nel Google Apps Script (`onFormSubmit`)
- La funzione `validateRisorsa()` chiama l'Edge Function `validate-risorsa`
- Se la risorsa non esiste, la risposta del form viene **eliminata** (se possibile)
- Viene inviata un'email di errore (se configurata)

### 2. Validazione nell'Edge Function `submit-form`
- Anche se la validazione nel Google Apps Script fallisce, l'Edge Function `submit-form` **NON** inserisce i dati se la risorsa non esiste
- Questo è un doppio controllo di sicurezza

## 🔍 Come Verificare se la Validazione Funziona

### Controlla i Log di Google Apps Script

1. Vai su **Google Apps Script** → **"Esecuzioni"**
2. Clicca sull'esecuzione più recente di `onFormSubmit`
3. Controlla i log:
   - Dovresti vedere: `"Validando risorsa: [nome]"`
   - Se la risorsa non esiste: `"ERRORE VALIDAZIONE RISORSA: Nome risorsa non registrato..."`
   - Se la risorsa esiste: `"Risorsa validata: [nome esatto]"`

### Controlla se l'Edge Function `validate-risorsa` è Deployata

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Verifica che esista la funzione `validate-risorsa`
3. Se non esiste, deployala seguendo le istruzioni in `supabase/functions/validate-risorsa/README.md`

### Test Manuale della Validazione

1. Nel Google Apps Script, esegui manualmente questa funzione:
```javascript
function testValidateRisorsa() {
  const result = validateRisorsa('Nome Inesistente');
  Logger.log('Risultato: ' + JSON.stringify(result));
}
```

2. Controlla i log:
   - Se `valid: false`, la validazione funziona
   - Se vedi errori di connessione, l'Edge Function potrebbe non essere deployata

## 🛠️ Soluzioni Alternative per Mostrare Errori all'Utente

### Opzione 1: Email all'Utente (Consigliata)

Modifica la funzione `sendEmailError()` per inviare un'email anche all'utente che ha compilato il form:

```javascript
function sendEmailError(errorMessage) {
  const email = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: email,
    subject: 'Errore invio form - Risorsa non registrata',
    body: 'Errore: ' + errorMessage + '\n\nIl form è stato inviato ma i dati non sono stati salvati nel database.'
  });
}
```

**Nota**: Devi abilitare l'email nel codice (decommentare la funzione).

### Opzione 2: Google Sheets per Mostrare Messaggi

1. Collega il Google Form a un Google Sheet
2. Aggiungi una colonna "Stato" nel foglio
3. Nel Google Apps Script, scrivi "ERRORE: Risorsa non registrata" nella colonna "Stato" se la validazione fallisce
4. L'utente può controllare il foglio per vedere se il form è stato processato correttamente

### Opzione 3: Pagina di Conferma Personalizzata

1. Crea una pagina web personalizzata che mostra un messaggio di errore
2. Configura il Google Form per reindirizzare a questa pagina
3. Passa un parametro nella URL per indicare se c'è stato un errore

## 📝 Checklist per Risolvere il Problema

- [ ] L'Edge Function `validate-risorsa` è deployata su Supabase
- [ ] Il `SUPABASE_VALIDATE_RISORSA_URL` nel Google Apps Script è corretto
- [ ] Il `FORM_TOKEN` nel Google Apps Script è corretto e attivo
- [ ] Il `SUPABASE_ANON_KEY` nel Google Apps Script è corretto
- [ ] I log di Google Apps Script mostrano la validazione in esecuzione
- [ ] La funzione `sendEmailError()` è abilitata (opzionale, per ricevere notifiche)

## 🐛 Debug

Se la validazione non funziona:

1. **Controlla i log di Google Apps Script**:
   - Vai su "Esecuzioni" → Clicca sull'esecuzione → Vedi i log
   - Cerca errori di connessione o validazione

2. **Testa manualmente l'Edge Function**:
   - Usa Postman o curl per chiamare `validate-risorsa`
   - Verifica che restituisca `valid: false` per una risorsa inesistente

3. **Verifica che il nome della risorsa corrisponda esattamente**:
   - La ricerca è case-insensitive, ma deve corrispondere esattamente (spazi inclusi)
   - Esempio: "Mario Rossi" ≠ "Mario  Rossi" (doppio spazio)

4. **Controlla che la risorsa esista nel database**:
   - Vai nell'app Gestio → Risorse
   - Verifica che la risorsa che stai testando esista

## ⚠️ Limitazione di Google Forms

**IMPORTANTE**: Anche con tutte queste validazioni, Google Forms **NON può**:
- Bloccare l'invio del form prima che l'utente lo invii
- Mostrare un messaggio di errore all'utente dopo l'invio
- Impedire che il form venga salvato nelle risposte di Google Forms

La validazione serve a:
- ✅ Impedire che dati non validi vengano inseriti nel database Supabase
- ✅ Eliminare la risposta del form (se possibile) se la validazione fallisce
- ✅ Inviare notifiche di errore (via email o log)

