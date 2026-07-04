-- Migration: Tipos de proposta (A/B/Híbrido) e precificação estruturada
-- Execute no SQL Editor do Supabase após as migrations anteriores

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS tipo_proposta VARCHAR(50) DEFAULT 'projeto_fixo'
    CHECK (tipo_proposta IN ('projeto_fixo', 'saas_recorrente', 'hibrido'));

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS valor_implantacao DECIMAL(18, 2);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS condicoes_pagamento_implantacao TEXT;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS modulos JSONB DEFAULT '[]'::jsonb;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS valor_mensalidade_total DECIMAL(18, 2);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS descricao_mensalidade TEXT;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS data_inicio_mensalidade DATE;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS dia_vencimento_mensalidade INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS indice_reajuste VARCHAR(100);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_aviso_reajuste INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS valor_hora_suporte DECIMAL(18, 2);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_tolerancia_inadimplencia INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_vigencia_inicial VARCHAR(100);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_aviso_nao_renovacao INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS tem_exclusividade BOOLEAN DEFAULT false;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS escopo_exclusividade TEXT;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_exclusividade VARCHAR(100);

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS condicoes_renovacao_exclusividade TEXT;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_aviso_rescisao_mensalidade INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS prazo_exportacao_dados INTEGER;

ALTER TABLE propostas
  ADD COLUMN IF NOT EXISTS formato_exportacao VARCHAR(100);

-- Migrar propostas existentes
UPDATE propostas
SET
  tipo_proposta = 'projeto_fixo',
  valor_implantacao = valor_total,
  condicoes_pagamento_implantacao = condicoes_pagamento
WHERE valor_implantacao IS NULL;

COMMENT ON COLUMN propostas.tipo_proposta IS 'projeto_fixo (A), saas_recorrente (B) ou hibrido';
COMMENT ON COLUMN propostas.modulos IS 'Array JSON: [{nome, valor_mensal, descricao?}]';
