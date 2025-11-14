# Inserimento Ruoli per hrspecialistey@gmail.com

## 📋 Istruzioni

### Metodo: SQL Editor

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `insert_ruoli_hrspecialistey.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

## 📊 Dati che verranno inseriti

Lo script inserirà **15 ruoli** con `owner_email = 'hrspecialistey@gmail.com'`:

### Livello 3
- Maitre (listino: 15€, fee: 4€/h)
- Pulizie (listino: 15€, fee: 5€/h)
- Trasferta/Notturno (listino: 20€, fee: 5€/h)

### Livello 2
- Barman (listino: 12€, fee: 3€/h)
- Chef de Rang (listino: 12€, fee: 3€/h)
- Banconista (listino: 12€, fee: 3€/h)
- Cuoco, sushi-man (listino: 12€, fee: 3€/h)
- Commis di sala (listino: 12€, fee: 2€/h)
- Palmarista (listino: 12€, fee: 1.25€/h)

### Livello 1
- Cameriere (listino: 10€, fee: 2€/h)
- Hostess/Steward (listino: 10€, fee: 2€/h)
- Lavapiatti (listino: 10€, fee: 2€/h)
- Pizzaiolo (listino: 12€, fee: 2€/h)
- Aiuto cuoco (listino: 10€, fee: 2€/h)
- Runner (listino: 10€, fee: 1.25€/h)

## ⚠️ Note

- **Conflitti**: Se un ruolo con lo stesso nome esiste già, verrà aggiornato con i nuovi valori e assegnato a `hrspecialistey@gmail.com`.
- **Isolamento**: Questi ruoli saranno visibili solo all'account `hrspecialistey@gmail.com` grazie alle policies RLS.
- **Valori**: Tutti i valori di `listino` e `fee_per_ora` sono già configurati correttamente.

## 🔍 Verifica

Dopo l'esecuzione, lo script mostra:
- L'elenco completo dei ruoli inseriti
- Il conteggio totale dei ruoli per questo account

## 📝 Prossimi passi

Dopo l'inserimento, puoi:
1. Accedere con `hrspecialistey@gmail.com` per vedere i ruoli

