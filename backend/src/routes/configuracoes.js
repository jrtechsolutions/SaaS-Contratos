import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/configuracoes
 * Busca as configurações da empresa (singleton)
 */
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('configuracoes_empresa')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // Se a tabela não existe (erro PGRST204 ou PGRST205)
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message?.includes('table') || error.message?.includes('schema')) {
        console.error('Tabela configuracoes_empresa não existe. Execute a migration 004_create_configuracoes_empresa.sql');
        // Retornar dados padrão temporários até a migration ser executada
        return res.json({
          id: 'temp',
          razao_social: 'JR Technology Solutions',
          cnpj: '00.000.000/0001-00',
          email: 'contato@jrtechnologysolutions.com.br',
          telefone: '(00) 0000-0000',
          endereco: 'Endereço da Empresa, 123',
          cidade: 'Cidade - UF',
          texto_complementar: 'Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      // Se não existe registro, criar um padrão
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabaseAdmin
          .from('configuracoes_empresa')
          .insert({
            razao_social: 'JR Technology Solutions',
            cnpj: '00.000.000/0001-00',
            email: 'contato@jrtechnologysolutions.com.br',
            telefone: '(00) 0000-0000',
            endereco: 'Endereço da Empresa, 123',
            cidade: 'Cidade - UF',
            texto_complementar: 'Este contrato é regido pelas leis brasileiras e quaisquer disputas serão resolvidas no foro da comarca da sede da CONTRATADA.'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar configurações padrão:', insertError);
          return res.status(500).json({ error: 'Erro ao criar configurações' });
        }

        return res.json(newData);
      }

      console.error('Erro ao buscar configurações:', error);
      return res.status(500).json({ error: 'Erro ao buscar configurações', details: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

/**
 * PUT /api/configuracoes
 * Atualiza as configurações da empresa (singleton)
 */
router.put('/', async (req, res) => {
  try {
    const {
      razao_social,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      logo_url,
      texto_complementar
    } = req.body;

    // Validar campos obrigatórios
    if (!razao_social || !cnpj || !email || !telefone || !endereco) {
      return res.status(400).json({ error: 'Campos obrigatórios: razao_social, cnpj, email, telefone, endereco' });
    }

    // Buscar registro existente
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('configuracoes_empresa')
      .select('id')
      .limit(1)
      .single();

    // Se a tabela não existe, retornar erro informativo
    if (existingError && (existingError.code === 'PGRST204' || existingError.code === 'PGRST205')) {
      return res.status(500).json({ 
        error: 'Tabela configuracoes_empresa não existe. Execute a migration 004_create_configuracoes_empresa_simple.sql no Supabase' 
      });
    }

    let result;

    if (existing) {
      // Atualizar registro existente
      const { data, error } = await supabaseAdmin
        .from('configuracoes_empresa')
        .update({
          razao_social,
          cnpj,
          email,
          telefone,
          endereco,
          cidade: cidade || null,
          logo_url: logo_url || null,
          texto_complementar: texto_complementar || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar configurações:', error);
        return res.status(500).json({ error: 'Erro ao atualizar configurações' });
      }

      result = data;
    } else {
      // Criar novo registro (não deveria acontecer devido ao trigger, mas por segurança)
      const { data, error } = await supabaseAdmin
        .from('configuracoes_empresa')
        .insert({
          razao_social,
          cnpj,
          email,
          telefone,
          endereco,
          cidade: cidade || null,
          logo_url: logo_url || null,
          texto_complementar: texto_complementar || null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar configurações:', error);
        return res.status(500).json({ error: 'Erro ao criar configurações' });
      }

      result = data;
    }

    res.json(result);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;

