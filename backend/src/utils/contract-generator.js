/**
 * Utilitário para gerar contratos a partir de templates
 * Substitui variáveis do template pelos dados da proposta e configurações da empresa
 */

export function generateContract(template, proposta, configuracoesEmpresa = null) {
  let contractText = template.template_texto;

  // Dados da empresa (configurações ou padrão)
  const empresa = configuracoesEmpresa || {
    razao_social: 'JR Technology Solutions',
    cnpj: 'XX.XXX.XXX/0001-XX',
    email: 'contato@jrtechnologysolutions.com.br',
    telefone: '(00) 0000-0000',
    endereco: 'Endereço da Empresa',
    cidade: 'Cidade - UF',
    texto_complementar: ''
  };

  // Mapeamento de variáveis padrão
  const variables = {
    // Variáveis do cliente
    '{{nome_cliente}}': proposta.cliente_nome || '',
    '{{empresa_cliente}}': proposta.cliente_empresa || '',
    '{{cnpj_cliente}}': proposta.cliente_cnpj || '',
    '{{email_cliente}}': proposta.cliente_email || '',
    '{{telefone_cliente}}': proposta.cliente_telefone || '',
    
    // Variáveis dos serviços
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
    }),
    
    // Variáveis da empresa (CONTRATADA)
    '{{razao_social_empresa}}': empresa.razao_social || '',
    '{{cnpj_empresa}}': empresa.cnpj || '',
    '{{email_empresa}}': empresa.email || '',
    '{{telefone_empresa}}': empresa.telefone || '',
    '{{endereco_empresa}}': empresa.endereco || '',
    '{{cidade_empresa}}': empresa.cidade || '',
    '{{endereco_completo_empresa}}': empresa.cidade 
      ? `${empresa.endereco}, ${empresa.cidade}` 
      : empresa.endereco || '',
    
    // Variáveis legais
    '{{texto_complementar}}': empresa.texto_complementar || ''
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

  // Adicionar texto complementar ao final do contrato se existir
  if (empresa.texto_complementar && empresa.texto_complementar.trim()) {
    contractText += '\n\n' + empresa.texto_complementar.trim();
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

