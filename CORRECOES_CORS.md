# Correções de CORS e Variáveis de Ambiente

## Problemas Identificados e Corrigidos

### 1. URL da API sem `/api`
**Problema:** A URL estava sendo chamada como `https://saas-contratos.onrender.com/auth/login` em vez de `https://saas-contratos.onrender.com/api/auth/login`

**Solução:** 
- Criada função `getApiBaseUrl()` que garante que a URL sempre termine com `/api`
- A função aceita URLs com ou sem `/api` no final

### 2. CORS bloqueando requisições do Netlify
**Problema:** CORS estava bloqueando requisições de `https://contratosjrtech.netlify.app`

**Solução:**
- Melhorada a lógica de CORS para aceitar qualquer URL `.netlify.app` em produção
- Adicionado suporte para previews do Netlify (deploys de PR)
- Adicionados logs de debug para facilitar troubleshooting

## Configuração no Netlify

### Variável de Ambiente
Configure no Netlify (Site settings > Environment variables):

**Opção 1 (Recomendada):**
```
VITE_API_URL=https://saas-contratos.onrender.com/api
```

**Opção 2 (Também funciona):**
```
VITE_API_URL=https://saas-contratos.onrender.com
```
(A função adicionará `/api` automaticamente)

## Configuração no Render (Backend)

### Variáveis de Ambiente
```
FRONTEND_URL=https://contratosjrtech.netlify.app
NODE_ENV=production
```

### URLs Adicionais (Opcional)
Se tiver múltiplas URLs do Netlify:
```
FRONTEND_ALLOWED_ORIGINS=https://contratosjrtech.netlify.app,https://outra-url.netlify.app
```

## Verificação

1. **Frontend:** Verifique no console do navegador se aparece:
   ```
   🔧 API Base URL: https://saas-contratos.onrender.com/api
   ```

2. **Backend:** Verifique nos logs do Render se aparece:
   ```
   ✅ CORS: Aceitando origem Netlify: https://contratosjrtech.netlify.app
   ```

## Próximos Passos

1. Configure `VITE_API_URL` no Netlify
2. Configure `FRONTEND_URL` no Render
3. Faça um novo deploy em ambos
4. Teste o login novamente

