-- ============================================
-- MIGRAZIONE: RISORSE - SOLO NOME
-- ============================================
-- Rimuove codice e codice_completo, mantiene solo nome
-- ============================================

-- 1. Rimuovi il vincolo UNIQUE su codice (se esiste)
ALTER TABLE risorse DROP CONSTRAINT IF EXISTS risorse_codice_key;

-- 2. Rimuovi la colonna codice_completo (generated column)
ALTER TABLE risorse DROP COLUMN IF EXISTS codice_completo;

-- 3. Rimuovi la colonna codice
ALTER TABLE risorse DROP COLUMN IF EXISTS codice;

-- 4. Aggiungi vincolo UNIQUE su nome (per evitare duplicati)
ALTER TABLE risorse ADD CONSTRAINT risorse_nome_key UNIQUE (nome);

-- 5. Verifica la struttura finale
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'risorse'
ORDER BY ordinal_position;

