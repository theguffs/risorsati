-- ============================================
-- INSERIMENTO RISTORANTI (SOLO NOME)
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- ============================================

-- Inserisci i ristoranti (aggiorna se già esistono)
INSERT INTO ristoranti (nome)
VALUES
  ('B Monza'),
  ('Battilardo'),
  ('Le Belle Donne Bistrot'),
  ('Bravo Catering'),
  ('Carni&co'),
  ('Catering 1908'),
  ('Procaccini Milano'),
  ('DVCA Giardino'),
  ('Grace Club'),
  ('Granaio Concorezzo'),
  ('Hotel Crivi''s'),
  ('Grand Visconti Palace Hotel'),
  ('Hotel Uptown'),
  ('Il Carminio'),
  ('La Fettunta'),
  ('La Sirenella 2'),
  ('L''Amuri'),
  ('Le 5 Vie del Mare'),
  ('Lorenzo CAT'),
  ('Mascalzone'),
  ('Massimo Amato Catering'),
  ('Menady'),
  ('Rocca Ricevimenti'),
  ('Osteria Fiorentina'),
  ('P.I.G.'),
  ('Paoletti'),
  ('Parioli'),
  ('Domus Club'),
  ('PYT'),
  ('Ristorante Galleria'),
  ('Riviera'),
  ('Salotto Brera'),
  ('Terrammare'),
  ('Yacout'),
  ('La Sirenella'),
  ('Charlie Brown'),
  ('Ricchia'),
  ('Noor'),
  ('Shalto'),
  ('El Jadida'),
  ('Gabriele PR'),
  ('Pedevilla'),
  ('Hotel Vik Pellico 8'),
  ('RaMe'),
  ('Damot'''),
  ('Nuova Arena'),
  ('TL Bank'),
  ('Ammu'),
  ('Hosteria Della Musica'),
  ('Locanda 2 Orsi'),
  ('Golf Club Lugano'),
  ('Lupo Bar'),
  ('Pasticceria Bellavia'),
  ('Canottieri 1890'),
  ('Bar Elisir'),
  ('Innovo Consulting'),
  ('Padella Pazza'),
  ('Maja Beach'),
  ('Officina 24'),
  ('Padellina Vimodrone'),
  ('Cascina Romana'),
  ('La Bettola Di Piero'),
  ('Il Consolare'),
  ('Bistrot San Marco'),
  ('Voglia Milano')
ON CONFLICT (nome) DO UPDATE SET
  updated_at = NOW();

-- Verifica i ristoranti inseriti
SELECT * FROM ristoranti ORDER BY nome;

