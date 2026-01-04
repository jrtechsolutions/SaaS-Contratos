# 📋 Como Criar as Tabelas no Supabase

## ⚠️ IMPORTANTE: As tabelas precisam ser criadas manualmente no SQL Editor do Supabase

## Passo a Passo:

### 1. Acesse o SQL Editor do Supabase

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor** (ou acesse diretamente: https://supabase.com/dashboard/project/_/sql)

### 2. Copie o Script de Criação de Tabelas

1. Abra o arquivo: `backend/src/migrations/001_create_tables.sql`
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)

### 3. Cole e Execute no SQL Editor

1. No SQL Editor do Supabase, **cole** o conteúdo copiado (Ctrl+V)
2. Clique no botão **Run** (ou pressione `Ctrl+Enter`)
3. Aguarde a mensagem de sucesso: "Success. No rows returned"

### 4. Verificar se Funcionou

1. No menu lateral do Supabase, clique em **Table Editor**
2. Você deve ver 4 tabelas criadas:
   - ✅ `users`
   - ✅ `modelos_contrato`
   - ✅ `propostas`
   - ✅ `contratos`

### 5. (Opcional) Inserir Dados Padrão

1. Abra o arquivo: `backend/src/migrations/002_insert_default_data.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor e execute
4. Isso criará um modelo de contrato padrão

### 6. Verificar Novamente

Execute no terminal:

```bash
npm run check-connection
```

Agora deve aparecer: ✅ **Conexão estabelecida com sucesso!**

---

## 🔍 Se Ainda Der Erro

### Erro: "relation already exists"
- Significa que algumas tabelas já existem
- Isso é normal, o script usa `CREATE TABLE IF NOT EXISTS`
- Pode continuar normalmente

### Erro: "permission denied"
- Verifique se está usando a **service_role** key no `.env`
- Não use a **anon** key para operações administrativas

### Erro: "syntax error"
- Verifique se copiou o arquivo completo
- Não copie apenas parte do arquivo
- Certifique-se de que não há caracteres extras

---

## 📝 Conteúdo do Arquivo SQL

O arquivo `001_create_tables.sql` contém:
- Criação de 4 tabelas principais
- Índices para performance
- Triggers para atualizar `updated_at` automaticamente
- Constraints e validações

**Tamanho aproximado:** ~90 linhas

---

## ✅ Depois de Criar as Tabelas

Execute para criar o primeiro usuário admin:

```bash
npm run create-admin admin@example.com senha123 "Administrador"
```

