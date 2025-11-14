-- ============================================
-- MIGRAZIONE: RISTORANTI - SOLO NOME
-- ============================================
-- Rimuove codice e codice_completo, mantiene solo nome
-- ============================================

-- 1. Rimuovi il vincolo UNIQUE su codice (se esiste)
ALTER TABLE ristoranti DROP CONSTRAINT IF EXISTS ristoranti_codice_key;

-- 2. Rimuovi la colonna codice_completo (generated column)
ALTER TABLE ristoranti DROP COLUMN IF EXISTS codice_completo;

-- 3. Rimuovi la colonna codice
ALTER TABLE ristoranti DROP COLUMN IF EXISTS codice;

-- 4. Aggiungi vincolo UNIQUE su nome (per evitare duplicati)
ALTER TABLE ristoranti ADD CONSTRAINT ristoranti_nome_key UNIQUE (nome);

-- 5. Verifica la struttura finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ristoranti'
ORDER BY ordinal_position;

