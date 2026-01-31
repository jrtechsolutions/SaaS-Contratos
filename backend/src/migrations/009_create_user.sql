-- ============================================
-- SCRIPT: Criar usuário admin
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- IMPORTANTE: Para gerar o hash bcrypt da senha, você tem 3 opções:

-- OPÇÃO 1: Usar a API de registro (RECOMENDADO)
-- POST http://localhost:3001/api/auth/register
-- Body: {
--   "email": "admin@exemplo.com",
--   "password": "suaSenha123",
--   "full_name": "Administrador"
-- }

-- OPÇÃO 2: Gerar hash online
-- Acesse: https://bcrypt-generator.com/
-- Digite sua senha e copie o hash gerado
-- Use o hash no INSERT abaixo

-- OPÇÃO 3: Gerar hash via Node.js (no terminal do backend)
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('suaSenha123', 10).then(hash => console.log(hash));"

-- ============================================
-- EXEMPLO: Criar usuário com senha "admin123"
-- ============================================
-- Hash bcrypt para senha "admin123" (gerado com salt rounds 10):
-- $2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq

-- ATENÇÃO: Substitua o hash abaixo pelo hash da SUA senha!
-- NÃO use o hash de exemplo em produção!

INSERT INTO users (email, password_hash, full_name)
VALUES (
  'admin@exemplo.com',  -- Substitua pelo email desejado
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',  -- Substitua pelo hash da sua senha
  'Administrador'  -- Substitua pelo nome desejado
)
ON CONFLICT (email) DO NOTHING;  -- Não cria se o email já existir

-- ============================================
-- Para verificar se o usuário foi criado:
-- ============================================
-- SELECT id, email, full_name, created_at FROM users;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
