# Risorsati - Gestione Risorse

Applicazione web per la gestione di risorse, clienti e servizi, sviluppata con React e Supabase.

## 🚀 Setup

### Prerequisiti
- Node.js (v18 o superiore)
- npm o yarn
- Account Supabase
- PHP 7.4+ (per importazione dati Excel)

### Installazione

1. Installa le dipendenze Node.js:
```bash
npm install
```

2. Configura il database Supabase:
   - Vai su [supabase/SETUP.md](supabase/SETUP.md) per le istruzioni complete
   - Esegui lo script SQL `supabase/schema.sql` nel Supabase Dashboard
   - (Opzionale) Importa i dati dall'Excel con `php supabase/import_excel_data.php`

3. Configura le variabili d'ambiente:
   - Crea un file `.env` nella root del progetto
   - Aggiungi le tue credenziali Supabase:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```
   - Trova le credenziali in Supabase Dashboard → Settings → API

4. Avvia il server di sviluppo:
```bash
npm run dev
```

## 📁 Struttura Progetto

```
risorsati/
├── src/
│   ├── components/     # Componenti riutilizzabili
│   ├── pages/          # Pagine principali
│   ├── contexts/       # Context API (Auth, etc.)
│   ├── hooks/          # Custom hooks
│   ├── services/       # Logica business/Supabase
│   ├── utils/          # Funzioni helper
│   └── lib/            # Configurazioni (Supabase client)
├── supabase/
│   ├── schema.sql      # Schema database completo
│   ├── import_excel_data.php  # Script importazione dati (PHP)
│   ├── README.md       # Documentazione database
│   ├── README_PHP.md   # Documentazione script PHP
│   └── SETUP.md        # Guida setup database
├── .env                # Variabili d'ambiente (non committare!)
└── package.json
```

## 🛠️ Tecnologie

- **React 18** - Libreria UI
- **Vite** - Build tool
- **React Router** - Routing
- **Supabase** - Backend, Database, Auth

## 🗄️ Database

Il database Supabase replica la struttura del file Excel con le seguenti tabelle:

- **ruoli** - Ruoli lavorativi con tariffari (listino, fee)
- **ristoranti** - Anagrafica clienti/ristoranti
- **risorse** - Anagrafica dipendenti/risorse
- **servizi** - Tabella unificata per tutti i servizi mensili
- **fissi** - Assunzioni fisse
- **servizi_svizzera** - Servizi speciali per la Svizzera

Il database include:
- ✅ Calcoli automatici (durata, paga, fee)
- ✅ Viste per dashboard e reporting
- ✅ Row Level Security (RLS) per sicurezza
- ✅ Trigger per aggiornamento automatico timestamp

Vedi [supabase/README.md](supabase/README.md) per la documentazione completa.

## 📝 Note

Questo progetto trasforma un workflow Excel in un'applicazione web moderna, automatizzando tutti i calcoli e le formule presenti nel file Excel originale.

