import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/modelos
 * Lista todos os modelos de contrato
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('modelos_contrato')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar modelos:', error);
      return res.status(500).json({ error: 'Erro ao buscar modelos' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/modelos/:id
 * Busca um modelo específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('modelos_contrato')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
      console.error('Erro ao buscar modelo:', error);
      return res.status(500).json({ error: 'Erro ao buscar modelo' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/modelos
 * Cria um novo modelo de contrato
 */
router.post('/', async (req, res) => {
  try {
    const { nome, template_texto, variaveis } = req.body;

    if (!nome || !template_texto) {
      return res.status(400).json({ error: 'Nome e template_texto são obrigatórios' });
    }

    const { data, error } = await supabaseAdmin
      .from('modelos_contrato')
      .insert({
        nome,
        template_texto,
        variaveis: variaveis || []
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar modelo:', error);
      return res.status(500).json({ error: 'Erro ao criar modelo' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/modelos/:id
 * Atualiza um modelo de contrato
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, template_texto, variaveis } = req.body;

    const updateData = {};
    if (nome !== undefined) updateData.nome = nome;
    if (template_texto !== undefined) updateData.template_texto = template_texto;
    if (variaveis !== undefined) updateData.variaveis = variaveis;

    const { data, error } = await supabaseAdmin
      .from('modelos_contrato')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
      console.error('Erro ao atualizar modelo:', error);
      return res.status(500).json({ error: 'Erro ao atualizar modelo' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/modelos/:id
 * Exclui um modelo de contrato
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há propostas usando este modelo
    const { data: propostas } = await supabaseAdmin
      .from('propostas')
      .select('id')
      .eq('modelo_contrato_id', id)
      .limit(1);

    if (propostas && propostas.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir este modelo. Existem propostas vinculadas a ele.' 
      });
    }

    const { error } = await supabaseAdmin
      .from('modelos_contrato')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
      console.error('Erro ao excluir modelo:', error);
      return res.status(500).json({ error: 'Erro ao excluir modelo' });
    }

    res.json({ message: 'Modelo excluído com sucesso' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

