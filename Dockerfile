# =========================================================
# Stage 1: build - instala tudo (incl. devDependencies) e compila o TS
# =========================================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# =========================================================
# Stage 2: produção - só o necessário pra rodar
# =========================================================
FROM node:24-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["node", "dist/Server.js"]
