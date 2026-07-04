/**
 * Utilitários de precificação — espelho do backend para o frontend
 */

export type TipoProposta = 'projeto_fixo' | 'saas_recorrente' | 'hibrido';

export interface ModuloProposta {
  nome: string;
  valor_mensal: number;
  descricao?: string;
}

export const NAO_APLICAVEL = 'Não aplicável a este contrato';

export const TIPOS_PROPOSTA: { value: TipoProposta; label: string; description: string }[] = [
  {
    value: 'projeto_fixo',
    label: 'Projeto fixo (A)',
    description: 'Desenvolvimento com valor único de implantação',
  },
  {
    value: 'saas_recorrente',
    label: 'SaaS recorrente (B)',
    description: 'Mensalidade com módulos e possível exclusividade',
  },
  {
    value: 'hibrido',
    label: 'Híbrido',
    description: 'Implantação do sistema + mensalidade por módulos',
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

export function hasMensalidade(tipo: TipoProposta): boolean {
  return tipo === 'saas_recorrente' || tipo === 'hibrido';
}

export function hasImplantacao(tipo: TipoProposta): boolean {
  return tipo === 'projeto_fixo' || tipo === 'hibrido' || tipo === 'saas_recorrente';
}

export function computeModulosTotal(modulos: ModuloProposta[]): number {
  return modulos.reduce((sum, m) => sum + (m.valor_mensal || 0), 0);
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

export function formatModulosList(modulos: ModuloProposta[]): string {
  if (!modulos.length) return '';
  return modulos
    .filter((m) => m.nome && m.valor_mensal > 0)
    .map((m) => {
      const line = `- ${m.nome}: ${formatCurrency(m.valor_mensal)}/mês`;
      return m.descricao ? `${line} (${m.descricao})` : line;
    })
    .join('\n');
}

export function formatDescricaoMensalidade(
  modulos: ModuloProposta[],
  descricaoManual?: string
): string {
  if (descricaoManual?.trim()) return descricaoManual.trim();
  const list = formatModulosList(modulos);
  if (!list) return '';
  return `Módulos contratados:\n${list}`;
}

export function computeValorTotal(
  tipo: TipoProposta,
  valorImplantacao: number,
  valorMensalidade: number
): number {
  if (tipo === 'projeto_fixo') return valorImplantacao;
  if (tipo === 'saas_recorrente') return valorMensalidade > 0 ? valorMensalidade : valorImplantacao;
  return valorImplantacao;
}

export interface PricingFormData {
  tipoProposta: TipoProposta;
  valorImplantacao: string;
  condicoesPagamentoImplantacao: string;
  modulos: ModuloProposta[];
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
    valorImplantacao: '',
    condicoesPagamentoImplantacao: '',
    modulos: [],
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
  const valorImplantacao = parseCurrency(pricing.valorImplantacao);
  const modulos = pricing.modulos.filter((m) => m.nome.trim() && m.valor_mensal > 0);
  const valorMensalidadeTotal = computeModulosTotal(modulos);

  return {
    tipo_proposta: pricing.tipoProposta,
    valor_implantacao: valorImplantacao,
    condicoes_pagamento_implantacao: pricing.condicoesPagamentoImplantacao.trim() || undefined,
    condicoes_pagamento: pricing.condicoesPagamentoImplantacao.trim() || undefined,
    modulos,
    valor_mensalidade_total: hasMensalidade(pricing.tipoProposta) ? valorMensalidadeTotal : undefined,
    descricao_mensalidade: hasMensalidade(pricing.tipoProposta)
      ? formatDescricaoMensalidade(modulos, pricing.descricaoMensalidade) || undefined
      : undefined,
    data_inicio_mensalidade: hasMensalidade(pricing.tipoProposta)
      ? pricing.dataInicioMensalidade || undefined
      : undefined,
    dia_vencimento_mensalidade: hasMensalidade(pricing.tipoProposta)
      ? pricing.diaVencimentoMensalidade
      : undefined,
    indice_reajuste: hasMensalidade(pricing.tipoProposta) ? pricing.indiceReajuste : undefined,
    prazo_aviso_reajuste: hasMensalidade(pricing.tipoProposta) ? pricing.prazoAvisoReajuste : undefined,
    valor_hora_suporte: hasMensalidade(pricing.tipoProposta) ? pricing.valorHoraSuporte : undefined,
    prazo_tolerancia_inadimplencia: hasMensalidade(pricing.tipoProposta)
      ? pricing.prazoToleranciaInadimplencia
      : undefined,
    prazo_vigencia_inicial: hasMensalidade(pricing.tipoProposta)
      ? pricing.prazoVigenciaInicial
      : undefined,
    prazo_aviso_nao_renovacao: hasMensalidade(pricing.tipoProposta)
      ? pricing.prazoAvisoNaoRenovacao
      : undefined,
    tem_exclusividade: hasMensalidade(pricing.tipoProposta) ? pricing.temExclusividade : false,
    escopo_exclusividade:
      hasMensalidade(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.escopoExclusividade.trim() || undefined
        : undefined,
    prazo_exclusividade:
      hasMensalidade(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.prazoExclusividade.trim() || undefined
        : undefined,
    condicoes_renovacao_exclusividade:
      hasMensalidade(pricing.tipoProposta) && pricing.temExclusividade
        ? pricing.condicoesRenovacaoExclusividade.trim() || undefined
        : undefined,
    prazo_aviso_rescisao_mensalidade: hasMensalidade(pricing.tipoProposta)
      ? pricing.prazoAvisoRescisaoMensalidade
      : undefined,
    prazo_exportacao_dados: pricing.prazoExportacaoDados,
    formato_exportacao: pricing.formatoExportacao,
    valor_total: computeValorTotal(pricing.tipoProposta, valorImplantacao, valorMensalidadeTotal),
  };
}

export function propostaToPricingForm(proposta: {
  tipo_proposta?: TipoProposta;
  valor_implantacao?: number;
  valor_total?: number;
  condicoes_pagamento_implantacao?: string;
  condicoes_pagamento?: string;
  modulos?: ModuloProposta[];
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
  const valor = proposta.valor_implantacao ?? proposta.valor_total ?? 0;

  return {
    ...defaults,
    tipoProposta: proposta.tipo_proposta || 'projeto_fixo',
    valorImplantacao: valor
      ? formatCurrency(valor)
      : '',
    condicoesPagamentoImplantacao:
      proposta.condicoes_pagamento_implantacao || proposta.condicoes_pagamento || '',
    modulos: proposta.modulos || [],
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
  const valorImplantacao = parseCurrency(pricing.valorImplantacao);
  const modulosValidos = pricing.modulos.filter((m) => m.nome.trim() && m.valor_mensal > 0);
  const valorMensalidade = computeModulosTotal(modulosValidos);

  if (pricing.tipoProposta === 'projeto_fixo' && valorImplantacao <= 0) {
    return 'Informe o valor de implantação';
  }
  if (pricing.tipoProposta === 'saas_recorrente' && valorMensalidade <= 0) {
    return 'Adicione ao menos um módulo com valor mensal';
  }
  if (pricing.tipoProposta === 'hibrido') {
    if (valorImplantacao <= 0) return 'Informe o valor de implantação do sistema';
    if (valorMensalidade <= 0) return 'Adicione ao menos um módulo com valor mensal';
  }
  if (pricing.temExclusividade && hasMensalidade(pricing.tipoProposta)) {
    if (!pricing.escopoExclusividade.trim()) return 'Informe o escopo da exclusividade';
    if (!pricing.prazoExclusividade.trim()) return 'Informe o prazo da exclusividade';
  }
  return null;
}
