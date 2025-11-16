# Aggiornamento Automatico dei Dropdown nel Google Form

## 📋 Problema

Quando aggiungi nuove risorse, ristoranti o ruoli nell'app Gestio, questi non compaiono automaticamente nei dropdown del Google Form. Devi aggiornare manualmente eseguendo `onOpen()`.

## ✅ Soluzione: Trigger Periodico

Puoi configurare un trigger che aggiorna automaticamente i dropdown ogni giorno (o con la frequenza che preferisci).

## 🚀 Come Configurare l'Aggiornamento Automatico

### Passo 1: Crea un Trigger Temporizzato

1. Nel Google Apps Script, clicca su **"Modifica"** → **"Trigger"**
2. Clicca su **"Aggiungi trigger"** (in basso a destra)
3. Configura il trigger:
   - **Funzione da eseguire**: `updateDropdownsPeriodic`
   - **Origine evento**: `Basato sul tempo` (o `Time-driven`)
   - **Tipo di evento**: Scegli la frequenza:
     - **Ogni giorno** (consigliato): Aggiorna i dropdown una volta al giorno
     - **Ogni ora**: Aggiorna ogni ora (più frequente)
     - **Ogni settimana**: Aggiorna una volta a settimana
   - **Ora del giorno**: Scegli un orario (es. 02:00 di notte)
4. Clicca su **"Salva"**

### Passo 2: Verifica il Trigger

1. Dopo aver salvato, dovresti vedere il nuovo trigger nella lista:
   - **Funzione**: `updateDropdownsPeriodic`
   - **Evento**: `Basato sul tempo` con la frequenza scelta
   - **Stato**: `Attivo`

### Passo 3: Test Manuale (Opzionale)

1. Esegui manualmente `updateDropdownsPeriodic()` per verificare che funzioni
2. Controlla i log per eventuali errori

## 📅 Frequenza Consigliata

- **Ogni giorno alle 02:00**: Consigliato per la maggior parte dei casi
  - Aggiorna i dropdown una volta al giorno
  - Non sovraccarica il sistema
  - Le nuove risorse/ristoranti/ruoli saranno disponibili entro 24 ore

- **Ogni ora**: Se aggiungi spesso nuove risorse e vuoi che siano disponibili subito
  - Più frequente, ma più chiamate API

- **Ogni settimana**: Se aggiungi raramente nuove risorse
  - Meno frequente, ma potrebbe richiedere più tempo per vedere le nuove opzioni

## 🔄 Aggiornamento Manuale (Sempre Disponibile)

Anche con il trigger automatico, puoi sempre aggiornare manualmente:

1. Apri il Google Apps Script
2. Esegui la funzione `onOpen()` o `updateDropdownsPeriodic()`
3. I dropdown verranno aggiornati immediatamente

## ⚠️ Note Importanti

- Il trigger aggiorna i dropdown anche se non ci sono nuove risorse/ristoranti/ruoli
- Non c'è problema se esegui l'aggiornamento più volte al giorno
- Se elimini una risorsa/ristorante/ruolo dall'app, verrà rimossa anche dal dropdown al prossimo aggiornamento

## 🐛 Risoluzione Problemi

### Il trigger non si esegue
- Verifica che il trigger sia attivo
- Controlla i log in Google Apps Script → "Esecuzioni"
- Verifica che il token sia ancora valido

### I dropdown non si aggiornano
- Esegui manualmente `updateDropdownsPeriodic()` per testare
- Controlla i log per errori
- Verifica che il token sia attivo nell'app Gestio

