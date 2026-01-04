# Backend - SaaS Contratos

Backend completo para sistema de propostas e contratos usando **Supabase** como banco de dados.

## 🚀 Tecnologias

- **Node.js** + **Express**
- **Supabase** (PostgreSQL)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Node.js 18+ instalado
3. npm ou yarn

## ⚙️ Configuração

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `env.example` para `.env` e preencha com suas credenciais do Supabase:

```bash
cp env.example .env
```

Edite o arquivo `.env`:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
PORT=3001
NODE_ENV=development
JWT_SECRET=seu-secret-jwt-aqui
FRONTEND_URL=http://localhost:5173
```

### 3. Criar tabelas no Supabase

1. Acesse o **SQL Editor** no painel do Supabase
2. Execute o arquivo `src/migrations/001_create_tables.sql`
3. Execute o arquivo `src/migrations/002_insert_default_data.sql` (opcional - insere dados padrão)

### 4. Criar usuário admin inicial

Execute no SQL Editor do Supabase (substitua os valores):

```sql
-- Senha padrão: admin123 (hash bcrypt)
INSERT INTO users (email, password_hash, full_name)
VALUES (
  'admin@example.com',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
  'Administrador'
);
```

Ou use a rota de registro (apenas em desenvolvimento):

```bash
POST /api/auth/register
{
  "email": "admin@example.com",
  "password": "senha123",
  "full_name": "Administrador"
}
```

## 🏃 Executar

### Modo desenvolvimento (com auto-reload)

```bash
npm run dev
```

### Modo produção

```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 API Endpoints

### Autenticação

- `POST /api/auth/login` - Login de usuário admin
- `POST /api/auth/register` - Registrar novo usuário (apenas dev)
- `GET /api/auth/me` - Obter dados do usuário autenticado

### Propostas (Requer autenticação)

- `GET /api/propostas` - Listar todas as propostas
- `GET /api/propostas/:id` - Buscar proposta específica
- `POST /api/propostas` - Criar nova proposta
- `PUT /api/propostas/:id` - Atualizar proposta
- `DELETE /api/propostas/:id` - Excluir proposta

**Query params para GET /api/propostas:**
- `status` - Filtrar por status (rascunho, enviada, aceita, cancelada)
- `search` - Buscar por nome ou email do cliente

### Modelos de Contrato (Requer autenticação)

- `GET /api/modelos` - Listar todos os modelos
- `GET /api/modelos/:id` - Buscar modelo específico
- `POST /api/modelos` - Criar novo modelo
- `PUT /api/modelos/:id` - Atualizar modelo
- `DELETE /api/modelos/:id` - Excluir modelo

### Contratos (Requer autenticação)

- `GET /api/contratos` - Listar todos os contratos
- `GET /api/contratos/:id` - Buscar contrato específico
- `PUT /api/contratos/:id/status` - Atualizar status do contrato

### Rotas Públicas (Não requerem autenticação)

- `GET /api/public/proposta/:id` - Visualizar proposta (cliente)
- `POST /api/public/proposta/:id/aceitar` - Aceitar proposta e gerar contrato
- `GET /api/public/contrato/:id` - Visualizar contrato (cliente)
- `POST /api/public/contrato/:id/assinar` - Assinar contrato digitalmente

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:

```
Authorization: Bearer <token>
```

O token é obtido através do login e expira em 7 dias.

## 📊 Estrutura do Banco de Dados

### Tabelas

- **users** - Usuários administradores
- **modelos_contrato** - Templates de contratos
- **propostas** - Propostas comerciais
- **contratos** - Contratos gerados

### Status das Propostas

- `rascunho` - Proposta ainda não enviada
- `enviada` - Proposta enviada ao cliente
- `aceita` - Proposta aceita pelo cliente
- `cancelada` - Proposta cancelada

### Status dos Contratos

- `enviado` - Contrato gerado e enviado
- `visualizado` - Cliente visualizou o contrato
- `assinado` - Contrato assinado digitalmente

## 🔄 Fluxo de Negócio

1. **Admin cria proposta** → Status: `rascunho`
2. **Admin envia proposta** → Status: `enviada` (gera link público)
3. **Cliente acessa link** → Visualiza proposta
4. **Cliente aceita proposta** → Status: `aceita` + Gera contrato automaticamente
5. **Cliente assina contrato** → Status: `assinado`

## 🛡️ Regras de Negócio

- Propostas aceitas não podem ser editadas
- Propostas aceitas não podem ser excluídas
- Contratos só são gerados quando proposta é aceita
- Assinatura só pode ocorrer após aceitar proposta
- Modelos de contrato não podem ser excluídos se houver propostas vinculadas

## 🧪 Testando a API

### Exemplo com cURL

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha123"}'

# Criar proposta (use o token retornado)
curl -X POST http://localhost:3001/api/propostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cliente_nome": "João Silva",
    "cliente_email": "joao@example.com",
    "valor_total": 45000,
    "servicos": ["Desenvolvimento Web", "App Mobile"],
    "modelo_contrato_id": "<id-do-modelo>"
  }'
```

## 📝 Variáveis de Template

Os modelos de contrato suportam as seguintes variáveis padrão:

- `{{nome_cliente}}` - Nome do cliente
- `{{empresa_cliente}}` - Empresa do cliente
- `{{cnpj_cliente}}` - CNPJ do cliente
- `{{email_cliente}}` - Email do cliente
- `{{descricao_servicos}}` - Lista de serviços
- `{{servico_personalizado}}` - Serviço personalizado
- `{{valor_total}}` - Valor total formatado
- `{{prazo_execucao}}` - Prazo de execução
- `{{data_inicio}}` - Data de início
- `{{data_entrega}}` - Data de entrega
- `{{condicoes_pagamento}}` - Condições de pagamento
- `{{data_assinatura}}` - Data de assinatura

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"
- Verifique se o arquivo `.env` existe e está preenchido corretamente

### Erro: "Token inválido"
- Verifique se está enviando o token no header `Authorization: Bearer <token>`
- O token pode ter expirado (válido por 7 dias)

### Erro: "Tabela não encontrada"
- Execute as migrations no SQL Editor do Supabase

## 📄 Licença

ISC

