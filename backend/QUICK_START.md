# ⚡ Início Rápido

## 1️⃣ Criar arquivo .env

Na pasta `backend/`, crie um arquivo chamado `.env` e copie o conteúdo de `.env.template`, depois preencha com suas credenciais do Supabase.

## 2️⃣ Verificar conexão

```bash
npm run check-connection
```

Este comando vai verificar se:
- ✅ As variáveis de ambiente estão configuradas
- ✅ A conexão com Supabase funciona
- ✅ As tabelas existem (ou informar que precisam ser criadas)

## 3️⃣ Criar tabelas no Supabase

**IMPORTANTE:** As tabelas precisam ser criadas manualmente no SQL Editor do Supabase.

1. Acesse: https://supabase.com/dashboard/project/_/sql
2. Abra o arquivo: `backend/src/migrations/001_create_tables.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **Run**

## 4️⃣ Criar usuário admin

```bash
npm run create-admin seu@email.com senha123 "Seu Nome"
```

## 5️⃣ Iniciar servidor

```bash
npm run dev
```

## ✅ Pronto!

Agora você pode fazer login no frontend com as credenciais criadas.

---

**Problemas?** Veja o arquivo `SETUP.md` para mais detalhes.

