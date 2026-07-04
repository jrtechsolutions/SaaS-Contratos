import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { buildPricingFields } from '../utils/proposta-pricing.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/propostas
 * Lista todas as propostas
 */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from('propostas')
      .select(`
        *,
        modelo_contrato:modelos_contrato(id, nome)
      `)
      .order('created_at', { ascending: false });

    // Filtro por status
    if (status) {
      query = query.eq('status', status);
    }

    // Busca por nome ou email do cliente
    if (search) {
      query = query.or(`cliente_nome.ilike.%${search}%,cliente_email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar propostas:', error);
      return res.status(500).json({ error: 'Erro ao buscar propostas' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/propostas/:id
 * Busca uma proposta específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('propostas')
      .select(`
        *,
        modelo_contrato:modelos_contrato(id, nome, template_texto, variaveis)
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

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/propostas
 * Cria uma nova proposta
 */
router.post('/', async (req, res) => {
  try {
    console.log('POST /propostas - Body recebido:', JSON.stringify(req.body, null, 2));
    
    const {
      cliente_nome,
      cliente_email,
      cliente_telefone,
      cliente_empresa,
      cliente_cnpj,
      cliente_endereco,
      servicos,
      servico_personalizado,
      prazo_execucao,
      data_inicio,
      data_entrega,
      observacoes,
      modelo_contrato_id,
      telas_sistema,
      status = 'rascunho'
    } = req.body;

    // Validações básicas
    if (!cliente_nome || !cliente_email) {
      console.error('Validação falhou:', { cliente_nome, cliente_email });
      return res.status(400).json({ error: 'Campos obrigatórios: cliente_nome, cliente_email' });
    }

    const pricingResult = buildPricingFields(req.body);
    if (pricingResult.error) {
      return res.status(400).json({ error: pricingResult.error });
    }

    const pricingData = pricingResult.data;
    const valorTotalNum = pricingData.valor_total;

    if (valorTotalNum > 999999999999999999.99) {
      console.error('Valor total muito grande:', valorTotalNum);
      return res.status(400).json({ error: 'Valor total não pode ser maior que R$ 999.999.999.999.999.999,99' });
    }

    // Calcular prazo_execucao automaticamente se não fornecido mas datas estiverem presentes
    let calculatedPrazoExecucao = prazo_execucao;
    if (!calculatedPrazoExecucao && data_inicio && data_entrega) {
      try {
        const start = new Date(data_inicio);
        const delivery = new Date(data_entrega);
        const diffTime = Math.abs(delivery.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        calculatedPrazoExecucao = `${diffDays} dias`;
      } catch (error) {
        console.warn('Erro ao calcular prazo_execucao:', error);
      }
    }

    // Converter strings vazias para null
    const cleanValue = (val) => {
      if (val === null || val === undefined) return null;
      const str = val.toString().trim();
      return str !== '' ? str : null;
    };

    // Validar modelo_contrato_id se fornecido (deve ser UUID válido)
    let modeloContratoId = cleanValue(modelo_contrato_id);
    if (modeloContratoId) {
      // Validar formato UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(modeloContratoId)) {
        console.error('modelo_contrato_id inválido:', modeloContratoId);
        return res.status(400).json({ error: 'ID do modelo de contrato inválido' });
      }
    }

    const insertData = {
      cliente_nome: cliente_nome.trim(),
      cliente_email: cliente_email.trim(),
      cliente_telefone: cleanValue(cliente_telefone),
      cliente_empresa: cleanValue(cliente_empresa),
      cliente_cnpj: cleanValue(cliente_cnpj),
      cliente_endereco: cleanValue(cliente_endereco),
      servicos: Array.isArray(servicos) ? servicos : [],
      servico_personalizado: cleanValue(servico_personalizado),
      ...pricingData,
      prazo_execucao: cleanValue(calculatedPrazoExecucao),
      data_inicio: cleanValue(data_inicio),
      data_entrega: cleanValue(data_entrega),
      observacoes: cleanValue(observacoes),
      modelo_contrato_id: modeloContratoId,
      telas_sistema: Array.isArray(telas_sistema) && telas_sistema.length > 0 ? telas_sistema : [],
      status
    };

    console.log('Dados para inserção:', JSON.stringify(insertData, null, 2));

    const { data, error } = await supabaseAdmin
      .from('propostas')
      .insert(insertData)
      .select(`
        *,
        modelo_contrato:modelos_contrato(id, nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao criar proposta no Supabase:', error);
      console.error('Código do erro:', error.code);
      console.error('Detalhes do erro:', error.details);
      console.error('Hint do erro:', error.hint);
      return res.status(500).json({ 
        error: 'Erro ao criar proposta',
        details: error.message,
        code: error.code,
        hint: error.hint
      });
    }

    console.log('Proposta criada com sucesso:', data.id);
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro inesperado ao criar proposta:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * PUT /api/propostas/:id
 * Atualiza uma proposta
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a proposta existe e se pode ser editada
    const { data: existingProposta } = await supabaseAdmin
      .from('propostas')
      .select('status')
      .eq('id', id)
      .single();

    if (!existingProposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Não permitir edição de propostas aceitas ou canceladas
    if (existingProposta.status === 'aceita' || existingProposta.status === 'cancelada') {
      return res.status(400).json({ 
        error: `Não é possível editar uma proposta com status "${existingProposta.status}"` 
      });
    }

    const {
      cliente_nome,
      cliente_email,
      cliente_telefone,
      cliente_empresa,
      cliente_cnpj,
      cliente_endereco,
      servicos,
      servico_personalizado,
      prazo_execucao,
      data_inicio,
      data_entrega,
      observacoes,
      modelo_contrato_id,
      telas_sistema,
      status
    } = req.body;

    let pricingData = null;
    if (
      req.body.tipo_proposta !== undefined ||
      req.body.valor_implantacao !== undefined ||
      req.body.valor_total !== undefined ||
      req.body.modulos !== undefined
    ) {
      const pricingResult = buildPricingFields(req.body);
      if (pricingResult.error) {
        return res.status(400).json({ error: pricingResult.error });
      }
      pricingData = pricingResult.data;
    }

    // Calcular prazo_execucao automaticamente se não fornecido mas datas estiverem presentes
    let calculatedPrazoExecucao = prazo_execucao;
    if (!calculatedPrazoExecucao && data_inicio && data_entrega) {
      try {
        const start = new Date(data_inicio);
        const delivery = new Date(data_entrega);
        const diffTime = Math.abs(delivery.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        calculatedPrazoExecucao = `${diffDays} dias`;
      } catch (error) {
        // Se houver erro no cálculo, manter o valor original ou undefined
      }
    }

    const updateData = {};
    if (cliente_nome !== undefined) updateData.cliente_nome = cliente_nome;
    if (cliente_email !== undefined) updateData.cliente_email = cliente_email;
    if (cliente_telefone !== undefined) updateData.cliente_telefone = cliente_telefone;
    if (cliente_empresa !== undefined) updateData.cliente_empresa = cliente_empresa;
    if (cliente_cnpj !== undefined) updateData.cliente_cnpj = cliente_cnpj;
    if (cliente_endereco !== undefined) updateData.cliente_endereco = cliente_endereco;
    if (servicos !== undefined) updateData.servicos = servicos;
    if (servico_personalizado !== undefined) updateData.servico_personalizado = servico_personalizado;
    if (pricingData) Object.assign(updateData, pricingData);
    if (calculatedPrazoExecucao !== undefined) updateData.prazo_execucao = calculatedPrazoExecucao;
    if (data_inicio !== undefined) updateData.data_inicio = data_inicio;
    if (data_entrega !== undefined) updateData.data_entrega = data_entrega;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (modelo_contrato_id !== undefined) updateData.modelo_contrato_id = modelo_contrato_id;
    if (telas_sistema !== undefined) updateData.telas_sistema = Array.isArray(telas_sistema) ? telas_sistema : [];
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabaseAdmin
      .from('propostas')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        modelo_contrato:modelos_contrato(id, nome)
      `)
      .single();

    if (error) {
      console.error('Erro ao atualizar proposta:', error);
      return res.status(500).json({ error: 'Erro ao atualizar proposta' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/propostas/:id
 * Exclui uma proposta
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a proposta existe e se pode ser excluída
    const { data: existingProposta } = await supabaseAdmin
      .from('propostas')
      .select('status')
      .eq('id', id)
      .single();

    if (!existingProposta) {
      return res.status(404).json({ error: 'Proposta não encontrada' });
    }

    // Não permitir exclusão de propostas aceitas (que geraram contratos)
    if (existingProposta.status === 'aceita') {
      return res.status(400).json({ 
        error: 'Não é possível excluir uma proposta aceita. Ela já gerou um contrato.' 
      });
    }

    const { error } = await supabaseAdmin
      .from('propostas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir proposta:', error);
      return res.status(500).json({ error: 'Erro ao excluir proposta' });
    }

    res.json({ message: 'Proposta excluída com sucesso' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

