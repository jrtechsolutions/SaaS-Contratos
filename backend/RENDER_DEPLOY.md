# Configuração de Deploy no Render

## Configurações para o Render

### Root Directory
```
backend/
```

### Build Command
```
npm install
```
ou
```
npm ci
```

**Nota:** O backend Node.js não precisa de build, mas o Render precisa instalar as dependências. O comando `npm install` já faz isso automaticamente, mas você pode deixar explícito.

### Pre-Deploy Command (Opcional)
Deixe vazio ou use para executar migrations:
```
# Deixe vazio se as migrations forem executadas manualmente no Supabase
```

Se quiser executar migrations automaticamente (requer configuração adicional):
```
# Não recomendado - execute migrations manualmente no Supabase SQL Editor
```

### Start Command
```
npm start
```

**IMPORTANTE:** Use `npm start` (não `npm run dev`) para produção!

## Variáveis de Ambiente

Configure estas variáveis no Render:

1. **SUPABASE_URL** - URL do seu projeto Supabase
2. **SUPABASE_ANON_KEY** - Chave anônima do Supabase
3. **SUPABASE_SERVICE_ROLE_KEY** - Chave de service role do Supabase
4. **PORT** - Porta (geralmente 3001, mas o Render define automaticamente)
5. **NODE_ENV** - `production` (opcional, o código detecta automaticamente se estiver no Render)
6. **JWT_SECRET** - Uma string secreta para assinar tokens JWT
7. **FRONTEND_URL** - **OBRIGATÓRIO** - URL do seu frontend (ex: `https://contratosjrtech.netlify.app`)
   - Se for Netlify, o CORS aceitará automaticamente qualquer URL `.netlify.app`
8. **FRONTEND_ALLOWED_ORIGINS** (Opcional) - URLs adicionais separadas por vírgula (ex: `https://app1.netlify.app,https://app2.netlify.app`)

## Exemplo de Configuração Completa

```
Root Directory: backend/
Build Command: npm install
Pre-Deploy Command: (vazio)
Start Command: npm start
```

## Observações Importantes

1. **Migrations:** Execute as migrations SQL manualmente no Supabase SQL Editor antes do deploy
2. **Admin User:** Crie o usuário admin manualmente usando `npm run create-admin` localmente ou via script
3. **Environment Variables:** Configure todas as variáveis de ambiente no painel do Render
4. **Health Check:** O Render pode usar `/health` para verificar se a aplicação está rodando

## Health Check Path (Opcional)

Se o Render pedir um health check path, use:
```
/health
```

