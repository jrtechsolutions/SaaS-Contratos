-- ============================================
-- MIGRATION: Criar tabelas do sistema
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ============================================

-- Tabela de usuários (admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de modelos de contrato
CREATE TABLE IF NOT EXISTS modelos_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  template_texto TEXT NOT NULL,
  variaveis JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de propostas
CREATE TABLE IF NOT EXISTS propostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(50),
  cliente_empresa VARCHAR(255),
  cliente_cnpj VARCHAR(50),
  servicos JSONB DEFAULT '[]'::jsonb,
  servico_personalizado TEXT,
  valor_total DECIMAL(18, 2) NOT NULL,
  condicoes_pagamento TEXT,
  prazo_execucao VARCHAR(100),
  data_inicio DATE,
  data_entrega DATE,
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviada', 'aceita', 'cancelada')),
  modelo_contrato_id UUID REFERENCES modelos_contrato(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de contratos
CREATE TABLE IF NOT EXISTS contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_id UUID NOT NULL REFERENCES propostas(id) ON DELETE CASCADE,
  texto_contrato TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'enviado' CHECK (status IN ('enviado', 'visualizado', 'assinado')),
  assinatura_cliente TEXT,
  data_assinatura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_propostas_status ON propostas(status);
CREATE INDEX IF NOT EXISTS idx_propostas_cliente_email ON propostas(cliente_email);
CREATE INDEX IF NOT EXISTS idx_contratos_proposta_id ON contratos(proposta_id);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modelos_contrato_updated_at ON modelos_contrato;
CREATE TRIGGER update_modelos_contrato_updated_at BEFORE UPDATE ON modelos_contrato
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_propostas_updated_at ON propostas;
CREATE TRIGGER update_propostas_updated_at BEFORE UPDATE ON propostas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contratos_updated_at ON contratos;
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Usuários administradores do sistema';
COMMENT ON TABLE modelos_contrato IS 'Modelos/templates de contratos';
COMMENT ON TABLE propostas IS 'Propostas comerciais enviadas aos clientes';
COMMENT ON TABLE contratos IS 'Contratos gerados a partir de propostas aceitas';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
-- Verifique se todas as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('users', 'modelos_contrato', 'propostas', 'contratos');
-- ============================================
