-- ============================================
-- SCRIPT: Limpar todos os dados do banco
-- ============================================
-- ATENÇÃO: Este script remove TODOS os dados de todas as tabelas
-- Execute com cuidado! A estrutura das tabelas será mantida.
-- ============================================

-- Desabilitar temporariamente as verificações de foreign key
SET session_replication_role = 'replica';

-- Deletar dados respeitando a ordem das foreign keys
DELETE FROM contratos;
DELETE FROM propostas;
DELETE FROM modelos_contrato;
DELETE FROM configuracoes_empresa;
DELETE FROM users;

-- Reabilitar verificações de foreign key
SET session_replication_role = 'origin';

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Após executar, todas as tabelas estarão vazias
-- mas a estrutura será mantida
-- ============================================
