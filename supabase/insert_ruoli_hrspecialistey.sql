-- ============================================
-- INSERIMENTO RUOLI PER hrspecialistey@gmail.com
-- ============================================
-- Esegui questo script nel Supabase SQL Editor
-- ============================================

-- Inserisci i ruoli con owner_email = 'hrspecialistey@gmail.com'
INSERT INTO ruoli (livello, ruolo, listino, fee_per_ora, owner_email)
VALUES
  (3, 'Maitre', 15, 4, 'hrspecialistey@gmail.com'),
  (3, 'Pulizie', 15, 5, 'hrspecialistey@gmail.com'),
  (2, 'Barman', 12, 3, 'hrspecialistey@gmail.com'),
  (2, 'Chef de Rang', 12, 3, 'hrspecialistey@gmail.com'),
  (2, 'Banconista', 12, 3, 'hrspecialistey@gmail.com'),
  (2, 'Cuoco, sushi-man', 12, 3, 'hrspecialistey@gmail.com'),
  (1, 'Cameriere', 10, 2, 'hrspecialistey@gmail.com'),
  (1, 'Hostess/Steward', 10, 2, 'hrspecialistey@gmail.com'),
  (1, 'Lavapiatti', 10, 2, 'hrspecialistey@gmail.com'),
  (1, 'Pizzaiolo', 12, 2, 'hrspecialistey@gmail.com'),
  (1, 'Aiuto cuoco', 10, 2, 'hrspecialistey@gmail.com'),
  (2, 'Commis di sala', 12, 2, 'hrspecialistey@gmail.com'),
  (3, 'Trasferta/Notturno', 20, 5, 'hrspecialistey@gmail.com'),
  (1, 'Runner', 10, 1.25, 'hrspecialistey@gmail.com'),
  (2, 'Palmarista', 12, 1.25, 'hrspecialistey@gmail.com')
ON CONFLICT (ruolo) DO UPDATE SET
  livello = EXCLUDED.livello,
  listino = EXCLUDED.listino,
  fee_per_ora = EXCLUDED.fee_per_ora,
  owner_email = EXCLUDED.owner_email,
  updated_at = NOW();

-- Verifica i ruoli inseriti
SELECT 
  livello,
  ruolo,
  listino,
  fee_per_ora,
  owner_email
FROM ruoli 
WHERE owner_email = 'hrspecialistey@gmail.com'
ORDER BY livello, ruolo;

-- Conta i ruoli inseriti
SELECT COUNT(*) as totale_ruoli 
FROM ruoli 
WHERE owner_email = 'hrspecialistey@gmail.com';

