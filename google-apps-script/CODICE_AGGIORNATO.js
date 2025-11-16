/**
 * Script Google Apps Script per inviare dati da Google Forms a Supabase
 * 
 * ISTRUZIONI:
 * 1. Apri il tuo Google Form
 * 2. Clicca sui tre puntini (⋮) → "Script editor"
 * 3. Incolla questo codice
 * 4. Sostituisci SUPABASE_URL e FORM_TOKEN con i tuoi valori
 * 5. Salva e autorizza lo script
 * 6. Crea un trigger: "Modifica" → "Trigger" → "Aggiungi trigger"
 *    - Evento: "All'invio del modulo"
 *    - Funzione: "onFormSubmit"
 */

// ============================================
// CONFIGURAZIONE - MODIFICA QUESTI VALORI
// ============================================

const SUPABASE_URL = 'https://gbfipwqjrmvvkuzzjeai.supabase.co'; // Sostituisci con il tuo URL Supabase
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Sostituisci con la tua anon key (la trovi in .env come VITE_SUPABASE_ANON_KEY o in Supabase Dashboard → Settings → API)
const SUPABASE_FUNCTION_URL = SUPABASE_URL + '/functions/v1/submit-form';
const SUPABASE_OPTIONS_URL = SUPABASE_URL + '/functions/v1/get-form-options';
const SUPABASE_VALIDATE_RISORSA_URL = SUPABASE_URL + '/functions/v1/validate-risorsa';
const FORM_TOKEN = 'your-form-token-here'; // Sostituisci con il token generato dall'app

// ============================================
// MAPPING CAMPI FORM → DATABASE
// ============================================
// Modifica questi mapping in base ai nomi delle domande nel tuo Google Form

const FIELD_MAPPING = {
  // Nome della domanda nel Google Form → Campo nel database
  // IMPORTANTE: I nomi devono corrispondere ESATTAMENTE ai titoli delle domande nel form
  'Luogo di lavoro': 'cliente',       // OBBLIGATORIO - Dropdown con ristoranti dell'utente
  'Data': 'data',                     // OBBLIGATORIO - Campo data
  'Risorsa': 'risorsa_nome',          // OBBLIGATORIO - Campo di testo (verrà validato)
  'Ruolo': 'ruolo_nome',              // Opzionale - Dropdown con ruoli dell'utente
  'Orario Inizio': 'orario_inizio',   // Opzionale - Formato HH:MM (es. 09:00)
  'Orario Fine': 'orario_fine',       // Opzionale - Formato HH:MM (es. 17:00)
};

// ============================================
// FUNZIONI DI INIZIALIZZAZIONE
// ============================================

/**
 * Funzione chiamata quando il form viene aperto
 * Popola i dropdown con le opzioni dal database
 * 
 * NOTA: Questa funzione viene chiamata automaticamente quando:
 * - Il form viene aperto (se configurato un trigger "On form open")
 * - Viene eseguita manualmente
 */
function onOpen() {
  try {
    const form = FormApp.getActiveForm();
    const options = getFormOptions();
    
    if (!options || !options.success) {
      Logger.log('Errore nel caricamento delle opzioni');
      return;
    }
    
    // Aggiorna i dropdown del form
    updateFormDropdowns(form, options);
    Logger.log('Dropdown aggiornati con successo');
  } catch (error) {
    Logger.log('Errore in onOpen: ' + error.toString());
  }
}

/**
 * Funzione per aggiornare i dropdown periodicamente
 * Può essere chiamata da un trigger temporizzato (es. ogni giorno)
 */
function updateDropdownsPeriodic() {
  onOpen();
}

/**
 * Ottiene le opzioni (ristoranti, risorse, ruoli) dal database
 */
function getFormOptions() {
  try {
    const options = {
      'method': 'get',
      'headers': {
        'X-Form-Token': FORM_TOKEN,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, // Usa l'anon key per bypassare la validazione JWT
        'apikey': SUPABASE_ANON_KEY, // Richiesto da Supabase
        'Content-Type': 'application/json',
      },
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(SUPABASE_OPTIONS_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      return JSON.parse(responseText);
    } else {
      Logger.log('Errore nel recupero opzioni: ' + responseText);
      return null;
    }
  } catch (error) {
    Logger.log('Errore in getFormOptions: ' + error.toString());
    return null;
  }
}

/**
 * Aggiorna i dropdown del form con le opzioni
 * Supporta sia "Menu a tendina" (DROPDOWN) che "Elenco a discesa" (LIST)
 * NOTA: "Risorsa" non viene più popolata come dropdown, è un campo di testo
 */
function updateFormDropdowns(form, options) {
  const items = form.getItems();
  
  items.forEach(item => {
    const title = item.getTitle().toLowerCase();
    
    // Ristoranti/Luogo di lavoro
    if (title.includes('luogo') || title.includes('lavoro') || title.includes('cliente') || title.includes('ristorante')) {
      if (item.getType() === FormApp.ItemType.LIST) {
        const listItem = item.asListItem();
        const choices = options.ristoranti.map(nome => listItem.createChoice(nome));
        listItem.setChoices(choices);
      } else if (item.getType() === FormApp.ItemType.DROPDOWN) {
        const dropdownItem = item.asDropdownItem();
        const choices = options.ristoranti.map(nome => dropdownItem.createChoice(nome));
        dropdownItem.setChoices(choices);
      }
    }
    
    // Ruoli
    if (title.includes('ruolo')) {
      if (item.getType() === FormApp.ItemType.LIST) {
        const listItem = item.asListItem();
        const choices = options.ruoli.map(ruolo => listItem.createChoice(ruolo));
        listItem.setChoices(choices);
      } else if (item.getType() === FormApp.ItemType.DROPDOWN) {
        const dropdownItem = item.asDropdownItem();
        const choices = options.ruoli.map(ruolo => dropdownItem.createChoice(ruolo));
        dropdownItem.setChoices(choices);
      }
    }
  });
}

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

/**
 * Trigger chiamato quando viene inviato il form
 * 
 * IMPORTANTE: Questa funzione viene chiamata automaticamente dal trigger quando il form viene inviato.
 * Se la esegui manualmente dal menu, l'evento 'e' sarà undefined - questo è normale.
 * Per testare, invia realmente il form o usa le funzioni di test (testValidateRisorsa, testConnection).
 */
function onFormSubmit(e) {
  try {
    // Verifica che l'evento sia valido
    // NOTA: Se esegui manualmente questa funzione, 'e' sarà undefined - questo è normale
    if (!e || !e.response) {
      Logger.log('ERRORE: Evento non valido. e = ' + JSON.stringify(e));
      Logger.log('NOTA: Se stai eseguendo manualmente questa funzione, questo errore è normale.');
      Logger.log('Per testare, invia realmente il form o usa testValidateRisorsa()');
      return;
    }
    
    // Ottieni le risposte del form
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // Converti le risposte in un oggetto
    const formData = {};
    Logger.log('Numero di risposte: ' + itemResponses.length);
    
    itemResponses.forEach(response => {
      const question = response.getItem().getTitle();
      const answer = response.getResponse();
      
      Logger.log('Domanda: "' + question + '" -> Risposta: "' + answer + '"');
      
      // Usa il mapping per convertire il nome della domanda nel campo del database
      const dbField = FIELD_MAPPING[question];
      if (dbField) {
        formData[dbField] = answer;
        Logger.log('Mappato: ' + question + ' -> ' + dbField);
      } else {
        Logger.log('Domanda non mappata: ' + question);
      }
    });
    
    // Log dei dati ricevuti per debug
    Logger.log('FormData ricevuto: ' + JSON.stringify(formData));
    
    // Valida che ci siano i campi obbligatori
    if (!formData.cliente || !formData.data) {
      Logger.log('ERRORE: Campi obbligatori mancanti (luogo di lavoro, data)');
      Logger.log('FormData completo: ' + JSON.stringify(formData));
      sendEmailError('Campi obbligatori mancanti: luogo di lavoro o data');
      return;
    }
    
    // Valida che la risorsa esista nel database (OBBLIGATORIA)
    if (!formData.risorsa_nome || formData.risorsa_nome.trim() === '') {
      Logger.log('ERRORE: Campo risorsa obbligatorio');
      sendEmailError('Il campo "Risorsa" è obbligatorio. Inserisci nome e cognome.');
      // NOTA: Google Forms non permette di eliminare le risposte dopo l'invio
      // La validazione serve solo a impedire l'inserimento nel database
      return;
    }
    
    // Valida che la risorsa esista nel database
    Logger.log('Validando risorsa: ' + formData.risorsa_nome);
    const risorsaValidation = validateRisorsa(formData.risorsa_nome);
    
    if (!risorsaValidation || !risorsaValidation.valid) {
      const errorMessage = risorsaValidation?.message || 'Nome risorsa non registrato. Verifica di aver scritto correttamente nome e cognome.';
      Logger.log('ERRORE VALIDAZIONE RISORSA: ' + errorMessage);
      sendEmailError(errorMessage);
      // NOTA: Google Forms non permette di eliminare le risposte dopo l'invio
      // La validazione serve solo a impedire l'inserimento nel database
      return;
    }
    
    // Usa il nome esatto dal database (per gestire maiuscole/minuscole)
    if (risorsaValidation.risorsa_nome) {
      formData.risorsa_nome = risorsaValidation.risorsa_nome;
      Logger.log('Risorsa validata: ' + formData.risorsa_nome);
    }
    
    // Formatta la data se necessario (Google Forms restituisce date in formato diverso)
    if (formData.data) {
      formData.data = formatDate(formData.data);
    }
    
    // Formatta gli orari se necessario (Google Forms può restituire oggetti Date per "Ora")
    if (formData.orario_inizio) {
      formData.orario_inizio = formatTime(formData.orario_inizio);
    }
    
    if (formData.orario_fine) {
      formData.orario_fine = formatTime(formData.orario_fine);
    }
    
    // Invia i dati a Supabase
    Logger.log('Invio dati a Supabase: ' + JSON.stringify(formData));
    const result = sendToSupabase(formData);
    
    if (result.success) {
      Logger.log('SUCCESSO: Servizio inserito con ID: ' + result.id);
    } else {
      Logger.log('ERRORE INVIO A SUPABASE: ' + result.error);
      sendEmailError(result.error);
      // NOTA: Google Forms non permette di eliminare le risposte dopo l'invio
      // La validazione serve solo a impedire l'inserimento nel database
    }
    
  } catch (error) {
    Logger.log('ERRORE GENERALE: ' + error.toString());
    sendEmailError(error.toString());
  }
}

/**
 * Valida se una risorsa esiste nel database
 * Restituisce { valid: true/false, message: '...', risorsa_nome: '...' }
 */
function validateRisorsa(risorsaNome) {
  try {
    // Verifica che il nome non sia vuoto
    if (!risorsaNome || risorsaNome.trim() === '') {
      return {
        valid: false,
        message: 'Il campo "Risorsa" è obbligatorio. Inserisci nome e cognome.'
      };
    }
    
    // Verifica che FORM_TOKEN e SUPABASE_ANON_KEY siano configurati
    if (FORM_TOKEN === 'your-form-token-here' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
      Logger.log('ERRORE: FORM_TOKEN o SUPABASE_ANON_KEY non configurati correttamente!');
      Logger.log('FORM_TOKEN: ' + (FORM_TOKEN ? FORM_TOKEN.substring(0, 10) + '...' : 'vuoto'));
      Logger.log('SUPABASE_ANON_KEY: ' + (SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'vuoto'));
      return {
        valid: false,
        message: 'Configurazione mancante: verifica FORM_TOKEN e SUPABASE_ANON_KEY nel codice'
      };
    }
    
    Logger.log('URL validazione: ' + SUPABASE_VALIDATE_RISORSA_URL);
    Logger.log('FORM_TOKEN (primi 10 caratteri): ' + FORM_TOKEN.substring(0, 10) + '...');
    
    const options = {
      'method': 'post',
      'headers': {
        'X-Form-Token': FORM_TOKEN,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify({ risorsa_nome: risorsaNome }),
      'muteHttpExceptions': true
    };
    
    Logger.log('Headers inviati: X-Form-Token presente, Authorization presente');
    
    const response = UrlFetchApp.fetch(SUPABASE_VALIDATE_RISORSA_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    Logger.log('Validazione risorsa - Response Code: ' + responseCode);
    Logger.log('Validazione risorsa - Response Text: ' + responseText);
    
    if (responseCode === 200) {
      const result = JSON.parse(responseText);
      Logger.log('Validazione risorsa - Result: ' + JSON.stringify(result));
      return result;
    } else {
      // Prova a parsare come JSON, altrimenti usa il testo
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      Logger.log('Validazione risorsa - Errore: ' + JSON.stringify(errorData));
      return {
        valid: false,
        message: errorData.error || 'Errore nella validazione della risorsa'
      };
    }
  } catch (error) {
    Logger.log('Validazione risorsa - Eccezione: ' + error.toString());
    return {
      valid: false,
      message: 'Errore nella validazione: ' + error.toString()
    };
  }
}

/**
 * Invia i dati a Supabase tramite Edge Function
 */
function sendToSupabase(data) {
  try {
    const options = {
      'method': 'post',
      'headers': {
        'X-Form-Token': FORM_TOKEN,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, // Usa l'anon key per bypassare la validazione JWT
        'apikey': SUPABASE_ANON_KEY, // Richiesto da Supabase
        'Content-Type': 'application/json',
      },
      'payload': JSON.stringify(data),
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(SUPABASE_FUNCTION_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode === 200) {
      return JSON.parse(responseText);
    } else {
      const errorData = JSON.parse(responseText);
      return {
        success: false,
        error: errorData.error || 'Errore sconosciuto'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Formatta la data nel formato YYYY-MM-DD
 */
function formatDate(dateValue) {
  if (typeof dateValue === 'string') {
    // Se è già una stringa, prova a parsarla
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    }
    return dateValue;
  } else if (dateValue instanceof Date) {
    return Utilities.formatDate(dateValue, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return dateValue;
}

/**
 * Formatta l'orario nel formato HH:MM
 * Gestisce sia stringhe che oggetti Date/Time di Google Forms
 */
function formatTime(timeValue) {
  // Se è già una stringa nel formato HH:MM, restituiscila così
  if (typeof timeValue === 'string') {
    // Verifica se è già nel formato HH:MM
    if (/^\d{1,2}:\d{2}$/.test(timeValue)) {
      // Assicurati che le ore siano a 2 cifre
      const parts = timeValue.split(':');
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1];
      return hours + ':' + minutes;
    }
    // Se è una stringa ma non nel formato corretto, prova a parsarla come Date
    const date = new Date(timeValue);
    if (!isNaN(date.getTime())) {
      return Utilities.formatDate(date, Session.getScriptTimeZone(), 'HH:mm');
    }
    return timeValue;
  } else if (timeValue instanceof Date) {
    // Se è un oggetto Date (dal campo "Ora" di Google Forms)
    return Utilities.formatDate(timeValue, Session.getScriptTimeZone(), 'HH:mm');
  }
  return timeValue;
}

/**
 * Invia email di errore (opzionale)
 */
function sendEmailError(errorMessage) {
  // Decommenta e modifica se vuoi ricevere email di errore
  /*
  const email = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: email,
    subject: 'Errore invio form a Supabase',
    body: 'Errore: ' + errorMessage
  });
  */
}

// ============================================
// FUNZIONE DI TEST (opzionale)
// ============================================

/**
 * Funzione di test per verificare la validazione della risorsa
 * Esegui questa funzione manualmente per testare
 * 
 * IMPORTANTE: Prima di eseguire, modifica 'Mario Rossi' con un nome reale di una risorsa
 * che esiste nel tuo database
 */
function testValidateRisorsa() {
  // Test con risorsa inesistente
  Logger.log('=== Test con risorsa INESISTENTE ===');
  const result1 = validateRisorsa('Nome Inesistente Test 12345');
  Logger.log('Risultato (inesistente): ' + JSON.stringify(result1));
  
  // Test con risorsa esistente (SOSTITUISCI con un nome reale dal tuo database)
  Logger.log('=== Test con risorsa ESISTENTE ===');
  const result2 = validateRisorsa('Mario Rossi'); // ⚠️ SOSTITUISCI con un nome reale
  Logger.log('Risultato (esistente): ' + JSON.stringify(result2));
}

/**
 * Funzione di test per verificare la connessione completa
 * Esegui questa funzione manualmente per testare
 * NOTA: Questa funzione NON testa la validazione, solo l'invio a Supabase
 */
function testConnection() {
  const testData = {
    cliente: 'Test Cliente',
    data: '2025-01-15',
    risorsa_nome: 'Test Risorsa',
    ruolo_nome: 'Test Ruolo',
    orario_inizio: '09:00',
    orario_fine: '17:00'
  };
  
  const result = sendToSupabase(testData);
  Logger.log('Risultato test: ' + JSON.stringify(result));
}

/**
 * Funzione per testare il caricamento delle opzioni
 * Esegui questa funzione manualmente per verificare che le opzioni vengano caricate
 * NOTA: Le risorse non vengono più restituite perché ora è un campo di testo
 */
function testOptions() {
  const options = getFormOptions();
  Logger.log('Opzioni caricate: ' + JSON.stringify(options));
  
  if (options && options.success) {
    Logger.log('Ristoranti: ' + options.ristoranti.length);
    Logger.log('Ruoli: ' + options.ruoli.length);
    // NOTA: Le risorse non vengono più restituite perché ora è un campo di testo
  }
}

