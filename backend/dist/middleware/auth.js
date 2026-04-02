import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware de autenticação simples usando JWT
 * Para produção, considere usar Supabase Auth completo
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.substring(7);

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');

    // Buscar usuário no banco
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};

/**
 * Middleware opcional - apenas verifica se o token existe mas não bloqueia
 * Útil para rotas públicas que podem ter funcionalidades extras para usuários autenticados
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name')
        .eq('id', decoded.userId)
        .single();

      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Se houver erro, apenas continua sem autenticação
    next();
  }
};

