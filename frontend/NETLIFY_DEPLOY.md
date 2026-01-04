# Configuração de Deploy no Netlify

## Variáveis de Ambiente

Configure estas variáveis no painel do Netlify (Site settings > Environment variables):

### Obrigatórias:
```
VITE_API_URL=https://seu-backend.onrender.com/api
```

### Exemplo:
```
VITE_API_URL=https://saas-contratos-backend.onrender.com/api
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

