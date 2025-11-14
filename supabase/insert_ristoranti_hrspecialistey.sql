-- ============================================
-- INSERIMENTO RISTORANTI PER hrspecialistey@gmail.com
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- ============================================

-- Inserisci i ristoranti con owner_email = 'hrspecialistey@gmail.com'
INSERT INTO ristoranti (nome, owner_email)
VALUES
  ('B Monza', 'hrspecialistey@gmail.com'),
  ('Battilardo', 'hrspecialistey@gmail.com'),
  ('Le Belle Donne Bistrot', 'hrspecialistey@gmail.com'),
  ('Bravo Catering', 'hrspecialistey@gmail.com'),
  ('Carni&co', 'hrspecialistey@gmail.com'),
  ('Catering 1908', 'hrspecialistey@gmail.com'),
  ('Procaccini Milano', 'hrspecialistey@gmail.com'),
  ('DVCA Giardino', 'hrspecialistey@gmail.com'),
  ('Grace Club', 'hrspecialistey@gmail.com'),
  ('Granaio Concorezzo', 'hrspecialistey@gmail.com'),
  ('Hotel Crivi''s', 'hrspecialistey@gmail.com'),
  ('Grand Visconti Palace Hotel', 'hrspecialistey@gmail.com'),
  ('Hotel Uptown', 'hrspecialistey@gmail.com'),
  ('Il Carminio', 'hrspecialistey@gmail.com'),
  ('La Fettunta', 'hrspecialistey@gmail.com'),
  ('La Sirenella 2', 'hrspecialistey@gmail.com'),
  ('L''Amuri', 'hrspecialistey@gmail.com'),
  ('Le 5 Vie del Mare', 'hrspecialistey@gmail.com'),
  ('Lorenzo CAT', 'hrspecialistey@gmail.com'),
  ('Mascalzone', 'hrspecialistey@gmail.com'),
  ('Massimo Amato Catering', 'hrspecialistey@gmail.com'),
  ('Menady', 'hrspecialistey@gmail.com'),
  ('Rocca Ricevimenti', 'hrspecialistey@gmail.com'),
  ('Osteria Fiorentina', 'hrspecialistey@gmail.com'),
  ('P.I.G.', 'hrspecialistey@gmail.com'),
  ('Paoletti', 'hrspecialistey@gmail.com'),
  ('Parioli', 'hrspecialistey@gmail.com'),
  ('Domus Club', 'hrspecialistey@gmail.com'),
  ('PYT', 'hrspecialistey@gmail.com'),
  ('Ristorante Galleria', 'hrspecialistey@gmail.com'),
  ('Riviera', 'hrspecialistey@gmail.com'),
  ('Salotto Brera', 'hrspecialistey@gmail.com'),
  ('Terrammare', 'hrspecialistey@gmail.com'),
  ('Yacout', 'hrspecialistey@gmail.com'),
  ('La Sirenella', 'hrspecialistey@gmail.com'),
  ('Charlie Brown', 'hrspecialistey@gmail.com'),
  ('Ricchia', 'hrspecialistey@gmail.com'),
  ('Noor', 'hrspecialistey@gmail.com'),
  ('Shalto', 'hrspecialistey@gmail.com'),
  ('El Jadida', 'hrspecialistey@gmail.com'),
  ('Gabriele PR', 'hrspecialistey@gmail.com'),
  ('Pedevilla', 'hrspecialistey@gmail.com'),
  ('Hotel Vik Pellico 8', 'hrspecialistey@gmail.com'),
  ('RaMe', 'hrspecialistey@gmail.com'),
  ('Damot''', 'hrspecialistey@gmail.com'),
  ('Nuova Arena', 'hrspecialistey@gmail.com'),
  ('TL Bank', 'hrspecialistey@gmail.com'),
  ('Ammu', 'hrspecialistey@gmail.com'),
  ('Hosteria Della Musica', 'hrspecialistey@gmail.com'),
  ('Locanda 2 Orsi', 'hrspecialistey@gmail.com'),
  ('Golf Club Lugano', 'hrspecialistey@gmail.com'),
  ('Lupo Bar', 'hrspecialistey@gmail.com'),
  ('Pasticceria Bellavia', 'hrspecialistey@gmail.com'),
  ('Canottieri 1890', 'hrspecialistey@gmail.com'),
  ('Bar Elisir', 'hrspecialistey@gmail.com'),
  ('Innovo Consulting', 'hrspecialistey@gmail.com'),
  ('Padella Pazza', 'hrspecialistey@gmail.com'),
  ('Maja Beach', 'hrspecialistey@gmail.com'),
  ('Officina 24', 'hrspecialistey@gmail.com'),
  ('Padellina Vimodrone', 'hrspecialistey@gmail.com'),
  ('Cascina Romana', 'hrspecialistey@gmail.com'),
  ('La Bettola Di Piero', 'hrspecialistey@gmail.com'),
  ('Il Consolare', 'hrspecialistey@gmail.com'),
  ('Bistrot San Marco', 'hrspecialistey@gmail.com'),
  ('Voglia Milano', 'hrspecialistey@gmail.com')
ON CONFLICT (nome) DO UPDATE SET
  owner_email = EXCLUDED.owner_email,
  updated_at = NOW();

-- Verifica i ristoranti inseriti
SELECT 
  nome,
  owner_email
FROM ristoranti 
WHERE owner_email = 'hrspecialistey@gmail.com'
ORDER BY nome;

-- Conta i ristoranti inseriti
SELECT COUNT(*) as totale_ristoranti 
FROM ristoranti 
WHERE owner_email = 'hrspecialistey@gmail.com';

