# Configuração de Variáveis de Ambiente

## Arquivo .env

Crie um arquivo `.env` na raiz do projeto `frontend/` com o seguinte conteúdo:

### Desenvolvimento Local:
```env
VITE_API_URL=http://localhost:3001/api
```

### Produção (Netlify):
```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

## Como Funciona

O Vite usa o prefixo `VITE_` para expor variáveis de ambiente ao código do frontend.

A variável `VITE_API_URL` é usada em `src/lib/api.ts` para configurar a URL base da API.

## Configuração no Netlify

1. Acesse: **Site settings > Environment variables**
2. Adicione a variável:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://seu-backend.onrender.com/api`

## Teste Local

1. Crie o arquivo `.env` na pasta `frontend/`
2. Adicione: `VITE_API_URL=http://localhost:3001/api`
3. Reinicie o servidor: `npm run dev`

## Importante

- ⚠️ **Nunca commite o arquivo `.env`** (já está no .gitignore)
- ✅ O arquivo `.env.example` pode ser commitado como referência
- 🔄 Após alterar `.env`, reinicie o servidor de desenvolvimento

