# Inserimento Risorse Predefinite

## 📋 Istruzioni

### Metodo: SQL Editor (Consigliato)

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `insert_risorse.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

## 📊 Dati che verranno inseriti

Lo script inserirà **circa 350+ risorse** (nomi di persone) nella tabella `risorse`.

## ✅ Caratteristiche dello script

- **Inserimento sicuro**: Usa `ON CONFLICT` per evitare duplicati
- **Aggiornamento automatico**: Se una risorsa con lo stesso nome esiste già, aggiorna solo `updated_at`
- **Verifica inclusa**: Lo script include query di verifica per controllare il numero di risorse inserite

## 🔍 Verifica

Dopo l'esecuzione, puoi verificare:
1. Nella tabella `risorse` del database
2. Nella pagina **Risorse** dell'applicazione web
3. Il conteggio totale delle risorse inserite

## ⚠️ Note

- Il campo `nome` è UNIQUE, quindi non verranno creati duplicati
- Se una risorsa con lo stesso nome esiste già, verrà solo aggiornato il timestamp
- Tutte le risorse sono inserite con solo il campo `nome` (come da nuova struttura semplificata)

