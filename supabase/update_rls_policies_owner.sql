-- ============================================
-- AGGIORNAMENTO POLICIES RLS PER FILTRO PER UTENTE
-- ============================================
-- Aggiorna le policies per mostrare solo i dati dell'utente corrente
-- ============================================

-- Rimuovi le vecchie policies
DROP POLICY IF EXISTS "Utenti autenticati possono vedere tutti i dati" ON ruoli;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere tutti i dati" ON ristoranti;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere tutti i dati" ON risorse;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere tutti i dati" ON servizi;
DROP POLICY IF EXISTS "Utenti autenticati possono vedere tutti i dati" ON fissi;
DROP POLICY IF EXISTS "Utenti autenticati possono inserire dati" ON ruoli;
DROP POLICY IF EXISTS "Utenti autenticati possono inserire dati" ON ristoranti;
DROP POLICY IF EXISTS "Utenti autenticati possono inserire dati" ON risorse;
DROP POLICY IF EXISTS "Utenti autenticati possono inserire dati" ON servizi;
DROP POLICY IF EXISTS "Utenti autenticati possono inserire dati" ON fissi;
DROP POLICY IF EXISTS "Utenti autenticati possono modificare dati" ON ruoli;
DROP POLICY IF EXISTS "Utenti autenticati possono modificare dati" ON ristoranti;
DROP POLICY IF EXISTS "Utenti autenticati possono modificare dati" ON risorse;
DROP POLICY IF EXISTS "Utenti autenticati possono modificare dati" ON servizi;
DROP POLICY IF EXISTS "Utenti autenticati possono modificare dati" ON fissi;
DROP POLICY IF EXISTS "Utenti autenticati possono eliminare dati" ON ruoli;
DROP POLICY IF EXISTS "Utenti autenticati possono eliminare dati" ON ristoranti;
DROP POLICY IF EXISTS "Utenti autenticati possono eliminare dati" ON risorse;
DROP POLICY IF EXISTS "Utenti autenticati possono eliminare dati" ON servizi;
DROP POLICY IF EXISTS "Utenti autenticati possono eliminare dati" ON fissi;

-- Rimuovi anche le policies di sviluppo se esistono
DROP POLICY IF EXISTS "Accesso pubblico lettura ruoli" ON ruoli;
DROP POLICY IF EXISTS "Accesso pubblico lettura ristoranti" ON ristoranti;
DROP POLICY IF EXISTS "Accesso pubblico lettura risorse" ON risorse;
DROP POLICY IF EXISTS "Accesso pubblico lettura servizi" ON servizi;
DROP POLICY IF EXISTS "Accesso pubblico lettura fissi" ON fissi;
DROP POLICY IF EXISTS "Accesso pubblico inserimento ruoli" ON ruoli;
DROP POLICY IF EXISTS "Accesso pubblico inserimento ristoranti" ON ristoranti;
DROP POLICY IF EXISTS "Accesso pubblico inserimento risorse" ON risorse;
DROP POLICY IF EXISTS "Accesso pubblico inserimento servizi" ON servizi;
DROP POLICY IF EXISTS "Accesso pubblico inserimento fissi" ON fissi;
DROP POLICY IF EXISTS "Accesso pubblico modifica ruoli" ON ruoli;
DROP POLICY IF EXISTS "Accesso pubblico modifica ristoranti" ON ristoranti;
DROP POLICY IF EXISTS "Accesso pubblico modifica risorse" ON risorse;
DROP POLICY IF EXISTS "Accesso pubblico modifica servizi" ON servizi;
DROP POLICY IF EXISTS "Accesso pubblico modifica fissi" ON fissi;
DROP POLICY IF EXISTS "Accesso pubblico eliminazione ruoli" ON ruoli;
DROP POLICY IF EXISTS "Accesso pubblico eliminazione ristoranti" ON ristoranti;
DROP POLICY IF EXISTS "Accesso pubblico eliminazione risorse" ON risorse;
DROP POLICY IF EXISTS "Accesso pubblico eliminazione servizi" ON servizi;
DROP POLICY IF EXISTS "Accesso pubblico eliminazione fissi" ON fissi;

-- ============================================
-- NUOVE POLICIES: Solo i dati del proprietario
-- ============================================

-- RUOLI: SELECT - Solo i ruoli dell'utente corrente
CREATE POLICY "Utenti vedono solo i propri ruoli"
  ON ruoli FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- RUOLI: INSERT - L'utente può inserire solo con il proprio email
CREATE POLICY "Utenti inseriscono ruoli con il proprio email"
  ON ruoli FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RUOLI: UPDATE - L'utente può modificare solo i propri ruoli
CREATE POLICY "Utenti modificano solo i propri ruoli"
  ON ruoli FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RUOLI: DELETE - L'utente può eliminare solo i propri ruoli
CREATE POLICY "Utenti eliminano solo i propri ruoli"
  ON ruoli FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- RISTORANTI: SELECT
CREATE POLICY "Utenti vedono solo i propri ristoranti"
  ON ristoranti FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- RISTORANTI: INSERT
CREATE POLICY "Utenti inseriscono ristoranti con il proprio email"
  ON ristoranti FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RISTORANTI: UPDATE
CREATE POLICY "Utenti modificano solo i propri ristoranti"
  ON ristoranti FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RISTORANTI: DELETE
CREATE POLICY "Utenti eliminano solo i propri ristoranti"
  ON ristoranti FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- RISORSE: SELECT
CREATE POLICY "Utenti vedono solo le proprie risorse"
  ON risorse FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- RISORSE: INSERT
CREATE POLICY "Utenti inseriscono risorse con il proprio email"
  ON risorse FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RISORSE: UPDATE
CREATE POLICY "Utenti modificano solo le proprie risorse"
  ON risorse FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- RISORSE: DELETE
CREATE POLICY "Utenti eliminano solo le proprie risorse"
  ON risorse FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- SERVIZI: SELECT
CREATE POLICY "Utenti vedono solo i propri servizi"
  ON servizi FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- SERVIZI: INSERT
CREATE POLICY "Utenti inseriscono servizi con il proprio email"
  ON servizi FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- SERVIZI: UPDATE
CREATE POLICY "Utenti modificano solo i propri servizi"
  ON servizi FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- SERVIZI: DELETE
CREATE POLICY "Utenti eliminano solo i propri servizi"
  ON servizi FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- FISSI: SELECT
CREATE POLICY "Utenti vedono solo i propri fissi"
  ON fissi FOR SELECT
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));

-- FISSI: INSERT
CREATE POLICY "Utenti inseriscono fissi con il proprio email"
  ON fissi FOR INSERT
  TO authenticated
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- FISSI: UPDATE
CREATE POLICY "Utenti modificano solo i propri fissi"
  ON fissi FOR UPDATE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'))
  WITH CHECK (owner_email = (auth.jwt() ->> 'email'));

-- FISSI: DELETE
CREATE POLICY "Utenti eliminano solo i propri fissi"
  ON fissi FOR DELETE
  TO authenticated
  USING (owner_email = (auth.jwt() ->> 'email'));
