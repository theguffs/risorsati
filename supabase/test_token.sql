-- Script per verificare se un token esiste e è attivo
-- Sostituisci 'YOUR_TOKEN_HERE' con il tuo token

SELECT 
  id,
  owner_email,
  token,
  attivo,
  nome_form,
  created_at,
  last_used_at,
  total_submissions
FROM form_tokens
WHERE token = 'a3c8475235e83dafb4de3d451ef63c7e6b02b15a828fd0b01f89cce8c452f47e';

-- Se questa query non restituisce risultati, il token non esiste nel database
-- Se restituisce una riga con attivo = false, il token è disattivato

