# Supabase Edge Functions

## ⚠️ Note Importanti

### Errori TypeScript nell'Editor Locale

Se vedi errori TypeScript nel tuo editor locale come:
- `Cannot find module 'https://deno.land/std@...'`
- `Cannot find name 'Deno'`

**Questi sono normali e possono essere ignorati!**

### Perché?

1. **Il codice è scritto per Deno**, non per Node.js
2. **L'editor locale** (VS Code, Cursor, ecc.) non conosce Deno e i suoi moduli
3. **Il codice funziona perfettamente** quando viene deployato su Supabase perché lì gira in ambiente Deno

### Soluzioni

#### Opzione 1: Ignora gli errori (Consigliato)
- Gli errori sono solo nell'editor locale
- Il codice funzionerà correttamente quando deployato
- Non influenzano il funzionamento

#### Opzione 2: Installa Deno Extension (VS Code/Cursor)
1. Installa l'estensione "Deno" per VS Code/Cursor
2. Abilita Deno per questa cartella
3. Gli errori scompariranno

#### Opzione 3: Disabilita TypeScript per questa cartella
- Aggiungi `// @ts-nocheck` all'inizio di ogni file
- Oppure disabilita TypeScript per la cartella `supabase/functions`

## 🚀 Deploy

Per deployare le funzioni:

1. Vai su **Supabase Dashboard** → **Edge Functions**
2. Copia e incolla il codice nell'editor
3. Clicca su **Deploy**

Oppure usa Supabase CLI:
```bash
supabase functions deploy submit-form
supabase functions deploy get-form-options
```

## ✅ Verifica

Dopo il deploy, le funzioni saranno disponibili a:
- `https://your-project.supabase.co/functions/v1/submit-form`
- `https://your-project.supabase.co/functions/v1/get-form-options`

