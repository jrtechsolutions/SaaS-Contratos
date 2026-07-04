/**
 * Utilitários de precificação — frontend
 */

export type TipoProposta = 'projeto_fixo' | 'modulos';

export interface ItemRecorrente {
  nome: string;
  valor_mensal: number;
  descricao?: string;
}

export type ModuloProposta = ItemRecorrente;

export const TIPOS_PROPOSTA: { value: TipoProposta; label: string; description: string }[] = [
  {
    value: 'projeto_fixo',
    label: 'Projeto próprio (fixo)',
    description: 'Valor único do sistema + custos mensais opcionais (suporte, infra...)',
  },
  {
    value: 'modulos',
    label: 'Contrato por módulos',
    description: 'Módulos com valores mensais + outros custos, sem valor de implantação',
  },
];

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

export function normalizeTipo(tipo?: string): TipoProposta {
  if (tipo === 'saas_recorrente' || tipo === 'hibrido') return 'modulos';
  if (tipo === 'modulos') return 'modulos';
  return 'projeto_fixo';
}

export function isProjetoFixo(tipo: TipoProposta): boolean {
  return tipo === 'projeto_fixo';
}

export function isModulos(tipo: TipoProposta): boolean {
  return tipo === 'modulos';
}

export function computeItensTotal(itens: ItemRecorrente[]): number {
  return itens.reduce((sum, m) => sum + (m.valor_mensal || 0), 0);
}

export const computeModulosTotal = computeItensTotal;

export function computeValorMensalidadeTotal(
  tipo: TipoProposta,
  modulos: ItemRecorrente[],
  custosMensais: ItemRecorrente[]
): number {
  if (isProjetoFixo(tipo)) return computeItensTotal(custosMensais);
  return computeItensTotal(modulos) + computeItensTotal(custosMensais);
}

export function hasRecorrencia(
  tipo: TipoProposta,
  modulos: ItemRecorrente[],
  custosMensais: ItemRecorrente[]
): boolean {
  return computeValorMensalidadeTotal(tipo, modulos, custosMensais) > 0;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function formatItensList(itens: ItemRecorrente[], titulo?: string): string {
  const valid = itens.filter((m) => m.nome && m.valor_mensal > 0);
  if (!valid.length) return '';
  const list = valid
    .map((m) => {
      const line = `- ${m.nome}: ${formatCurrency(m.valor_mensal)}/mês`;
      return m.descricao ? `${line} (${m.descricao})` : line;
    })
    .join('\n');
  return titulo ? `${titulo}:\n${list}` : list;
}

export function buildDescricaoMensalidade(
  tipo: TipoProposta,
  modulos: ItemRecorrente[],
  custosMensais: ItemRecorrente[],
  descricaoManual?: string
): string {
  if (descricaoManual?.trim()) return descricaoManual.trim();

  if (isProjetoFixo(tipo)) {
    return formatItensList(custosMensais, 'Custos mensais recorrentes');
  }

  const partes = [
    formatItensList(modulos, 'Módulos contratados'),
    formatItensList(custosMensais, 'Outros custos mensais'),
  ].filter(Boolean);
  return partes.join('\n\n');
}

export function computeValorTotal(
  tipo: TipoProposta,
  valorSistema: number,
  valorMensalidade: number
): number {
  if (isProjetoFixo(tipo)) return valorSistema > 0 ? valorSistema : valorMensalidade;
  return valorMensalidade > 0 ? valorMensalidade : valorSistema;
}

export interface PricingFormData {
  tipoProposta: TipoProposta;
  valorSistema: string;
  condicoesPagamento: string;
  modulos: ItemRecorrente[];
  custosMensais: ItemRecorrente[];
  descricaoMensalidade: string;
  dataInicioMensalidade: string;
  diaVencimentoMensalidade: number;
  indiceReajuste: string;
  prazoAvisoReajuste: number;
  valorHoraSuporte: number;
  prazoToleranciaInadimplencia: number;
  prazoVigenciaInicial: string;
  prazoAvisoNaoRenovacao: number;
  temExclusividade: boolean;
  escopoExclusividade: string;
  prazoExclusividade: string;
  condicoesRenovacaoExclusividade: string;
  prazoAvisoRescisaoMensalidade: number;
  prazoExportacaoDados: number;
  formatoExportacao: string;
}

export function createDefaultPricingFormData(): PricingFormData {
  return {
    tipoProposta: 'projeto_fixo',
    valorSistema: '',
    condicoesPagamento: '',
    modulos: [],
    custosMensais: [],
    descricaoMensalidade: '',
    dataInicioMensalidade: '',
    diaVencimentoMensalidade: TERMOS_PADRAO.dia_vencimento_mensalidade,
    indiceReajuste: TERMOS_PADRAO.indice_reajuste,
    prazoAvisoReajuste: TERMOS_PADRAO.prazo_aviso_reajuste,
    valorHoraSuporte: TERMOS_PADRAO.valor_hora_suporte,
    prazoToleranciaInadimplencia: TERMOS_PADRAO.prazo_tolerancia_inadimplencia,
    prazoVigenciaInicial: TERMOS_PADRAO.prazo_vigencia_inicial,
    prazoAvisoNaoRenovacao: TERMOS_PADRAO.prazo_aviso_nao_renovacao,
    temExclusividade: false,
    escopoExclusividade: '',
    prazoExclusividade: '',
    condicoesRenovacaoExclusividade: '',
    prazoAvisoRescisaoMensalidade: TERMOS_PADRAO.prazo_aviso_rescisao_mensalidade,
    prazoExportacaoDados: TERMOS_PADRAO.prazo_exportacao_dados,
    formatoExportacao: TERMOS_PADRAO.formato_exportacao,
  };
}

export function pricingFormToApiPayload(pricing: PricingFormData) {
  const valorSistema = parseCurrency(pricing.valorSistema);
  const modulos = pricing.modulos.filter((m) => m.nome.trim() && m.valor_mensal > 0);
  const custosMensais = pricing.custosMensais.filter((m) => m.nome.trim() && m.valor_mensal > 0);
  const valorMensalidadeTotal = computeValorMensalidadeTotal(
    pricing.tipoProposta,
    modulos,
    custosMensais
  );
  const recorrente = hasRecorrencia(pricing.tipoProposta, modulos, custosMensais);

  return {
    tipo_proposta: pricing.tipoProposta,
    valor_implantacao: isProjetoFixo(pricing.tipoProposta) ? valorSistema : undefined,
    condicoes_pagamento_implantacao: isProjetoFixo(pricing.tipoProposta)
      ? pricing.condicoesPagamento.trim() || undefined
      : undefined,
    condicoes_pagamento: isProjetoFixo(pricing.tipoProposta)
      ? pricing.condicoesPagamento.trim() || undefined
      : undefined,
    modulos: isModulos(pricing.tipoProposta) ? modulos : [],
    custos_mensais: custosMensais,
    valor_mensalidade_total: recorrente ? valorMensalidadeTotal : undefined,
    descricao_mensalidade: recorrente
      ? buildDescricaoMensalidade(
          pricing.tipoProposta,
          modulos,
          custosMensais,
          pricing.descricaoMensalidade
        ) || undefined
      : undefined,
    data_inicio_mensalidade: recorrente ? pricing.dataInicioMensalidade || undefined : undefined,
    dia_vencimento_mensalidade: recorrente ? pricing.diaVencimentoMensalidade : undefined,
    indice_reajuste: recorrente ? pricing.indiceReajuste : undefined,
    prazo_aviso_reajuste: recorrente ? pricing.prazoAvisoReajuste : undefined,
    valor_hora_suporte: recorrente ? pricing.valorHoraSuporte : undefined,
    prazo_tolerancia_inadimplencia: recorrente ? pricing.prazoToleranciaInadimplencia : undefined,
    prazo_vigencia_inicial: recorrente ? pricing.prazoVigenciaInicial : undefined,
    prazo_aviso_nao_renovacao: recorrente ? pricing.prazoAvisoNaoRenovacao : undefined,
    tem_exclusividade: isModulos(pricing.tipoProposta) ? pricing.temExclusividade : false,
    escopo_exclusividade:
      isModulos(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.escopoExclusividade.trim() || undefined
        : undefined,
    prazo_exclusividade:
      isModulos(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.prazoExclusividade.trim() || undefined
        : undefined,
    condicoes_renovacao_exclusividade:
      isModulos(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.condicoesRenovacaoExclusividade.trim() || undefined
        : undefined,
    prazo_aviso_rescisao_mensalidade: recorrente
      ? pricing.prazoAvisoRescisaoMensalidade
      : undefined,
    prazo_exportacao_dados: pricing.prazoExportacaoDados,
    formato_exportacao: pricing.formatoExportacao,
    valor_total: computeValorTotal(pricing.tipoProposta, valorSistema, valorMensalidadeTotal),
  };
}

export function propostaToPricingForm(proposta: {
  tipo_proposta?: string;
  valor_implantacao?: number;
  valor_total?: number;
  condicoes_pagamento_implantacao?: string;
  condicoes_pagamento?: string;
  modulos?: ItemRecorrente[];
  custos_mensais?: ItemRecorrente[];
  descricao_mensalidade?: string;
  data_inicio_mensalidade?: string;
  dia_vencimento_mensalidade?: number;
  indice_reajuste?: string;
  prazo_aviso_reajuste?: number;
  valor_hora_suporte?: number;
  prazo_tolerancia_inadimplencia?: number;
  prazo_vigencia_inicial?: string;
  prazo_aviso_nao_renovacao?: number;
  tem_exclusividade?: boolean;
  escopo_exclusividade?: string;
  prazo_exclusividade?: string;
  condicoes_renovacao_exclusividade?: string;
  prazo_aviso_rescisao_mensalidade?: number;
  prazo_exportacao_dados?: number;
  formato_exportacao?: string;
}): PricingFormData {
  const defaults = createDefaultPricingFormData();
  const tipo = normalizeTipo(proposta.tipo_proposta);
  const valor = proposta.valor_implantacao ?? proposta.valor_total ?? 0;

  return {
    ...defaults,
    tipoProposta: tipo,
    valorSistema: valor ? formatCurrency(valor) : '',
    condicoesPagamento:
      proposta.condicoes_pagamento_implantacao || proposta.condicoes_pagamento || '',
    modulos: proposta.modulos || [],
    custosMensais: proposta.custos_mensais || [],
    descricaoMensalidade: proposta.descricao_mensalidade || '',
    dataInicioMensalidade: proposta.data_inicio_mensalidade || '',
    diaVencimentoMensalidade:
      proposta.dia_vencimento_mensalidade ?? defaults.diaVencimentoMensalidade,
    indiceReajuste: proposta.indice_reajuste ?? defaults.indiceReajuste,
    prazoAvisoReajuste: proposta.prazo_aviso_reajuste ?? defaults.prazoAvisoReajuste,
    valorHoraSuporte: proposta.valor_hora_suporte ?? defaults.valorHoraSuporte,
    prazoToleranciaInadimplencia:
      proposta.prazo_tolerancia_inadimplencia ?? defaults.prazoToleranciaInadimplencia,
    prazoVigenciaInicial: proposta.prazo_vigencia_inicial ?? defaults.prazoVigenciaInicial,
    prazoAvisoNaoRenovacao: proposta.prazo_aviso_nao_renovacao ?? defaults.prazoAvisoNaoRenovacao,
    temExclusividade: proposta.tem_exclusividade ?? false,
    escopoExclusividade: proposta.escopo_exclusividade || '',
    prazoExclusividade: proposta.prazo_exclusividade || '',
    condicoesRenovacaoExclusividade: proposta.condicoes_renovacao_exclusividade || '',
    prazoAvisoRescisaoMensalidade:
      proposta.prazo_aviso_rescisao_mensalidade ?? defaults.prazoAvisoRescisaoMensalidade,
    prazoExportacaoDados: proposta.prazo_exportacao_dados ?? defaults.prazoExportacaoDados,
    formatoExportacao: proposta.formato_exportacao ?? defaults.formatoExportacao,
  };
}

export function validatePricingForm(pricing: PricingFormData): string | null {
  const valorSistema = parseCurrency(pricing.valorSistema);
  const modulos = pricing.modulos.filter((m) => m.nome.trim() && m.valor_mensal > 0);
  const custosMensais = pricing.custosMensais.filter((m) => m.nome.trim() && m.valor_mensal > 0);

  if (isProjetoFixo(pricing.tipoProposta)) {
    if (valorSistema <= 0) return 'Informe o valor do sistema';
    if (!pricing.condicoesPagamento.trim()) return 'Informe as condições de pagamento';
    return null;
  }

  if (modulos.length === 0 && custosMensais.length === 0) {
    return 'Adicione ao menos um módulo ou outro custo mensal';
  }

  if (pricing.temExclusividade) {
    if (!pricing.escopoExclusividade.trim()) return 'Informe o escopo da exclusividade';
    if (!pricing.prazoExclusividade.trim()) return 'Informe o prazo da exclusividade';
  }

  return null;
}
