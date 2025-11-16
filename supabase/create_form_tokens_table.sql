-- ============================================
-- TABELLA PER GESTIRE TOKEN API DEI FORM PUBBLICI
-- ============================================

CREATE TABLE IF NOT EXISTS form_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  nome_form TEXT,
  attivo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  total_submissions INTEGER DEFAULT 0
);

-- Indice per ricerca veloce per token
CREATE INDEX IF NOT EXISTS idx_form_tokens_token ON form_tokens(token);
CREATE INDEX IF NOT EXISTS idx_form_tokens_owner_email ON form_tokens(owner_email);

-- Trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_form_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_form_tokens_updated_at ON form_tokens;
CREATE TRIGGER update_form_tokens_updated_at 
  BEFORE UPDATE ON form_tokens
  FOR EACH ROW 
  EXECUTE FUNCTION update_form_tokens_updated_at();

-- RLS Policies per form_tokens
ALTER TABLE form_tokens ENABLE ROW LEVEL SECURITY;

-- SELECT: Gli utenti vedono solo i propri token
CREATE POLICY "Utenti vedono solo i propri form tokens"
  ON form_tokens FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- INSERT: Gli utenti possono creare solo token con il proprio email
CREATE POLICY "Utenti creano token con il proprio email"
  ON form_tokens FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- UPDATE: Gli utenti possono modificare solo i propri token
CREATE POLICY "Utenti modificano solo i propri form tokens"
  ON form_tokens FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- DELETE: Gli utenti possono eliminare solo i propri token
CREATE POLICY "Utenti eliminano solo i propri form tokens"
  ON form_tokens FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

