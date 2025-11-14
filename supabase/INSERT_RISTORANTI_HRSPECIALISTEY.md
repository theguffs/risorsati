# Inserimento Ristoranti per hrspecialistey@gmail.com

## 📋 Istruzioni

### Metodo: SQL Editor

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `insert_ristoranti_hrspecialistey.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

## 📊 Dati che verranno inseriti

Lo script inserirà **65 ristoranti** con `owner_email = 'hrspecialistey@gmail.com'`.

## ✅ Caratteristiche dello script

- **Inserimento sicuro**: Usa `ON CONFLICT` per evitare duplicati
- **Aggiornamento automatico**: Se un ristorante con lo stesso nome esiste già, verrà assegnato a `hrspecialistey@gmail.com`
- **Verifica inclusa**: Lo script include query di verifica per controllare il numero di ristoranti inseriti

## 🔍 Verifica

Dopo l'esecuzione, puoi verificare:
1. Nella tabella `ristoranti` del database
2. Nella pagina **Ristoranti** dell'applicazione web (accedendo con `hrspecialistey@gmail.com`)
3. Il conteggio totale dei ristoranti inseriti

## ⚠️ Note

- Il campo `nome` è UNIQUE, quindi non verranno creati duplicati
- Se un ristorante con lo stesso nome esiste già, verrà solo aggiornato l'`owner_email` e assegnato a `hrspecialistey@gmail.com`
- Questi ristoranti saranno visibili solo all'account `hrspecialistey@gmail.com` grazie alle policies RLS

