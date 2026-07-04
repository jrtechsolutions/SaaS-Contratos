/**
 * Utilitários de precificação e termos contratuais por proposta
 *
 * Tipos:
 * - projeto_fixo: valor único do sistema + custos mensais opcionais (suporte, infra...)
 * - modulos: módulos contratados + outros custos mensais, sem valor de implantação
 */

export const NAO_APLICAVEL = 'Não aplicável a este contrato';

export const TIPOS_PROPOSTA = ['projeto_fixo', 'modulos'];

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

export function normalizeTipo(tipo) {
  if (tipo === 'saas_recorrente' || tipo === 'hibrido') return 'modulos';
  return TIPOS_PROPOSTA.includes(tipo) ? tipo : 'projeto_fixo';
}

export function isProjetoFixo(tipo) {
  return normalizeTipo(tipo) === 'projeto_fixo';
}

export function isModulos(tipo) {
  return normalizeTipo(tipo) === 'modulos';
}

export function hasRecorrencia(tipo, modulos, custosMensais) {
  const t = normalizeTipo(tipo);
  if (t === 'projeto_fixo') return computeItensTotal(custosMensais) > 0;
  return computeItensTotal(modulos) > 0 || computeItensTotal(custosMensais) > 0;
}

export function computeItensTotal(itens) {
  if (!Array.isArray(itens)) return 0;
  return itens.reduce((sum, m) => sum + (parseFloat(m.valor_mensal) || 0), 0);
}

export function sanitizeItens(itens) {
  if (!Array.isArray(itens)) return [];
  return itens
    .map((m) => ({
      nome: (m.nome || '').trim(),
      valor_mensal: parseFloat(m.valor_mensal) || 0,
      descricao: m.descricao ? m.descricao.trim() : undefined,
    }))
    .filter((m) => m.nome && m.valor_mensal > 0);
}

export function formatItensList(itens, formatCurrencyFn, titulo) {
  const items = sanitizeItens(itens);
  if (items.length === 0) return '';
  const list = items
    .map((m) => {
      const line = `- ${m.nome}: ${formatCurrencyFn(m.valor_mensal)}/mês`;
      return m.descricao ? `${line} (${m.descricao})` : line;
    })
    .join('\n');
  return titulo ? `${titulo}:\n${list}` : list;
}

export function buildDescricaoMensalidade(tipo, modulos, custosMensais, descricaoManual, formatCurrencyFn) {
  if (descricaoManual && descricaoManual.trim()) {
    return descricaoManual.trim();
  }

  const t = normalizeTipo(tipo);
  if (t === 'projeto_fixo') {
    return formatItensList(custosMensais, formatCurrencyFn, 'Custos mensais recorrentes') || '';
  }

  const partes = [];
  const modulosList = formatItensList(modulos, formatCurrencyFn, 'Módulos contratados');
  const custosList = formatItensList(custosMensais, formatCurrencyFn, 'Outros custos mensais');
  if (modulosList) partes.push(modulosList);
  if (custosList) partes.push(custosList);
  return partes.join('\n\n');
}

export function computeValorMensalidadeTotal(tipo, modulos, custosMensais) {
  const t = normalizeTipo(tipo);
  if (t === 'projeto_fixo') return computeItensTotal(custosMensais);
  return computeItensTotal(modulos) + computeItensTotal(custosMensais);
}

export function computeValorTotal(tipo, valorImplantacao, valorMensalidade) {
  const t = normalizeTipo(tipo);
  const impl = parseFloat(valorImplantacao) || 0;
  const mens = parseFloat(valorMensalidade) || 0;

  if (t === 'projeto_fixo') return impl > 0 ? impl : mens;
  return mens > 0 ? mens : impl;
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

export function buildPricingFields(body) {
  const tipo = normalizeTipo(body.tipo_proposta);
  const modulos = sanitizeItens(body.modulos);
  const custosMensais = sanitizeItens(body.custos_mensais);
  const valorMensalidadeTotal =
    parseOptionalNumber(body.valor_mensalidade_total) ??
    computeValorMensalidadeTotal(tipo, modulos, custosMensais);

  const valorImplantacao =
    tipo === 'modulos'
      ? 0
      : parseOptionalNumber(body.valor_implantacao) ??
        parseOptionalNumber(body.valor_total) ??
        0;

  const termos = mergeTermos(body);
  const recorrente = hasRecorrencia(tipo, modulos, custosMensais);

  if (tipo === 'projeto_fixo' && valorImplantacao <= 0) {
    return { error: 'Informe o valor do sistema' };
  }

  if (tipo === 'modulos' && modulos.length === 0 && custosMensais.length === 0) {
    return { error: 'Adicione ao menos um módulo ou outro custo mensal' };
  }

  const condicoesPagamento =
    cleanValue(body.condicoes_pagamento_implantacao) ?? cleanValue(body.condicoes_pagamento);

  if (tipo === 'projeto_fixo' && !condicoesPagamento) {
    return { error: 'Informe as condições de pagamento' };
  }

  const descricaoMensalidade = cleanValue(body.descricao_mensalidade);
  const temExclusividade = Boolean(body.tem_exclusividade);

  return {
    data: {
      tipo_proposta: tipo,
      valor_implantacao: tipo === 'projeto_fixo' ? valorImplantacao : null,
      condicoes_pagamento_implantacao: tipo === 'projeto_fixo' ? condicoesPagamento : null,
      condicoes_pagamento: condicoesPagamento,
      modulos: tipo === 'modulos' ? modulos : [],
      custos_mensais: custosMensais,
      valor_mensalidade_total: recorrente ? valorMensalidadeTotal : null,
      descricao_mensalidade: recorrente ? descricaoMensalidade : null,
      data_inicio_mensalidade: recorrente ? cleanValue(body.data_inicio_mensalidade) : null,
      dia_vencimento_mensalidade: recorrente ? termos.dia_vencimento_mensalidade : null,
      indice_reajuste: recorrente ? termos.indice_reajuste : null,
      prazo_aviso_reajuste: recorrente ? termos.prazo_aviso_reajuste : null,
      valor_hora_suporte: recorrente ? termos.valor_hora_suporte : null,
      prazo_tolerancia_inadimplencia: recorrente ? termos.prazo_tolerancia_inadimplencia : null,
      prazo_vigencia_inicial: recorrente ? termos.prazo_vigencia_inicial : null,
      prazo_aviso_nao_renovacao: recorrente ? termos.prazo_aviso_nao_renovacao : null,
      tem_exclusividade: tipo === 'modulos' && temExclusividade,
      escopo_exclusividade:
        tipo === 'modulos' && temExclusividade ? cleanValue(body.escopo_exclusividade) : null,
      prazo_exclusividade:
        tipo === 'modulos' && temExclusividade ? cleanValue(body.prazo_exclusividade) : null,
      condicoes_renovacao_exclusividade:
        tipo === 'modulos' && temExclusividade
          ? cleanValue(body.condicoes_renovacao_exclusividade)
          : null,
      prazo_aviso_rescisao_mensalidade: recorrente ? termos.prazo_aviso_rescisao_mensalidade : null,
      prazo_exportacao_dados: termos.prazo_exportacao_dados,
      formato_exportacao: termos.formato_exportacao,
      valor_total: computeValorTotal(tipo, valorImplantacao, valorMensalidadeTotal),
    },
  };
}

// Aliases para compatibilidade
export const sanitizeModulos = sanitizeItens;
export const computeModulosTotal = computeItensTotal;
export const formatModulosList = (modulos, formatCurrencyFn) =>
  formatItensList(modulos, formatCurrencyFn, 'Módulos contratados');
