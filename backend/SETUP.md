# 🚀 Guia de Configuração do Backend

## Passo 1: Configurar Variáveis de Ambiente

1. **Crie um arquivo `.env` na pasta `backend/`** com o seguinte conteúdo:

```env
# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=seu-secret-jwt-aqui

# CORS
FRONTEND_URL=http://localhost:8080
```

### Onde encontrar as credenciais do Supabase:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **MANTENHA SECRETO!**

## Passo 2: Verificar Conexão

Execute o script de verificação:

```bash
cd backend
node src/scripts/check-connection.js
```

Este script vai:
- ✅ Verificar se as variáveis de ambiente estão configuradas
- ✅ Testar a conexão com o Supabase
- ✅ Informar se as tabelas já existem

## Passo 3: Criar Tabelas no Supabase

### Opção A: Via SQL Editor (Recomendado)

1. Acesse o **SQL Editor** no painel do Supabase:
   - https://supabase.com/dashboard/project/_/sql

2. Abra o arquivo `src/migrations/001_create_tables.sql`

3. **Copie TODO o conteúdo** do arquivo

4. **Cole no SQL Editor** do Supabase

5. Clique em **Run** ou pressione `Ctrl+Enter`

6. Repita o processo com `002_insert_default_data.sql` (opcional - insere dados padrão)

### Opção B: Via CLI do Supabase (Avançado)

Se você tem o Supabase CLI instalado:

```bash
supabase db push
```

## Passo 4: Verificar se as Tabelas Foram Criadas

1. No painel do Supabase, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ `users`
   - ✅ `modelos_contrato`
   - ✅ `propostas`
   - ✅ `contratos`

## Passo 5: Criar Usuário Admin

Execute o script para criar o primeiro usuário admin:

```bash
npm run create-admin admin@example.com senha123 "Administrador"
```

Ou use a rota de registro (apenas desenvolvimento):

```bash
POST http://localhost:3001/api/auth/register
{
  "email": "admin@example.com",
  "password": "senha123",
  "full_name": "Administrador"
}
```

## Passo 6: Iniciar o Servidor

```bash
npm run dev
```

O servidor deve iniciar em `http://localhost:3001`

## 🔍 Troubleshooting

### Erro: "Variáveis de ambiente do Supabase não configuradas"

- Verifique se o arquivo `.env` existe na pasta `backend/`
- Verifique se as variáveis estão escritas corretamente (sem espaços extras)
- Certifique-se de que não há aspas extras nas URLs/keys

### Erro: "Tabela não encontrada"

- Execute as migrations no SQL Editor do Supabase
- Verifique se você executou o script completo (não apenas parte dele)

### Erro: "Token inválido" ou "Não autorizado"

- Verifique se a `SUPABASE_SERVICE_ROLE_KEY` está correta
- Certifique-se de estar usando a **service_role** key, não a **anon** key

### Erro de conexão

- Verifique se a URL do Supabase está correta (deve terminar com `.supabase.co`)
- Verifique sua conexão com a internet
- Certifique-se de que o projeto Supabase está ativo

## 📚 Recursos

- [Documentação do Supabase](https://supabase.com/docs)
- [SQL Editor Guide](https://supabase.com/docs/guides/database/overview)

