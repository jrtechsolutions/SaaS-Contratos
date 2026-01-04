-- ============================================
-- MIGRATION: Corrigir precisão do valor_total
-- ============================================
-- Esta migration altera o tipo DECIMAL(10,2) para DECIMAL(18,2)
-- para suportar valores maiores (até 999.999.999.999.999.999,99)
-- ============================================

-- Alterar a coluna valor_total para suportar valores maiores
ALTER TABLE propostas 
ALTER COLUMN valor_total TYPE DECIMAL(18, 2);

-- ============================================
-- FIM DA MIGRATION
-- ============================================

