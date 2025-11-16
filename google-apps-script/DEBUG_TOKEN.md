# 🔍 Debug: Errore "Invalid JWT"

## Problema

Quando esegui `testValidateRisorsa()`, vedi l'errore:
```
Response Code: 401
Response Text: {"code":401,"message":"Invalid JWT"}
```

Questo significa che Supabase sta validando il token come JWT **prima** che la nostra Edge Function venga eseguita.

## ✅ Checklist per Risolvere

### 1. Verifica che `FORM_TOKEN` sia Corretto

Nel tuo Google Apps Script, controlla che:

```javascript
const FORM_TOKEN = 'your-form-token-here'; // ⚠️ DEVE essere il token reale!
```

**Come ottenere il token corretto:**
1. Vai nell'app Gestio
2. Vai su **"Profilo"** → **"Form Pubblici"**
3. Copia il token completo (è molto lungo, tipo: `a1b2c3d4e5f6...`)
4. Incollalo nel Google Apps Script al posto di `'your-form-token-here'`

### 2. Verifica che `SUPABASE_ANON_KEY` sia Corretto

Nel tuo Google Apps Script, controlla che:

```javascript
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ⚠️ DEVE essere la anon key reale!
```

**Come ottenere la anon key:**
1. Vai su **Supabase Dashboard** → **Settings** → **API**
2. Trova **"anon public"** key (è molto lunga)
3. Copiala e incollala nel Google Apps Script al posto di `'YOUR_SUPABASE_ANON_KEY'`

### 3. Verifica che l'Edge Function `validate-risorsa` sia Deployata

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Verifica che esista `validate-risorsa`
3. Se non esiste, deployala seguendo le istruzioni in `supabase/functions/validate-risorsa/README.md`

### 4. Test con Logging Aggiuntivo

Ho aggiunto più logging nel codice. Esegui di nuovo `testValidateRisorsa()` e controlla i log:

- Dovresti vedere: `"FORM_TOKEN (primi 10 caratteri): ..."`
- Dovresti vedere: `"URL validazione: ..."`
- Se vedi `"ERRORE: FORM_TOKEN o SUPABASE_ANON_KEY non configurati correttamente!"`, significa che non hai sostituito i valori placeholder

## 🔧 Soluzione Rapida

1. **Apri il Google Apps Script**
2. **Trova queste righe:**
   ```javascript
   const FORM_TOKEN = 'your-form-token-here';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. **Sostituisci con i valori reali:**
   ```javascript
   const FORM_TOKEN = 'IL_TUO_TOKEN_REALE_QUI';
   const SUPABASE_ANON_KEY = 'LA_TUA_ANON_KEY_REALE_QUI';
   ```
4. **Salva**
5. **Esegui di nuovo `testValidateRisorsa()`**

## 🐛 Se il Problema Persiste

Se dopo aver configurato correttamente `FORM_TOKEN` e `SUPABASE_ANON_KEY` vedi ancora l'errore:

1. **Verifica che il token sia attivo:**
   - Vai nell'app Gestio → Profilo → Form Pubblici
   - Verifica che il token che stai usando sia **attivo** (non disattivato)

2. **Verifica che l'Edge Function sia deployata:**
   - Vai su Supabase Dashboard → Edge Functions
   - Clicca su `validate-risorsa`
   - Verifica che sia deployata e attiva

3. **Testa manualmente l'Edge Function:**
   - Usa Postman o curl per chiamare direttamente l'endpoint
   - Verifica che risponda correttamente

## 📝 Note

- Il token `FORM_TOKEN` è diverso dalla `SUPABASE_ANON_KEY`
- `FORM_TOKEN` è il token personalizzato che generi nell'app Gestio
- `SUPABASE_ANON_KEY` è la chiave pubblica di Supabase (anon key)
- Entrambi sono necessari per far funzionare la validazione

