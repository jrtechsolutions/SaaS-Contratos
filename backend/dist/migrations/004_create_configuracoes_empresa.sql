-- ============================================
-- MIGRATION: Criar tabela de configurações da empresa
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

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_empresa_updated_at
  BEFORE UPDATE ON configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir registro padrão (singleton)
INSERT INTO configuracoes_empresa (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Criar função para garantir apenas 1 registro
CREATE OR REPLACE FUNCTION ensure_single_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Se já existe um registro, atualizar em vez de inserir
  IF (SELECT COUNT(*) FROM configuracoes_empresa) > 0 THEN
    UPDATE configuracoes_empresa SET
      razao_social = NEW.razao_social,
      cnpj = NEW.cnpj,
      email = NEW.email,
      telefone = NEW.telefone,
      endereco = NEW.endereco,
      cidade = NEW.cidade,
      logo_url = NEW.logo_url,
      texto_complementar = NEW.texto_complementar,
      updated_at = NOW()
    WHERE id = (SELECT id FROM configuracoes_empresa LIMIT 1);
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir apenas 1 registro
DROP TRIGGER IF EXISTS ensure_single_config_trigger ON configuracoes_empresa;
CREATE TRIGGER ensure_single_config_trigger
  BEFORE INSERT ON configuracoes_empresa
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_config();

