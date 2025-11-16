-- ============================================
-- FIX CALCOLO DURATA SERVIZI
-- ============================================
-- Corregge il calcolo della durata per gestire correttamente
-- i servizi che iniziano la sera e finiscono dopo la mezzanotte
-- ============================================

-- 1. Crea una funzione per calcolare correttamente la durata
-- La funzione è IMMUTABLE perché produce sempre lo stesso risultato per gli stessi input
CREATE OR REPLACE FUNCTION calcola_durata_ore(
  orario_inizio_param TIME,
  orario_fine_param TIME
) RETURNS NUMERIC AS $$
DECLARE
  inizio_minuti INTEGER;
  fine_minuti INTEGER;
  durata_minuti INTEGER;
BEGIN
  -- Se uno dei due orari è NULL, ritorna NULL
  IF orario_inizio_param IS NULL OR orario_fine_param IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Converti gli orari in minuti totali dalla mezzanotte
  inizio_minuti := EXTRACT(HOUR FROM orario_inizio_param)::INTEGER * 60 + 
                   EXTRACT(MINUTE FROM orario_inizio_param)::INTEGER;
  fine_minuti := EXTRACT(HOUR FROM orario_fine_param)::INTEGER * 60 + 
                 EXTRACT(MINUTE FROM orario_fine_param)::INTEGER;
  
  -- Se l'orario fine è minore dell'orario inizio, significa che è passata la mezzanotte
  -- Esempio: inizio 19:00 (1140 minuti), fine 02:00 (120 minuti)
  -- 120 < 1140, quindi aggiungiamo 24 ore (1440 minuti)
  IF fine_minuti < inizio_minuti THEN
    fine_minuti := fine_minuti + (24 * 60); -- Aggiungi 24 ore
  END IF;
  
  -- Se l'orario fine è esattamente 00:00 e l'inizio è dopo mezzogiorno,
  -- trattalo come 24:00 (mezzanotte del giorno dopo)
  IF fine_minuti = 0 AND EXTRACT(HOUR FROM orario_inizio_param)::INTEGER >= 12 THEN
    fine_minuti := 24 * 60; -- 1440 minuti (24 ore)
  END IF;
  
  -- Calcola la durata in minuti
  durata_minuti := fine_minuti - inizio_minuti;
  
  -- Se la durata è negativa o zero, ritorna NULL
  IF durata_minuti <= 0 THEN
    RETURN NULL;
  END IF;
  
  -- Converti in ore e ritorna
  RETURN (durata_minuti::NUMERIC / 60.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Salva la definizione della vista dashboard (se esiste)
-- e la elimina temporaneamente per permettere la modifica della colonna
DO $$
DECLARE
  vista_definition TEXT;
BEGIN
  -- Prova a ottenere la definizione della vista
  SELECT definition INTO vista_definition
  FROM pg_views
  WHERE viewname = 'vista_dashboard' AND schemaname = 'public';
  
  -- Se la vista esiste, la eliminiamo temporaneamente
  IF vista_definition IS NOT NULL THEN
    DROP VIEW IF EXISTS vista_dashboard CASCADE;
    RAISE NOTICE 'Vista vista_dashboard eliminata temporaneamente';
  END IF;
END $$;

-- 3. Elimina la colonna durata_ore_numeric esistente
ALTER TABLE servizi DROP COLUMN IF EXISTS durata_ore_numeric;

-- 4. Ricrea la colonna durata_ore_numeric con il calcolo corretto
ALTER TABLE servizi ADD COLUMN durata_ore_numeric NUMERIC(10,2) 
  GENERATED ALWAYS AS (
    calcola_durata_ore(orario_inizio, orario_fine)
  ) STORED;

-- 5. Ricrea la vista dashboard (se esisteva)
CREATE OR REPLACE VIEW vista_dashboard AS
SELECT 
  COUNT(DISTINCT cliente) as totale_clienti,
  COUNT(*) as totale_servizi,
  SUM(COALESCE(paga, 0)) as fatturato_paga,
  SUM(COALESCE(fee, 0)) as fatturato_fee,
  SUM(COALESCE(paga, 0) + COALESCE(fee, 0)) as fatturato_totale,
  AVG(COALESCE(durata_ore_numeric, 0)) as durata_media_ore
FROM servizi
WHERE anno = EXTRACT(YEAR FROM CURRENT_DATE);

-- 6. Verifica i risultati
SELECT 
  id,
  orario_inizio,
  orario_fine,
  durata_ore_numeric,
  CASE 
    WHEN durata_ore_numeric IS NULL THEN '⚠️ Durata non calcolata'
    WHEN durata_ore_numeric < 0 THEN '❌ Durata negativa'
    ELSE '✅ OK'
  END as stato
FROM servizi
WHERE orario_inizio IS NOT NULL AND orario_fine IS NOT NULL
ORDER BY durata_ore_numeric ASC
LIMIT 20;

-- 7. Mostra statistiche
SELECT 
  COUNT(*) as totale_servizi,
  COUNT(CASE WHEN durata_ore_numeric IS NULL THEN 1 END) as senza_durata,
  COUNT(CASE WHEN durata_ore_numeric < 0 THEN 1 END) as durata_negativa,
  COUNT(CASE WHEN durata_ore_numeric > 0 THEN 1 END) as durata_ok,
  ROUND(AVG(durata_ore_numeric), 2) as durata_media_ore
FROM servizi
WHERE orario_inizio IS NOT NULL AND orario_fine IS NOT NULL;

