/**
 * Utilitários de precificação e termos contratuais por proposta
 */

export const NAO_APLICAVEL = 'Não aplicável a este contrato';

export const TIPOS_PROPOSTA = ['projeto_fixo', 'saas_recorrente', 'hibrido'];

export const TERMOS_PADRAO = {
  indice_reajuste: 'IPCA',
  prazo_aviso_reajuste: 30,
  valor_hora_suporte: 150,
  prazo_tolerancia_inadimplencia: 5,
  prazo_vigencia_inicial: '12 meses',
  prazo_aviso_nao_renovacao: 30,
  prazo_aviso_rescisao_mensalidade: 30,
  prazo_exportacao_dados: 30,
  formato_exportacao: 'CSV ou JSON',
  dia_vencimento_mensalidade: 10,
};

export function hasMensalidade(tipo) {
  return tipo === 'saas_recorrente' || tipo === 'hibrido';
}

export function hasImplantacaoObrigatoria(tipo) {
  return tipo === 'projeto_fixo' || tipo === 'hibrido';
}

export function computeModulosTotal(modulos) {
  if (!Array.isArray(modulos)) return 0;
  return modulos.reduce((sum, m) => sum + (parseFloat(m.valor_mensal) || 0), 0);
}

export function sanitizeModulos(modulos) {
  if (!Array.isArray(modulos)) return [];
  return modulos
    .map((m) => ({
      nome: (m.nome || '').trim(),
      valor_mensal: parseFloat(m.valor_mensal) || 0,
      descricao: m.descricao ? m.descricao.trim() : undefined,
    }))
    .filter((m) => m.nome && m.valor_mensal > 0);
}

export function formatModulosList(modulos, formatCurrencyFn) {
  const items = sanitizeModulos(modulos);
  if (items.length === 0) return '';
  return items
    .map((m) => {
      const line = `- ${m.nome}: ${formatCurrencyFn(m.valor_mensal)}/mês`;
      return m.descricao ? `${line} (${m.descricao})` : line;
    })
    .join('\n');
}

export function formatDescricaoMensalidade(modulos, descricaoManual, formatCurrencyFn) {
  if (descricaoManual && descricaoManual.trim()) {
    return descricaoManual.trim();
  }
  const list = formatModulosList(modulos, formatCurrencyFn);
  if (!list) return '';
  return `Módulos contratados:\n${list}`;
}

export function computeValorTotal(tipo, valorImplantacao, valorMensalidade) {
  const impl = parseFloat(valorImplantacao) || 0;
  const mens = parseFloat(valorMensalidade) || 0;

  if (tipo === 'projeto_fixo') return impl;
  if (tipo === 'saas_recorrente') return mens > 0 ? mens : impl;
  return impl;
}

export function mergeTermos(proposta = {}) {
  return {
    indice_reajuste: proposta.indice_reajuste ?? TERMOS_PADRAO.indice_reajuste,
    prazo_aviso_reajuste: proposta.prazo_aviso_reajuste ?? TERMOS_PADRAO.prazo_aviso_reajuste,
    valor_hora_suporte: proposta.valor_hora_suporte ?? TERMOS_PADRAO.valor_hora_suporte,
    prazo_tolerancia_inadimplencia:
      proposta.prazo_tolerancia_inadimplencia ?? TERMOS_PADRAO.prazo_tolerancia_inadimplencia,
    prazo_vigencia_inicial: proposta.prazo_vigencia_inicial ?? TERMOS_PADRAO.prazo_vigencia_inicial,
    prazo_aviso_nao_renovacao:
      proposta.prazo_aviso_nao_renovacao ?? TERMOS_PADRAO.prazo_aviso_nao_renovacao,
    prazo_aviso_rescisao_mensalidade:
      proposta.prazo_aviso_rescisao_mensalidade ?? TERMOS_PADRAO.prazo_aviso_rescisao_mensalidade,
    prazo_exportacao_dados: proposta.prazo_exportacao_dados ?? TERMOS_PADRAO.prazo_exportacao_dados,
    formato_exportacao: proposta.formato_exportacao ?? TERMOS_PADRAO.formato_exportacao,
    dia_vencimento_mensalidade:
      proposta.dia_vencimento_mensalidade ?? TERMOS_PADRAO.dia_vencimento_mensalidade,
  };
}

function parseOptionalNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  return Number.isNaN(num) ? null : num;
}

function cleanValue(val) {
  if (val === null || val === undefined) return null;
  const str = val.toString().trim();
  return str !== '' ? str : null;
}

/**
 * Normaliza e valida os campos de precificação vindos do request
 */
export function buildPricingFields(body) {
  const tipo = TIPOS_PROPOSTA.includes(body.tipo_proposta)
    ? body.tipo_proposta
    : 'projeto_fixo';

  const modulos = sanitizeModulos(body.modulos);
  const valorMensalidadeTotal =
    parseOptionalNumber(body.valor_mensalidade_total) ?? computeModulosTotal(modulos);

  const valorImplantacao =
    parseOptionalNumber(body.valor_implantacao) ??
    parseOptionalNumber(body.valor_total) ??
    0;

  const termos = mergeTermos(body);

  if (tipo === 'projeto_fixo' && valorImplantacao <= 0) {
    return { error: 'Valor de implantação é obrigatório para projeto fixo' };
  }

  if (tipo === 'saas_recorrente' && valorMensalidadeTotal <= 0) {
    return { error: 'Informe ao menos um módulo com valor mensal para proposta recorrente' };
  }

  if (tipo === 'hibrido') {
    if (valorImplantacao <= 0) {
      return { error: 'Valor de implantação é obrigatório para proposta híbrida' };
    }
    if (valorMensalidadeTotal <= 0) {
      return { error: 'Informe ao menos um módulo com valor mensal para proposta híbrida' };
    }
  }

  const condicoesImplantacao =
    cleanValue(body.condicoes_pagamento_implantacao) ?? cleanValue(body.condicoes_pagamento);

  const descricaoMensalidade = cleanValue(body.descricao_mensalidade);

  const temExclusividade = Boolean(body.tem_exclusividade);

  const valorTotal = computeValorTotal(tipo, valorImplantacao, valorMensalidadeTotal);

  return {
    data: {
      tipo_proposta: tipo,
      valor_implantacao: valorImplantacao,
      condicoes_pagamento_implantacao: condicoesImplantacao,
      condicoes_pagamento: condicoesImplantacao,
      modulos,
      valor_mensalidade_total: hasMensalidade(tipo) ? valorMensalidadeTotal : null,
      descricao_mensalidade: hasMensalidade(tipo) ? descricaoMensalidade : null,
      data_inicio_mensalidade: hasMensalidade(tipo)
        ? cleanValue(body.data_inicio_mensalidade)
        : null,
      dia_vencimento_mensalidade: hasMensalidade(tipo) ? termos.dia_vencimento_mensalidade : null,
      indice_reajuste: hasMensalidade(tipo) ? termos.indice_reajuste : null,
      prazo_aviso_reajuste: hasMensalidade(tipo) ? termos.prazo_aviso_reajuste : null,
      valor_hora_suporte: hasMensalidade(tipo) ? termos.valor_hora_suporte : null,
      prazo_tolerancia_inadimplencia: hasMensalidade(tipo)
        ? termos.prazo_tolerancia_inadimplencia
        : null,
      prazo_vigencia_inicial: hasMensalidade(tipo) ? termos.prazo_vigencia_inicial : null,
      prazo_aviso_nao_renovacao: hasMensalidade(tipo) ? termos.prazo_aviso_nao_renovacao : null,
      tem_exclusividade: hasMensalidade(tipo) ? temExclusividade : false,
      escopo_exclusividade:
        hasMensalidade(tipo) && temExclusividade
          ? cleanValue(body.escopo_exclusividade)
          : null,
      prazo_exclusividade:
        hasMensalidade(tipo) && temExclusividade
          ? cleanValue(body.prazo_exclusividade)
          : null,
      condicoes_renovacao_exclusividade:
        hasMensalidade(tipo) && temExclusividade
          ? cleanValue(body.condicoes_renovacao_exclusividade)
          : null,
      prazo_aviso_rescisao_mensalidade: hasMensalidade(tipo)
        ? termos.prazo_aviso_rescisao_mensalidade
        : null,
      prazo_exportacao_dados: termos.prazo_exportacao_dados,
      formato_exportacao: termos.formato_exportacao,
      valor_total: valorTotal,
    },
  };
}
