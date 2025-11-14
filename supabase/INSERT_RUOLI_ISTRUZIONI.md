# Inserimento Ruoli Predefiniti

## Metodo 1: SQL Editor (Consigliato)

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `insert_ruoli.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

Lo script inserirà tutti i ruoli e aggiornerà quelli già esistenti.

## Metodo 2: Script PHP (se hai accesso al server)

Esegui:
```bash
php supabase/insert_ruoli_php.php
```

**Nota**: Lo script PHP richiede che tu sia autenticato o che le policies RLS permettano l'inserimento.

## Dati che verranno inseriti

- Livello 3: Maitre, Pulizie, Trasferta/Notturno
- Livello 2: Barman, Chef de Rang, Banconista, Cuoco/sushi-man, Commis di sala, Palmarista
- Livello 1: Cameriere, Hostess/Steward, Lavapiatti, Pizzaiolo, Aiuto cuoco, Runner

## Verifica

Dopo l'inserimento, puoi verificare nella tabella `ruoli` del database o nella pagina Ruoli dell'applicazione.

