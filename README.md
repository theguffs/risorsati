# Risorsati - Gestione Risorse

Applicazione web per la gestione di risorse, clienti e servizi, sviluppata con React e Supabase.

## 🚀 Setup

### Prerequisiti
- Node.js (v18 o superiore)
- npm o yarn
- Account Supabase

### Installazione

1. Installa le dipendenze:
```bash
npm install
```

2. Configura le variabili d'ambiente:
   - Copia `.env.example` in `.env`
   - Aggiungi le tue credenziali Supabase:
     - `VITE_SUPABASE_URL`: URL del tuo progetto Supabase
     - `VITE_SUPABASE_ANON_KEY`: Chiave anonima del tuo progetto Supabase

3. Avvia il server di sviluppo:
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
├── .env                # Variabili d'ambiente (non committare!)
└── package.json
```

## 🛠️ Tecnologie

- **React 18** - Libreria UI
- **Vite** - Build tool
- **React Router** - Routing
- **Supabase** - Backend, Database, Auth

## 📝 Note

Questo progetto trasforma un workflow Excel in un'applicazione web moderna.

