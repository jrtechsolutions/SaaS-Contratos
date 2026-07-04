-- Migration: custos mensais livres + simplificação dos tipos de proposta
-- projeto_fixo | modulos (remove saas_recorrente e hibrido)

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS custos_mensais JSONB DEFAULT '[]'::jsonb;

-- Migrar tipos antigos
UPDATE propostas
SET tipo_proposta = 'modulos'
WHERE tipo_proposta IN ('saas_recorrente', 'hibrido');

ALTER TABLE propostas DROP CONSTRAINT IF EXISTS propostas_tipo_proposta_check;

ALTER TABLE propostas
  ADD CONSTRAINT propostas_tipo_proposta_check
  CHECK (tipo_proposta IN ('projeto_fixo', 'modulos'));

COMMENT ON COLUMN propostas.custos_mensais IS 'Custos mensais livres: suporte, infraestrutura, etc. [{nome, valor_mensal, descricao?}]';
