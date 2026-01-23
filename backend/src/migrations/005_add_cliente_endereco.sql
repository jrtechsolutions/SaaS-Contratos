-- ============================================
-- MIGRATION: Adicionar campo cliente_endereco
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- Adicionar coluna cliente_endereco na tabela propostas
ALTER TABLE propostas 
ADD COLUMN IF NOT EXISTS cliente_endereco TEXT;

-- Comentário na coluna
COMMENT ON COLUMN propostas.cliente_endereco IS 'Endereço completo do cliente (CONTRATANTE)';
