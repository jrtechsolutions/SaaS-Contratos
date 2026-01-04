# Criar Tabela de Configurações da Empresa

## Problema

O erro 500 ao acessar `/api/configuracoes` indica que a tabela `configuracoes_empresa` não existe no banco de dados.

## Solução

Execute a migration no Supabase para criar a tabela:

### Passo 1: Acessar SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar Migration

1. Abra o arquivo: `backend/src/migrations/004_create_configuracoes_empresa_simple.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** ou pressione `Ctrl+Enter`

### Passo 3: Verificar

1. Vá em **Table Editor** no Supabase
2. Você deve ver a tabela `configuracoes_empresa`
3. Deve haver 1 registro com os dados padrão

## Migration Simplificada

A migration `004_create_configuracoes_empresa_simple.sql` é uma versão simplificada que:
- ✅ Cria a tabela `configuracoes_empresa`
- ✅ Insere um registro padrão
- ✅ Não depende de triggers complexos
- ✅ Funciona mesmo se a função `update_updated_at_column()` não existir

## Após Executar

Após executar a migration:
1. A página de Configurações deve carregar normalmente
2. Você poderá editar e salvar as informações da empresa
3. Os dados aparecerão automaticamente nos contratos gerados

## Nota

Se você já executou a migration `004_create_configuracoes_empresa.sql` (versão completa), não precisa executar a versão simplificada. Ambas criam a mesma tabela.

