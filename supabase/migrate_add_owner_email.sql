-- ============================================
-- MIGRAZIONE: Aggiungi owner_email alle tabelle
-- ============================================
-- Aggiunge il campo owner_email per filtrare i dati per utente
-- ============================================

-- 1. Aggiungi owner_email alle tabelle principali
ALTER TABLE ruoli ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE ristoranti ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE risorse ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE servizi ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE fissi ADD COLUMN IF NOT EXISTS owner_email TEXT;

-- 2. Imposta i dati esistenti come appartenenti a youssefabdelmalak01@gmail.com
UPDATE ruoli SET owner_email = 'youssefabdelmalak01@gmail.com' WHERE owner_email IS NULL;
UPDATE ristoranti SET owner_email = 'youssefabdelmalak01@gmail.com' WHERE owner_email IS NULL;
UPDATE risorse SET owner_email = 'youssefabdelmalak01@gmail.com' WHERE owner_email IS NULL;
UPDATE servizi SET owner_email = 'youssefabdelmalak01@gmail.com' WHERE owner_email IS NULL;
UPDATE fissi SET owner_email = 'youssefabdelmalak01@gmail.com' WHERE owner_email IS NULL;

-- 3. Rendi owner_email NOT NULL dopo aver popolato i dati esistenti
ALTER TABLE ruoli ALTER COLUMN owner_email SET NOT NULL;
ALTER TABLE ristoranti ALTER COLUMN owner_email SET NOT NULL;
ALTER TABLE risorse ALTER COLUMN owner_email SET NOT NULL;
ALTER TABLE servizi ALTER COLUMN owner_email SET NOT NULL;
ALTER TABLE fissi ALTER COLUMN owner_email SET NOT NULL;

-- 4. Crea indici per migliorare le performance delle query
CREATE INDEX IF NOT EXISTS idx_ruoli_owner_email ON ruoli(owner_email);
CREATE INDEX IF NOT EXISTS idx_ristoranti_owner_email ON ristoranti(owner_email);
CREATE INDEX IF NOT EXISTS idx_risorse_owner_email ON risorse(owner_email);
CREATE INDEX IF NOT EXISTS idx_servizi_owner_email ON servizi(owner_email);
CREATE INDEX IF NOT EXISTS idx_fissi_owner_email ON fissi(owner_email);

-- 5. Verifica la struttura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('ruoli', 'ristoranti', 'risorse', 'servizi', 'fissi')
  AND column_name = 'owner_email'
ORDER BY table_name;

