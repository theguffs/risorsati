# Inserimento Ristoranti Predefiniti

## Metodo: SQL Editor (Consigliato)

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `insert_ristoranti.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

Lo script inserirà tutti i 65 ristoranti e aggiornerà quelli già esistenti (basandosi sul codice univoco).

## Dati che verranno inseriti

65 ristoranti con codici da C1 a C65, inclusi:
- Hotel (Hotel Crivi's, Hotel Uptown, Hotel Vik Pellico 8, Grand Visconti Palace Hotel)
- Ristoranti (Il Carminio, La Fettunta, L'Amuri, etc.)
- Catering (Bravo Catering, Catering 1908, Massimo Amato Catering)
- Bar e Club (Grace Club, Domus Club, Lupo Bar, etc.)
- Altri locali (Golf Club Lugano, Canottieri 1890, etc.)

## Verifica

Dopo l'inserimento, puoi verificare:
1. Nella tabella `ristoranti` del database
2. Nella pagina **Ristoranti** dell'applicazione web
3. Il campo `codice_completo` viene generato automaticamente come "codice-nome" (es. "C1-B Monza")

## Note

- Il campo `codice_completo` è generato automaticamente dal database
- Gli apostrofi nei nomi sono gestiti correttamente (es. "L'Amuri", "Damot'")
- Se un ristorante con lo stesso codice esiste già, verrà aggiornato il nome

