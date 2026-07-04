/**
 * Utilitário para gerar contratos a partir de templates
 */

import {
  NAO_APLICAVEL,
  normalizeTipo,
  isProjetoFixo,
  isModulos,
  hasRecorrencia,
  mergeTermos,
  buildDescricaoMensalidade,
  formatModulosList,
  formatItensList,
} from './proposta-pricing.js';

export function generateContract(template, proposta, configuracoesEmpresa = null) {
  let contractText = template.template_texto;

  const empresa = configuracoesEmpresa || {
    razao_social: 'JR Technology Solutions',
    cnpj: 'XX.XXX.XXX/0001-XX',
    email: 'contato@jrtechnologysolutions.com.br',
    telefone: '(00) 0000-0000',
    endereco: 'Endereço da Empresa',
    cidade: 'Cidade - UF',
    texto_complementar: '',
  };

  const tipo = normalizeTipo(proposta.tipo_proposta);
  const modulos = proposta.modulos || [];
  const custosMensais = proposta.custos_mensais || [];
  const recorrente = hasRecorrencia(tipo, modulos, custosMensais);
  const termos = mergeTermos(proposta);

  const valorImplantacao = isProjetoFixo(tipo)
    ? parseFloat(proposta.valor_implantacao ?? proposta.valor_total) || 0
    : 0;
  const valorMensalidade =
    parseFloat(proposta.valor_mensalidade_total) ||
    (isModulos(tipo)
      ? modulos.reduce((s, m) => s + (parseFloat(m.valor_mensal) || 0), 0) +
        custosMensais.reduce((s, m) => s + (parseFloat(m.valor_mensal) || 0), 0)
      : custosMensais.reduce((s, m) => s + (parseFloat(m.valor_mensal) || 0), 0));

  const temExclusividade = Boolean(proposta.tem_exclusividade);
  const condicoesPagamento =
    proposta.condicoes_pagamento_implantacao || proposta.condicoes_pagamento || '';

  const descricaoMensalidade = recorrente
    ? buildDescricaoMensalidade(
        tipo,
        modulos,
        custosMensais,
        proposta.descricao_mensalidade,
        formatCurrency
      ) || NAO_APLICAVEL
    : NAO_APLICAVEL;

  const listaModulos = isModulos(tipo)
    ? formatModulosList(modulos, formatCurrency) || NAO_APLICAVEL
    : NAO_APLICAVEL;

  const listaCustosMensais = formatItensList(
    custosMensais,
    formatCurrency,
    isModulos(tipo) ? 'Outros custos mensais' : 'Custos mensais recorrentes'
  );

  const enderecoContratada = empresa.cidade
    ? `${empresa.endereco}, ${empresa.cidade}`
    : empresa.endereco || '';

  const variables = {
    '{{nome_cliente}}': proposta.cliente_nome || '',
    '{{empresa_cliente}}': proposta.cliente_empresa || '',
    '{{cnpj_cliente}}': proposta.cliente_cnpj || '',
    '{{email_cliente}}': proposta.cliente_email || '',
    '{{telefone_cliente}}': proposta.cliente_telefone || '',
    '{{endereco_cliente}}': proposta.cliente_endereco || '',

    '{{descricao_servicos}}': formatServices(proposta.servicos),
    '{{servico_personalizado}}': proposta.servico_personalizado || '',

    '{{valor_total}}': formatCurrency(proposta.valor_total ?? valorImplantacao ?? valorMensalidade),
    '{{valor_implantacao}}': isProjetoFixo(tipo)
      ? formatCurrency(valorImplantacao)
      : NAO_APLICAVEL,
    '{{condicoes_pagamento}}': condicoesPagamento || NAO_APLICAVEL,
    '{{condicoes_pagamento_implantacao}}': isProjetoFixo(tipo)
      ? condicoesPagamento || NAO_APLICAVEL
      : NAO_APLICAVEL,

    '{{valor_mensalidade}}': recorrente ? formatCurrency(valorMensalidade) : NAO_APLICAVEL,
    '{{descricao_mensalidade}}': descricaoMensalidade,
    '{{lista_modulos}}': listaModulos,
    '{{lista_custos_mensais}}': listaCustosMensais || NAO_APLICAVEL,
    '{{data_inicio_mensalidade}}': recorrente
      ? formatDate(proposta.data_inicio_mensalidade)
      : NAO_APLICAVEL,
    '{{dia_vencimento_mensalidade}}': recorrente
      ? String(termos.dia_vencimento_mensalidade)
      : NAO_APLICAVEL,
    '{{indice_reajuste}}': recorrente ? termos.indice_reajuste : NAO_APLICAVEL,
    '{{prazo_aviso_reajuste}}': recorrente
      ? String(termos.prazo_aviso_reajuste)
      : NAO_APLICAVEL,
    '{{valor_hora_suporte}}': recorrente
      ? formatCurrency(termos.valor_hora_suporte)
      : NAO_APLICAVEL,
    '{{prazo_tolerancia_inadimplencia}}': recorrente
      ? String(termos.prazo_tolerancia_inadimplencia)
      : NAO_APLICAVEL,

    '{{prazo_execucao}}': proposta.prazo_execucao || '',
    '{{data_inicio}}': formatDate(proposta.data_inicio),
    '{{data_entrega}}': formatDate(proposta.data_entrega),
    '{{prazo_vigencia_inicial}}': recorrente ? termos.prazo_vigencia_inicial : NAO_APLICAVEL,
    '{{prazo_aviso_nao_renovacao}}': recorrente
      ? String(termos.prazo_aviso_nao_renovacao)
      : NAO_APLICAVEL,

    '{{escopo_exclusividade}}':
      isModulos(tipo) && temExclusividade
        ? proposta.escopo_exclusividade || ''
        : NAO_APLICAVEL,
    '{{prazo_exclusividade}}':
      isModulos(tipo) && temExclusividade ? proposta.prazo_exclusividade || '' : NAO_APLICAVEL,
    '{{condicoes_renovacao_exclusividade}}':
      isModulos(tipo) && temExclusividade
        ? proposta.condicoes_renovacao_exclusividade || ''
        : NAO_APLICAVEL,

    '{{prazo_aviso_rescisao_mensalidade}}': recorrente
      ? String(termos.prazo_aviso_rescisao_mensalidade)
      : NAO_APLICAVEL,
    '{{prazo_exportacao_dados}}': String(termos.prazo_exportacao_dados),
    '{{formato_exportacao}}': termos.formato_exportacao,

    '{{razao_social_empresa}}': empresa.razao_social || '',
    '{{cnpj_empresa}}': empresa.cnpj || '',
    '{{email_empresa}}': empresa.email || '',
    '{{telefone_empresa}}': empresa.telefone || '',
    '{{endereco_empresa}}': empresa.endereco || '',
    '{{cidade_empresa}}': empresa.cidade || '',
    '{{endereco_completo_empresa}}': enderecoContratada,
    '{{endereco_contratada}}': enderecoContratada,

    '{{texto_complementar}}': empresa.texto_complementar || '',
    '{{data_assinatura}}': new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    contractText = contractText.replace(regex, variables[key]);
  });

  if (template.variaveis && Array.isArray(template.variaveis)) {
    template.variaveis.forEach((variable) => {
      if (variable.key && !variables[variable.key]) {
        contractText = contractText.replace(
          new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'),
          ''
        );
      }
    });
  }

  if (empresa.texto_complementar && empresa.texto_complementar.trim()) {
    contractText += '\n\n' + empresa.texto_complementar.trim();
  }

  return contractText;
}

function formatServices(servicos) {
  if (!servicos || !Array.isArray(servicos)) return '';
  return servicos.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function formatCurrency(value) {
  if (!value && value !== 0) return 'R$ 0,00';
  const numValue =
    typeof value === 'string'
      ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'))
      : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString('pt-BR');
  }
  return date.toLocaleDateString('pt-BR');
}
