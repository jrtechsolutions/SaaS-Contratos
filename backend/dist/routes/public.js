import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { generateContract } from '../utils/contract-generator.js';
import { generatePDF } from '../utils/pdf-generator.js';

const router = express.Router();

/**
 * GET /api/public/proposta/:id
 * Retorna dados públicos de uma proposta (para visualização do cliente)
 */
router.get('/proposta/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('propostas')
      .select(`
        id,
        cliente_nome,
        cliente_email,
        cliente_empresa,
        servicos,
        servico_personalizado,
        valor_total,
        condicoes_pagamento,
        prazo_execucao,
        data_inicio,
        data_entrega,
        telas_sistema,
        status,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Proposta não encontrada' });
      }
      console.error('Erro ao buscar proposta:', error);
      return res.status(500).json({ error: 'Erro ao buscar proposta' });
    }

    // Não retornar propostas em rascunho
    if (data.status === 'rascunho') {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/public/proposta/:id/aceitar
 * Aceita uma proposta e gera o contrato
 */
router.post('/proposta/:id/aceitar', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar proposta
    const { data: proposta, error: propostaError } = await supabaseAdmin
      .from('propostas')
      .select(`
        *,
        modelo_contrato:modelos_contrato(*)
      `)
      .eq('id', id)
      .single();

    if (propostaError || !proposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Verificar se já foi aceita
    if (proposta.status === 'aceita') {
      // Buscar contrato existente
      const { data: contratoExistente } = await supabaseAdmin
        .from('contratos')
        .select('*')
        .eq('proposta_id', id)
        .single();

      if (contratoExistente) {
        return res.json({
          message: 'Proposta já aceita',
          contrato_id: contratoExistente.id,
          proposta: proposta
        });
      }
    }

    // Verificar se pode ser aceita
    if (proposta.status !== 'enviada' && proposta.status !== 'aceita') {
      return res.status(400).json({ 
        error: `Esta proposta não pode ser aceita. Status atual: ${proposta.status}` 
      });
    }

    // Verificar se tem modelo de contrato
    if (!proposta.modelo_contrato_id || !proposta.modelo_contrato) {
      return res.status(400).json({ 
        error: 'Esta proposta não possui um modelo de contrato associado' 
      });
    }

    // Buscar configurações da empresa
    const { data: configuracoes, error: configError } = await supabaseAdmin
      .from('configuracoes_empresa')
      .select('*')
      .limit(1)
      .single();

    // Se não encontrar configurações, usar null (o generateContract usará valores padrão)
    const configuracoesEmpresa = configError ? null : configuracoes;

    // Gerar contrato usando template, proposta e configurações da empresa
    const textoContrato = generateContract(proposta.modelo_contrato, proposta, configuracoesEmpresa);

    // Atualizar status da proposta para 'aceita'
    await supabaseAdmin
      .from('propostas')
      .update({ status: 'aceita' })
      .eq('id', id);

    // Criar contrato
    const { data: contrato, error: contratoError } = await supabaseAdmin
      .from('contratos')
      .insert({
        proposta_id: id,
        texto_contrato: textoContrato,
        status: 'enviado'
      })
      .select()
      .single();

    if (contratoError) {
      console.error('Erro ao criar contrato:', contratoError);
      return res.status(500).json({ error: 'Erro ao gerar contrato' });
    }

    res.status(201).json({
      message: 'Proposta aceita e contrato gerado com sucesso',
      contrato_id: contrato.id,
      proposta: {
        ...proposta,
        status: 'aceita'
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/public/contrato/:id
 * Retorna dados públicos de um contrato (para visualização e assinatura do cliente)
 */
router.get('/contrato/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .select(`
        id,
        texto_contrato,
        status,
        data_assinatura,
        created_at,
        proposta:propostas(
          id,
          cliente_nome,
          cliente_email,
          cliente_empresa,
          cliente_cnpj,
          valor_total,
          prazo_execucao,
          data_inicio,
          data_entrega,
          telas_sistema
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      console.error('Erro ao buscar contrato:', error);
      return res.status(500).json({ error: 'Erro ao buscar contrato' });
    }

    // Não retornar assinatura do cliente por segurança (apenas status)
    const response = {
      ...data,
      assinatura_cliente: data.status === 'assinado' ? 'assinado' : null
    };

    res.json(response);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/public/contrato/:id/assinar
 * Assina um contrato digitalmente
 */
router.post('/contrato/:id/assinar', async (req, res) => {
  try {
    const { id } = req.params;
    const { assinatura_cliente } = req.body;

    if (!assinatura_cliente) {
      return res.status(400).json({ error: 'Assinatura é obrigatória' });
    }

    // Verificar se contrato existe
    const { data: contrato, error: contratoError } = await supabaseAdmin
      .from('contratos')
      .select('status, proposta:propostas(status)')
      .eq('id', id)
      .single();

    if (contratoError || !contrato) {
      return res.status(404).json({ error: 'Contrato não encontrado' });
    }

    // Verificar se já foi assinado
    if (contrato.status === 'assinado') {
      return res.status(400).json({ error: 'Este contrato já foi assinado' });
    }

    // Verificar se a proposta foi aceita
    if (contrato.proposta && contrato.proposta.status !== 'aceita') {
      return res.status(400).json({ 
        error: 'A proposta relacionada precisa ser aceita antes de assinar o contrato' 
      });
    }

    // Atualizar contrato com assinatura
    const { data: contratoAtualizado, error: updateError } = await supabaseAdmin
      .from('contratos')
      .update({
        assinatura_cliente: assinatura_cliente,
        status: 'assinado',
        data_assinatura: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao assinar contrato:', updateError);
      return res.status(500).json({ error: 'Erro ao assinar contrato' });
    }

    res.json({
      message: 'Contrato assinado com sucesso',
      contrato: {
        id: contratoAtualizado.id,
        status: contratoAtualizado.status,
        data_assinatura: contratoAtualizado.data_assinatura
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/public/contrato/:id/pdf
 * Gera e retorna PDF do contrato assinado (rota pública para cliente)
 */
router.get('/contrato/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar contrato com dados da proposta
    const { data: contrato, error } = await supabaseAdmin
      .from('contratos')
      .select(`
        *,
        proposta:propostas(
          *,
          modelo_contrato:modelos_contrato(nome)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      console.error('Erro ao buscar contrato:', error);
      return res.status(500).json({ error: 'Erro ao buscar contrato' });
    }

    // Só permitir download se estiver assinado
    if (contrato.status !== 'assinado') {
      return res.status(400).json({ error: 'Contrato ainda não foi assinado' });
    }

    // Gerar PDF
    const pdfBuffer = await generatePDF(contrato);

    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="contrato-${contrato.proposta?.cliente_nome || id}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: 'Erro ao gerar PDF do contrato' });
  }
});

export default router;

