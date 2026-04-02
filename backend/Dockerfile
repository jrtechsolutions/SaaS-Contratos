# =============================================================================
# Estágio 1 — builder: dependências + cópia src → dist/
# =============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Apenas manifests primeiro — melhora cache do Docker quando o código muda
COPY package.json package-lock.json* ./

RUN npm ci

COPY scripts ./scripts
COPY src ./src

RUN npm run build && npm prune --omit=dev

# =============================================================================
# Estágio 2 — produção: só runtime
# =============================================================================
FROM node:18-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Manifest necessário para npm run start; deps já podadas no builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

# PORT padrão alinhado ao .env do projeto (sobrescrevível em runtime)
EXPOSE 3001

# Produção: npm run start → node dist/server.js
CMD ["npm", "run", "start"]
