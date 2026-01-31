-- ============================================
-- SCRIPT: Remover TODAS as tabelas (estrutura + dados)
-- ============================================
-- ATENÇÃO: Este script remove COMPLETAMENTE todas as tabelas
-- Você precisará executar as migrations novamente para recriar
-- ============================================

-- Remover tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS contratos CASCADE;
DROP TABLE IF EXISTS propostas CASCADE;
DROP TABLE IF EXISTS modelos_contrato CASCADE;
DROP TABLE IF EXISTS configuracoes_empresa CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar, você precisará executar novamente:
-- 1. 001_create_tables.sql
-- 2. 002_insert_default_data.sql (opcional)
-- 3. 003_fix_valor_total_precision.sql
-- 4. 004_create_configuracoes_empresa.sql (ou _simple.sql)
-- 5. 005_add_cliente_endereco.sql
-- 6. 006_add_telas_sistema.sql
-- ============================================
