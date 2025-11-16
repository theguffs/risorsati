-- ============================================
-- SCHEMA DATABASE RISORSATI
-- Replica della struttura Excel in Supabase
-- ============================================

-- Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELLE DI LOOKUP
-- ============================================

-- Tabella Ruoli (da Anagrafica)
CREATE TABLE IF NOT EXISTS ruoli (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livello INTEGER NOT NULL,
  ruolo TEXT NOT NULL UNIQUE,
  listino NUMERIC(10,2) NOT NULL,
  fee_per_ora NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Ristoranti/Clienti (da Anagrafica)
CREATE TABLE IF NOT EXISTS ristoranti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codice TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  codice_completo TEXT GENERATED ALWAYS AS (CASE WHEN nome IS NOT NULL THEN codice || '-' || nome ELSE NULL END) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Risorse (Dipendenti) (da Anagrafica)
CREATE TABLE IF NOT EXISTS risorse (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codice TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  codice_completo TEXT GENERATED ALWAYS AS (CASE WHEN nome IS NOT NULL THEN codice || '-' || nome ELSE NULL END) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA SERVIZI (Unifica tutti i mesi)
-- ============================================

CREATE TABLE IF NOT EXISTS servizi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente TEXT NOT NULL,
  data DATE NOT NULL,
  mese INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM data)) STORED,
  anno INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM data)) STORED,
  risorsa_id UUID REFERENCES risorse(id) ON DELETE SET NULL,
  risorsa_nome TEXT, -- Mantenuto per compatibilità
  ruolo_id UUID REFERENCES ruoli(id) ON DELETE SET NULL,
  ruolo_nome TEXT, -- Mantenuto per compatibilità
  orario_inizio TIME,
  orario_fine TIME,
  durata_ore INTERVAL GENERATED ALWAYS AS (
    CASE 
      WHEN orario_fine IS NOT NULL AND orario_inizio IS NOT NULL 
      THEN orario_fine - orario_inizio
      ELSE NULL
    END
  ) STORED,
  durata_ore_numeric NUMERIC(10,2) GENERATED ALWAYS AS (
    CASE 
      WHEN orario_fine IS NOT NULL AND orario_inizio IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (orario_fine - orario_inizio)) / 3600
      ELSE NULL
    END
  ) STORED,
  paga NUMERIC(10,2),
  fee NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_servizi_data ON servizi(data);
CREATE INDEX IF NOT EXISTS idx_servizi_mese_anno ON servizi(mese, anno);
CREATE INDEX IF NOT EXISTS idx_servizi_cliente ON servizi(cliente);
CREATE INDEX IF NOT EXISTS idx_servizi_risorsa_id ON servizi(risorsa_id);
CREATE INDEX IF NOT EXISTS idx_servizi_ruolo_id ON servizi(ruolo_id);

-- ============================================
-- TABELLA FISSI (Assunzioni fisse)
-- ============================================

CREATE TABLE IF NOT EXISTS fissi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente TEXT NOT NULL,
  data DATE NOT NULL,
  mese INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM data)) STORED,
  risorsa_id UUID REFERENCES risorse(id) ON DELETE SET NULL,
  risorsa_nome TEXT,
  ruolo_id UUID REFERENCES ruoli(id) ON DELETE SET NULL,
  ruolo_nome TEXT,
  orari_diurni TEXT,
  orari_serali TEXT,
  colloquio BOOLEAN DEFAULT FALSE,
  prova BOOLEAN DEFAULT FALSE,
  assunzione BOOLEAN DEFAULT FALSE,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_fissi_data ON fissi(data);
CREATE INDEX IF NOT EXISTS idx_fissi_mese ON fissi(mese);
CREATE INDEX IF NOT EXISTS idx_fissi_cliente ON fissi(cliente);

-- ============================================
-- TABELLA SERVIZI SVIZZERA
-- ============================================

CREATE TABLE IF NOT EXISTS servizi_svizzera (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE NOT NULL,
  ora_inizio TIME,
  ora_fine TIME,
  ore NUMERIC(10,2),
  paga NUMERIC(10,2),
  fee NUMERIC(10,2) DEFAULT 0,
  luogo TEXT,
  persona TEXT,
  benzina BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_servizi_svizzera_data ON servizi_svizzera(data);

-- ============================================
-- FUNZIONI PER CALCOLI AUTOMATICI
-- ============================================

-- Funzione per calcolare la Paga basata su durata e ruolo
CREATE OR REPLACE FUNCTION calcola_paga(
  durata_ore_numeric NUMERIC,
  ruolo_id_param UUID
) RETURNS NUMERIC AS $$
DECLARE
  listino_val NUMERIC;
BEGIN
  SELECT listino INTO listino_val
  FROM ruoli
  WHERE id = ruolo_id_param;
  
  IF listino_val IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN durata_ore_numeric * listino_val;
END;
$$ LANGUAGE plpgsql;

-- Funzione per calcolare il Fee basato su cliente, durata e ruolo
CREATE OR REPLACE FUNCTION calcola_fee(
  cliente_nome TEXT,
  durata_ore_numeric NUMERIC,
  ruolo_id_param UUID
) RETURNS NUMERIC AS $$
DECLARE
  fee_per_ora_val NUMERIC;
  fee_calcolato NUMERIC;
BEGIN
  SELECT fee_per_ora INTO fee_per_ora_val
  FROM ruoli
  WHERE id = ruolo_id_param;
  
  IF fee_per_ora_val IS NULL THEN
    RETURN NULL;
  END IF;
  
  fee_calcolato := durata_ore_numeric * fee_per_ora_val;
  
  -- Clienti speciali con fee dimezzato
  IF cliente_nome IN ('Nuova Arena', 'Pedevilla', 'Hosteria Della Musica') THEN
    fee_calcolato := fee_calcolato / 2;
  END IF;
  
  RETURN fee_calcolato;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger a tutte le tabelle
CREATE TRIGGER update_ruoli_updated_at BEFORE UPDATE ON ruoli
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ristoranti_updated_at BEFORE UPDATE ON ristoranti
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risorse_updated_at BEFORE UPDATE ON risorse
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servizi_updated_at BEFORE UPDATE ON servizi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fissi_updated_at BEFORE UPDATE ON fissi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servizi_svizzera_updated_at BEFORE UPDATE ON servizi_svizzera
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTE PER DASHBOARD E REPORTING
-- ============================================

-- Vista per analisi portafoglio (fatturato per cliente/mese)
CREATE OR REPLACE VIEW vista_fatturato_mensile AS
SELECT 
  cliente,
  mese,
  anno,
  COUNT(*) as numero_servizi,
  SUM(COALESCE(paga, 0)) as totale_paga,
  SUM(COALESCE(fee, 0)) as totale_fee,
  SUM(COALESCE(paga, 0) + COALESCE(fee, 0)) as fatturato_totale
FROM servizi
GROUP BY cliente, mese, anno
ORDER BY anno DESC, mese DESC, cliente;

-- Vista per dashboard generale
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

-- ============================================
-- POLICIES RLS (Row Level Security)
-- ============================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE ruoli ENABLE ROW LEVEL SECURITY;
ALTER TABLE ristoranti ENABLE ROW LEVEL SECURITY;
ALTER TABLE risorse ENABLE ROW LEVEL SECURITY;
ALTER TABLE servizi ENABLE ROW LEVEL SECURITY;
ALTER TABLE fissi ENABLE ROW LEVEL SECURITY;
ALTER TABLE servizi_svizzera ENABLE ROW LEVEL SECURITY;

-- Policy: Solo utenti autenticati possono vedere i dati
CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON ruoli FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON ristoranti FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON risorse FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON servizi FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON fissi FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono vedere tutti i dati"
  ON servizi_svizzera FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo utenti autenticati possono inserire/modificare dati
CREATE POLICY "Utenti autenticati possono inserire dati"
  ON ruoli FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono inserire dati"
  ON ristoranti FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono inserire dati"
  ON risorse FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono inserire dati"
  ON servizi FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono inserire dati"
  ON fissi FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono inserire dati"
  ON servizi_svizzera FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON ruoli FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON ristoranti FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON risorse FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON servizi FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON fissi FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono modificare dati"
  ON servizi_svizzera FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON ruoli FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON ristoranti FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON risorse FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON servizi FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON fissi FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Utenti autenticati possono eliminare dati"
  ON servizi_svizzera FOR DELETE
  TO authenticated
  USING (true);











