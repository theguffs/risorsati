# 🧪 Come Testare la Validazione della Risorsa

## ⚠️ IMPORTANTE: Non Eseguire `onFormSubmit` Manualmente

Se esegui `onFormSubmit` dal menu dropdown in Google Apps Script, vedrai sempre l'errore:
```
ERRORE: Evento non valido. e = undefined
```

Questo è normale perché `onFormSubmit` si aspetta un evento dal trigger di Google Forms, non può essere eseguita manualmente.

## ✅ Come Testare Correttamente

### Opzione 1: Test della Validazione (Consigliato)

1. Nel Google Apps Script, seleziona la funzione `testValidateRisorsa` dal menu dropdown
2. Clicca su "Esegui" (Run)
3. Controlla i log:
   - Dovresti vedere: `"Risultato (inesistente): {"valid":false,"message":"..."}`
   - Dovresti vedere: `"Risultato (esistente): {"valid":true,"risorsa_id":"...","risorsa_nome":"..."}`

**Nota**: Prima di eseguire, modifica `testValidateRisorsa()` e sostituisci `'Mario Rossi'` con un nome reale di una risorsa che esiste nel tuo database.

### Opzione 2: Test Reale del Form

1. Vai al tuo Google Form
2. Compila tutti i campi:
   - **Luogo di lavoro**: Seleziona un ristorante
   - **Data**: Seleziona una data
   - **Risorsa**: Scrivi un nome INESISTENTE (es. "Test Risorsa 12345")
   - **Ruolo**: (opzionale)
   - **Orario Inizio**: (opzionale)
   - **Orario Fine**: (opzionale)
3. Clicca su "Invia"
4. Vai su Google Apps Script → "Esecuzioni"
5. Clicca sull'esecuzione più recente di `onFormSubmit`
6. Controlla i log:
   - Dovresti vedere: `"Validando risorsa: Test Risorsa 12345"`
   - Dovresti vedere: `"ERRORE VALIDAZIONE RISORSA: Nome risorsa non registrato..."`
   - **IMPORTANTE**: Il servizio NON dovrebbe essere inserito nel database

### Opzione 3: Test con Risorsa Esistente

1. Vai al tuo Google Form
2. Compila tutti i campi con una risorsa ESISTENTE
3. Clicca su "Invia"
4. Controlla i log:
   - Dovresti vedere: `"Risorsa validata: [nome esatto]"`
   - Dovresti vedere: `"SUCCESSO: Servizio inserito con ID: ..."`
   - Verifica nell'app Gestio che il servizio sia stato inserito

## 🔍 Cosa Controllare nei Log

Quando invii realmente il form, dovresti vedere questi log in ordine:

1. `"Numero di risposte: X"`
2. `"Domanda: 'Luogo di lavoro' -> Risposta: '...'"`
3. `"Domanda: 'Data' -> Risposta: '...'"`
4. `"Domanda: 'Risorsa' -> Risposta: '...'"`
5. `"Mappato: Luogo di lavoro -> cliente"`
6. `"Mappato: Data -> data"`
7. `"Mappato: Risorsa -> risorsa_nome"`
8. `"FormData ricevuto: {...}"`
9. `"Validando risorsa: [nome]"`
10. `"Validazione risorsa - Response Code: 200"`
11. `"Validazione risorsa - Response Text: {...}"`
12. Se la risorsa non esiste: `"ERRORE VALIDAZIONE RISORSA: ..."`
13. Se la risorsa esiste: `"Risorsa validata: [nome esatto]"` e poi `"SUCCESSO: Servizio inserito con ID: ..."`

## 🐛 Se la Validazione Non Funziona

1. **Verifica che l'Edge Function `validate-risorsa` sia deployata**:
   - Vai su Supabase Dashboard → Edge Functions
   - Verifica che esista `validate-risorsa`

2. **Verifica le configurazioni nel Google Apps Script**:
   - `SUPABASE_URL` è corretto?
   - `SUPABASE_ANON_KEY` è corretto?
   - `FORM_TOKEN` è corretto e attivo?
   - `SUPABASE_VALIDATE_RISORSA_URL` è corretto?

3. **Controlla i log per errori di connessione**:
   - Cerca errori come "Failed to fetch" o "Network error"
   - Verifica che l'URL dell'Edge Function sia corretto

4. **Testa manualmente l'Edge Function**:
   - Usa Postman o curl per chiamare `validate-risorsa`
   - Verifica che restituisca `valid: false` per una risorsa inesistente

## 📝 Checklist

- [ ] L'Edge Function `validate-risorsa` è deployata
- [ ] Le configurazioni nel Google Apps Script sono corrette
- [ ] Ho testato con `testValidateRisorsa()` e funziona
- [ ] Ho inviato un form con risorsa inesistente e i log mostrano l'errore
- [ ] Ho verificato che il servizio NON è stato inserito nel database quando la risorsa non esiste
- [ ] Ho inviato un form con risorsa esistente e il servizio è stato inserito correttamente

