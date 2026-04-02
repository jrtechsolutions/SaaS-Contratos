-- ============================================
-- MIGRATION: Criar tabela de configurações da empresa (Versão Simplificada)
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- Tabela de configurações da empresa (singleton - apenas 1 registro)
CREATE TABLE IF NOT EXISTS configuracoes_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social VARCHAR(255) NOT NULL DEFAULT 'JR Technology Solutions',
  cnpj VARCHAR(50) NOT NULL DEFAULT '00.000.000/0001-00',
  email VARCHAR(255) NOT NULL DEFAULT 'contato@jrtechnologysolutions.com.br',
  telefone VARCHAR(50) NOT NULL DEFAULT '(00) 0000-0000',
  endereco TEXT NOT NULL DEFAULT 'Endereço da Empresa, 123',
  cidade VARCHAR(255) DEFAULT 'Cidade - UF',
  logo_url TEXT,
  texto_complementar TEXT DEFAULT 'Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro padrão se não existir
INSERT INTO configuracoes_empresa (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM configuracoes_empresa);

