-- ============================================
-- INSERIMENTO RISTORANTI PREDEFINITI
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- ============================================

-- Inserisci i ristoranti (aggiorna se già esistono)
INSERT INTO ristoranti (codice, nome)
VALUES
  ('C1', 'B Monza'),
  ('C2', 'Battilardo'),
  ('C3', 'Le Belle Donne Bistrot'),
  ('C4', 'Bravo Catering'),
  ('C5', 'Carni&co'),
  ('C6', 'Catering 1908'),
  ('C7', 'Procaccini Milano'),
  ('C8', 'DVCA Giardino'),
  ('C9', 'Grace Club'),
  ('C10', 'Granaio Concorezzo'),
  ('C11', 'Hotel Crivi''s'),
  ('C12', 'Grand Visconti Palace Hotel'),
  ('C13', 'Hotel Uptown'),
  ('C14', 'Il Carminio'),
  ('C15', 'La Fettunta'),
  ('C16', 'La Sirenella 2'),
  ('C17', 'L''Amuri'),
  ('C18', 'Le 5 Vie del Mare'),
  ('C19', 'Lorenzo CAT'),
  ('C20', 'Mascalzone'),
  ('C21', 'Massimo Amato Catering'),
  ('C22', 'Menady'),
  ('C23', 'Rocca Ricevimenti'),
  ('C24', 'Osteria Fiorentina'),
  ('C25', 'P.I.G.'),
  ('C26', 'Paoletti'),
  ('C27', 'Parioli'),
  ('C28', 'Domus Club'),
  ('C29', 'PYT'),
  ('C30', 'Ristorante Galleria'),
  ('C31', 'Riviera'),
  ('C32', 'Salotto Brera'),
  ('C33', 'Terrammare'),
  ('C34', 'Yacout'),
  ('C35', 'La Sirenella'),
  ('C36', 'Charlie Brown'),
  ('C37', 'Ricchia'),
  ('C38', 'Noor'),
  ('C39', 'Shalto'),
  ('C40', 'El Jadida'),
  ('C41', 'Gabriele PR'),
  ('C42', 'Pedevilla'),
  ('C43', 'Hotel Vik Pellico 8'),
  ('C44', 'RaMe'),
  ('C45', 'Damot'''),
  ('C46', 'Nuova Arena'),
  ('C47', 'TL Bank'),
  ('C48', 'Ammu'),
  ('C49', 'Hosteria Della Musica'),
  ('C50', 'Locanda 2 Orsi'),
  ('C51', 'Golf Club Lugano'),
  ('C52', 'Lupo Bar'),
  ('C53', 'Pasticceria Bellavia'),
  ('C54', 'Canottieri 1890'),
  ('C55', 'Bar Elisir'),
  ('C56', 'Innovo Consulting'),
  ('C57', 'Padella Pazza'),
  ('C58', 'Maja Beach'),
  ('C59', 'Officina 24'),
  ('C60', 'Padellina Vimodrone'),
  ('C61', 'Cascina Romana'),
  ('C62', 'La Bettola Di Piero'),
  ('C63', 'Il Consolare'),
  ('C64', 'Bistrot San Marco'),
  ('C65', 'Voglia Milano')
ON CONFLICT (codice) DO UPDATE SET
  nome = EXCLUDED.nome,
  updated_at = NOW();

-- Verifica i ristoranti inseriti
SELECT * FROM ristoranti ORDER BY codice;

