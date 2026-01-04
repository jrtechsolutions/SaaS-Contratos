import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import propostasRoutes from './routes/propostas.js';
import modelosRoutes from './routes/modelos.js';
import contratosRoutes from './routes/contratos.js';
import publicRoutes from './routes/public.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Configurar CORS para aceitar múltiplas origens
// Em produção, aceita FRONTEND_URL e URLs do Netlify
// Em desenvolvimento, aceita várias origens locais
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      FRONTEND_URL,
      // Aceitar também URLs do Netlify (qualquer subdomínio .netlify.app)
      ...(FRONTEND_URL.includes('netlify') ? [] : []), // Se FRONTEND_URL já for Netlify, não precisa adicionar
    ].filter(Boolean) // Remove valores vazios
  : [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173',
    ];

// Se FRONTEND_ALLOWED_ORIGINS estiver definido, usar essa lista (separada por vírgula)
const additionalOrigins = process.env.FRONTEND_ALLOWED_ORIGINS
  ? process.env.FRONTEND_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Combinar todas as origens permitidas
const allAllowedOrigins = [...allowedOrigins, ...additionalOrigins];

console.log('🌐 Origens permitidas (CORS):', allAllowedOrigins);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: Postman, mobile apps, server-side)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Verificar se a origem está na lista permitida
    if (allAllowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    // Em produção, aceitar também qualquer URL do Netlify
    if (process.env.NODE_ENV === 'production') {
      // Aceitar qualquer subdomínio .netlify.app (incluindo previews)
      const netlifyPattern = /^https:\/\/[\w-]+(?:--[\w-]+)?\.netlify\.app$/;
      if (netlifyPattern.test(origin)) {
        console.log(`✅ CORS: Aceitando origem Netlify: ${origin}`);
        callback(null, true);
        return;
      }
    }

    // Em desenvolvimento, aceitar localhost em qualquer porta
    if (process.env.NODE_ENV !== 'production') {
      const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      if (localhostPattern.test(origin)) {
        callback(null, true);
        return;
      }
    }

    // Log para debug
    console.warn(`⚠️  Origem bloqueada pelo CORS: ${origin}`);
    console.warn(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.warn(`   Origens permitidas:`, allAllowedOrigins);

    callback(new Error(`Não permitido pelo CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Para navegadores legados
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API está funcionando' });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/modelos', modelosRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/public', publicRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  if (additionalOrigins.length > 0) {
    console.log(`🌐 URLs adicionais permitidas: ${additionalOrigins.join(', ')}`);
  }
  console.log(`🌐 CORS: Aceitando URLs do Netlify em produção: ${process.env.NODE_ENV === 'production' ? 'SIM' : 'NÃO'}`);
});

export default app;

