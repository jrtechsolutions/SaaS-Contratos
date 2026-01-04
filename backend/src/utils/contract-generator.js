/**
 * Utilitário para gerar contratos a partir de templates
 * Substitui variáveis do template pelos dados da proposta
 */

export function generateContract(template, proposta) {
  let contractText = template.template_texto;

  // Mapeamento de variáveis padrão
  const variables = {
    '{{nome_cliente}}': proposta.cliente_nome || '',
    '{{empresa_cliente}}': proposta.cliente_empresa || '',
    '{{cnpj_cliente}}': proposta.cliente_cnpj || '',
    '{{email_cliente}}': proposta.cliente_email || '',
    '{{descricao_servicos}}': formatServices(proposta.servicos),
    '{{servico_personalizado}}': proposta.servico_personalizado || '',
    '{{valor_total}}': formatCurrency(proposta.valor_total),
    '{{prazo_execucao}}': proposta.prazo_execucao || '',
    '{{data_inicio}}': formatDate(proposta.data_inicio),
    '{{data_entrega}}': formatDate(proposta.data_entrega),
    '{{condicoes_pagamento}}': proposta.condicoes_pagamento || '',
    '{{data_assinatura}}': new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  };

  // Substituir todas as variáveis
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
    contractText = contractText.replace(regex, variables[key]);
  });

  // Substituir variáveis customizadas do template se houver
  if (template.variaveis && Array.isArray(template.variaveis)) {
    template.variaveis.forEach(variable => {
      if (variable.key && !variables[variable.key]) {
        // Variável customizada não mapeada - deixar como está ou remover
        contractText = contractText.replace(new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'), '');
      }
    });
  }

  return contractText;
}

function formatServices(servicos) {
  if (!servicos || !Array.isArray(servicos)) {
    return '';
  }
  return servicos.map((s, i) => `${i + 1}. ${s}`).join('\n');
}

function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
}

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }
  return date.toLocaleDateString('pt-BR');
}

