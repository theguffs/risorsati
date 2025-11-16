# Fix Calcolo Durata Servizi

## 📋 Problema

Il calcolo della durata non gestiva correttamente i servizi che iniziano la sera e finiscono dopo la mezzanotte.

**Esempio:**
- Orario: 18:00 - 00:00
- Calcolo errato: -18.00h
- Calcolo corretto: 6.00h

## 🔧 Soluzione

Lo script `fix_durata_calculation.sql`:
1. Crea una funzione SQL `calcola_durata_ore()` che gestisce correttamente il passaggio della mezzanotte
2. Elimina e ricrea la colonna `durata_ore_numeric` con il calcolo corretto
3. Aggiorna automaticamente tutti i valori esistenti

## 📝 Istruzioni

### Metodo: SQL Editor

1. Vai al **Supabase Dashboard**: https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** (menu laterale)
4. Clicca su **New Query**
5. Copia e incolla il contenuto del file `fix_durata_calculation.sql`
6. Clicca su **Run** (o premi `Ctrl+Enter`)

## ✅ Verifica

Dopo l'esecuzione, lo script mostra:
- I primi 20 servizi con la durata calcolata
- Statistiche generali (totale, durate negative, durate OK, durata media)

## 🔍 Logica del Calcolo

La funzione gestisce questi casi:

1. **Servizio normale** (es. 10:00 - 14:00):
   - Durata: 4 ore

2. **Servizio che finisce a mezzanotte** (es. 19:00 - 00:00):
   - 00:00 viene trattato come 24:00
   - Durata: 5 ore

3. **Servizio che finisce dopo la mezzanotte** (es. 19:00 - 02:00):
   - 02:00 è minore di 19:00, quindi aggiunge 24 ore
   - Durata: (02:00 + 24h) - 19:00 = 7 ore

## ⚠️ Note

- La colonna `durata_ore_numeric` è una colonna generata, quindi viene ricalcolata automaticamente quando si modificano gli orari
- I valori esistenti verranno aggiornati automaticamente dopo l'esecuzione dello script
- Non è necessario aggiornare manualmente i dati esistenti

