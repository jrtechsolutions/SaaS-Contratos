import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
import { generatePDF } from '../utils/pdf-generator.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/contratos
 * Lista todos os contratos
 */
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from('contratos')
      .select(`
        *,
        proposta:propostas(
          id,
          cliente_nome,
          cliente_email,
          valor_total,
          status
        )
      `)
      .order('created_at', { ascending: false });

    // Filtro por status
    if (status) {
      query = query.eq('status', status);
    }

    // Busca por nome do cliente na proposta relacionada
    if (search) {
      // Nota: Supabase não suporta busca direta em relacionamentos
      // Buscar primeiro as propostas e depois os contratos
      const { data: propostas } = await supabaseAdmin
        .from('propostas')
        .select('id')
        .or(`cliente_nome.ilike.%${search}%,cliente_email.ilike.%${search}%`);

      if (propostas && propostas.length > 0) {
        const propostaIds = propostas.map(p => p.id);
        query = query.in('proposta_id', propostaIds);
      } else {
        // Se não encontrou propostas, retornar array vazio
        return res.json([]);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar contratos:', error);
      return res.status(500).json({ error: 'Erro ao buscar contratos' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/contratos/:id
 * Busca um contrato específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .select(`
        *,
        proposta:propostas(
          *,
          modelo_contrato:modelos_contrato(id, nome)
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

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/contratos/:id/status
 * Atualiza o status de um contrato (ex: marcar como visualizado)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['enviado', 'visualizado', 'assinado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const updateData = { status };
    if (status === 'assinado' && !req.body.data_assinatura) {
      updateData.data_assinatura = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('contratos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Contrato não encontrado' });
      }
      console.error('Erro ao atualizar status:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/contratos/:id/pdf
 * Gera e retorna PDF do contrato assinado
 */
router.get('/:id/pdf', async (req, res) => {
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

