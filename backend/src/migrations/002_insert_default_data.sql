-- Migration: Inserir dados padrão
-- Execute este script após criar as tabelas

-- Inserir modelo de contrato padrão
INSERT INTO modelos_contrato (nome, template_texto, variaveis)
VALUES (
  'Contrato de Prestação de Serviços',
  'CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: {{nome_cliente}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{cnpj_cliente}}, com sede em {{endereco_cliente}}, doravante denominada CONTRATANTE.

CONTRATADA: {{razao_social_empresa}}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {{cnpj_empresa}}, com sede em {{endereco_completo_empresa}}, doravante denominada CONTRATADA.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas seguintes:

1. OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação dos seguintes serviços pela CONTRATADA:

{{descricao_servicos}}

{{servico_personalizado}}

2. VALOR E FORMA DE PAGAMENTO

2.1. O valor total dos serviços contratados é de {{valor_total}}.

2.2. Condições de pagamento: {{condicoes_pagamento}}.

2.3. Os pagamentos deverão ser efetuados mediante depósito bancário ou transferência para conta indicada pela CONTRATADA.

3. PRAZO DE EXECUÇÃO

3.1. O prazo para execução dos serviços é de {{prazo_execucao}}.

3.2. Data de início: {{data_inicio}}.

3.3. Data prevista para conclusão: {{data_entrega}}.

3.4. O prazo poderá ser prorrogado mediante acordo entre as partes, formalizado por escrito.

4. OBRIGAÇÕES DA CONTRATADA

4.1. Executar os serviços conforme especificações acordadas neste instrumento;
4.2. Manter sigilo absoluto sobre informações confidenciais da CONTRATANTE;
4.3. Entregar o projeto no prazo estipulado, salvo casos de força maior;
4.4. Fornecer suporte técnico durante o período de desenvolvimento;
4.5. Comunicar imediatamente qualquer impedimento para execução dos serviços.

5. OBRIGAÇÕES DO CONTRATANTE

5.1. Efetuar os pagamentos nas datas acordadas;
5.2. Fornecer todas as informações necessárias para execução do projeto;
5.3. Disponibilizar recursos e acessos quando solicitados pela CONTRATADA;
5.4. Validar as entregas em tempo hábil, no prazo máximo de 5 (cinco) dias úteis.

6. PROPRIEDADE INTELECTUAL

6.1. Após a quitação integral do valor contratado, todos os direitos de propriedade intelectual sobre o software desenvolvido serão transferidos à CONTRATANTE.

7. RESCISÃO

7.1. O presente contrato poderá ser rescindido por qualquer das partes, mediante notificação por escrito com antecedência mínima de 30 (trinta) dias.

7.2. Em caso de rescisão, serão devidos os valores proporcionais aos serviços já executados.

8. DISPOSIÇÕES GERAIS

8.1. Este contrato é regido pelas leis brasileiras.

8.2. Quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.

8.3. Os casos omissos serão resolvidos de comum acordo entre as partes.

E, por estarem assim justas e acordadas, as partes assinam o presente instrumento em duas vias de igual teor e forma.

São Paulo, {{data_assinatura}}.',
  '[
    {"key": "{{nome_cliente}}", "label": "Nome do Cliente"},
    {"key": "{{empresa_cliente}}", "label": "Empresa do Cliente"},
    {"key": "{{cnpj_cliente}}", "label": "CNPJ do Cliente"},
    {"key": "{{email_cliente}}", "label": "Email do Cliente"},
    {"key": "{{telefone_cliente}}", "label": "Telefone do Cliente"},
    {"key": "{{razao_social_empresa}}", "label": "Razão Social da Empresa (CONTRATADA)"},
    {"key": "{{cnpj_empresa}}", "label": "CNPJ da Empresa"},
    {"key": "{{email_empresa}}", "label": "Email da Empresa"},
    {"key": "{{telefone_empresa}}", "label": "Telefone da Empresa"},
    {"key": "{{endereco_empresa}}", "label": "Endereço da Empresa"},
    {"key": "{{cidade_empresa}}", "label": "Cidade da Empresa"},
    {"key": "{{endereco_completo_empresa}}", "label": "Endereço Completo da Empresa (Endereço + Cidade)"},
    {"key": "{{texto_complementar}}", "label": "Texto Complementar (adicionado ao final)"},
    {"key": "{{descricao_servicos}}", "label": "Descrição dos Serviços"},
    {"key": "{{servico_personalizado}}", "label": "Serviço Personalizado"},
    {"key": "{{valor_total}}", "label": "Valor Total"},
    {"key": "{{prazo_execucao}}", "label": "Prazo de Execução"},
    {"key": "{{data_inicio}}", "label": "Data de Início"},
    {"key": "{{data_entrega}}", "label": "Data de Entrega"},
    {"key": "{{condicoes_pagamento}}", "label": "Condições de Pagamento"},
    {"key": "{{data_assinatura}}", "label": "Data de Assinatura"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

