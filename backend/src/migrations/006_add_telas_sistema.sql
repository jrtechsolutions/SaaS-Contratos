-- ============================================
-- MIGRATION: Adicionar campo telas_sistema
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- Adicionar coluna telas_sistema na tabela propostas
-- Armazena array de objetos com: { imagem: base64 ou URL, titulo: string, descricao: string }
ALTER TABLE propostas 
ADD COLUMN IF NOT EXISTS telas_sistema JSONB DEFAULT '[]'::jsonb;

-- Comentário na coluna
COMMENT ON COLUMN propostas.telas_sistema IS 'Array de telas do sistema para anexo: [{imagem: string, titulo: string, descricao: string}]';
