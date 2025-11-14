-- ============================================
-- POLICIES RLS PER SVILUPPO (Accesso Anonimo)
-- ============================================
-- 
-- ATTENZIONE: Queste policies permettono accesso completo anche agli utenti anonimi.
-- Usa solo per sviluppo! In produzione usa le policies con autenticazione.
-- ============================================

-- Policy: Tutti possono vedere i dati (anonimi e autenticati)
DROP POLICY IF EXISTS "Accesso pubblico lettura ruoli" ON ruoli;
CREATE POLICY "Accesso pubblico lettura ruoli"
  ON ruoli FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico lettura ristoranti" ON ristoranti;
CREATE POLICY "Accesso pubblico lettura ristoranti"
  ON ristoranti FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico lettura risorse" ON risorse;
CREATE POLICY "Accesso pubblico lettura risorse"
  ON risorse FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico lettura servizi" ON servizi;
CREATE POLICY "Accesso pubblico lettura servizi"
  ON servizi FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico lettura fissi" ON fissi;
CREATE POLICY "Accesso pubblico lettura fissi"
  ON fissi FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico lettura servizi_svizzera" ON servizi_svizzera;
CREATE POLICY "Accesso pubblico lettura servizi_svizzera"
  ON servizi_svizzera FOR SELECT
  TO public
  USING (true);

-- Policy: Tutti possono inserire dati
DROP POLICY IF EXISTS "Accesso pubblico inserimento ruoli" ON ruoli;
CREATE POLICY "Accesso pubblico inserimento ruoli"
  ON ruoli FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico inserimento ristoranti" ON ristoranti;
CREATE POLICY "Accesso pubblico inserimento ristoranti"
  ON ristoranti FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico inserimento risorse" ON risorse;
CREATE POLICY "Accesso pubblico inserimento risorse"
  ON risorse FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico inserimento servizi" ON servizi;
CREATE POLICY "Accesso pubblico inserimento servizi"
  ON servizi FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico inserimento fissi" ON fissi;
CREATE POLICY "Accesso pubblico inserimento fissi"
  ON fissi FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico inserimento servizi_svizzera" ON servizi_svizzera;
CREATE POLICY "Accesso pubblico inserimento servizi_svizzera"
  ON servizi_svizzera FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Tutti possono modificare dati
DROP POLICY IF EXISTS "Accesso pubblico modifica ruoli" ON ruoli;
CREATE POLICY "Accesso pubblico modifica ruoli"
  ON ruoli FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico modifica ristoranti" ON ristoranti;
CREATE POLICY "Accesso pubblico modifica ristoranti"
  ON ristoranti FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico modifica risorse" ON risorse;
CREATE POLICY "Accesso pubblico modifica risorse"
  ON risorse FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico modifica servizi" ON servizi;
CREATE POLICY "Accesso pubblico modifica servizi"
  ON servizi FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico modifica fissi" ON fissi;
CREATE POLICY "Accesso pubblico modifica fissi"
  ON fissi FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso pubblico modifica servizi_svizzera" ON servizi_svizzera;
CREATE POLICY "Accesso pubblico modifica servizi_svizzera"
  ON servizi_svizzera FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Tutti possono eliminare dati
DROP POLICY IF EXISTS "Accesso pubblico eliminazione ruoli" ON ruoli;
CREATE POLICY "Accesso pubblico eliminazione ruoli"
  ON ruoli FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico eliminazione ristoranti" ON ristoranti;
CREATE POLICY "Accesso pubblico eliminazione ristoranti"
  ON ristoranti FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico eliminazione risorse" ON risorse;
CREATE POLICY "Accesso pubblico eliminazione risorse"
  ON risorse FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico eliminazione servizi" ON servizi;
CREATE POLICY "Accesso pubblico eliminazione servizi"
  ON servizi FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico eliminazione fissi" ON fissi;
CREATE POLICY "Accesso pubblico eliminazione fissi"
  ON fissi FOR DELETE
  TO public
  USING (true);

DROP POLICY IF EXISTS "Accesso pubblico eliminazione servizi_svizzera" ON servizi_svizzera;
CREATE POLICY "Accesso pubblico eliminazione servizi_svizzera"
  ON servizi_svizzera FOR DELETE
  TO public
  USING (true);

