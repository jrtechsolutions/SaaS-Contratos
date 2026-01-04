# Configuração de Deploy no Netlify

## Variáveis de Ambiente

Configure estas variáveis no painel do Netlify (Site settings > Environment variables):

### Obrigatórias:
```
# IMPORTANTE: A URL pode terminar com /api ou não - será adicionado automaticamente
VITE_API_URL=https://seu-backend.onrender.com/api
```

### Exemplo:
```
# Opção 1: Com /api no final
VITE_API_URL=https://saas-contratos.onrender.com/api

# Opção 2: Sem /api (será adicionado automaticamente)
VITE_API_URL=https://saas-contratos.onrender.com
```

## Build Settings

### Build command:
```
npm run build
```

### Publish directory:
```
dist
```

## Configuração de Rotas (SPA)

O projeto já inclui os arquivos necessários para funcionar como SPA no Netlify:

1. **`public/_redirects`** - Redireciona todas as rotas para `index.html`
2. **`netlify.toml`** - Configuração alternativa do Netlify

Esses arquivos garantem que rotas como `/cliente/proposta/:id` funcionem corretamente.

## Observações

1. **URL da API:** Certifique-se de que a URL do backend está correta e acessível
2. **CORS:** O backend precisa estar configurado para aceitar requisições do domínio do Netlify
3. **HTTPS:** O Netlify fornece HTTPS automaticamente, então use `https://` na URL da API

## Configuração no Backend (Render)

No backend, configure a variável de ambiente:

```
FRONTEND_URL=https://seu-app.netlify.app
```

Ou se tiver múltiplas URLs:

```
FRONTEND_URL=https://seu-app.netlify.app
FRONTEND_ALLOWED_ORIGINS=https://seu-app.netlify.app,https://seu-app-pr-123.netlify.app
```

## Teste Local

Para testar localmente com as variáveis de ambiente:

1. Crie um arquivo `.env` na pasta `frontend/`:
```
VITE_API_URL=http://localhost:3001/api
```

2. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

