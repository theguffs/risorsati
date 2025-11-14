-- ============================================
-- INSERIMENTO RUOLI PREDEFINITI
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- ============================================

-- Inserisci i ruoli (ignora se già esistono)
INSERT INTO ruoli (livello, ruolo, listino, fee_per_ora)
VALUES
  (3, 'Maitre', 15, 4),
  (3, 'Pulizie', 15, 5),
  (2, 'Barman', 12, 3),
  (2, 'Chef de Rang', 12, 3),
  (2, 'Banconista', 12, 3),
  (2, 'Cuoco, sushi-man', 12, 3),
  (1, 'Cameriere', 10, 2),
  (1, 'Hostess/Steward', 10, 2),
  (1, 'Lavapiatti', 10, 2),
  (1, 'Pizzaiolo', 12, 2),
  (1, 'Aiuto cuoco', 10, 2),
  (2, 'Commis di sala', 12, 2),
  (3, 'Trasferta/Notturno', 20, 5),
  (1, 'Runner', 10, 1.25),
  (2, 'Palmarista', 12, 1.25)
ON CONFLICT (ruolo) DO UPDATE SET
  livello = EXCLUDED.livello,
  listino = EXCLUDED.listino,
  fee_per_ora = EXCLUDED.fee_per_ora,
  updated_at = NOW();

-- Verifica i ruoli inseriti
SELECT * FROM ruoli ORDER BY livello, ruolo;

