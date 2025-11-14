-- ============================================
-- SVUOTAMENTO DATI (Mantiene autenticazione)
-- ============================================
-- Elimina tutti i dati dalle tabelle principali
-- NON tocca le tabelle di autenticazione (auth.*)
-- ============================================

-- Disabilita temporaneamente i trigger per evitare errori
SET session_replication_role = 'replica';

-- Elimina tutti i dati dalle tabelle (in ordine per rispettare le foreign keys)
DELETE FROM servizi_svizzera;
DELETE FROM servizi;
DELETE FROM fissi;
DELETE FROM risorse;
DELETE FROM ristoranti;
DELETE FROM ruoli;

-- Riabilita i trigger
SET session_replication_role = 'origin';

-- Verifica che le tabelle siano vuote
SELECT 
  'ruoli' as tabella, COUNT(*) as record FROM ruoli
UNION ALL
SELECT 
  'ristoranti' as tabella, COUNT(*) as record FROM ristoranti
UNION ALL
SELECT 
  'risorse' as tabella, COUNT(*) as record FROM risorse
UNION ALL
SELECT 
  'servizi' as tabella, COUNT(*) as record FROM servizi
UNION ALL
SELECT 
  'fissi' as tabella, COUNT(*) as record FROM fissi
UNION ALL
SELECT 
  'servizi_svizzera' as tabella, COUNT(*) as record FROM servizi_svizzera;

-- Messaggio di conferma
DO $$
BEGIN
  RAISE NOTICE 'Tutti i dati sono stati eliminati. Le tabelle di autenticazione sono rimaste intatte.';
END $$;

