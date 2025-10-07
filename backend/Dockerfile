# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm install

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Accept environment variables from build/run
ARG PORT
ARG NODE_ENV
ARG ALLOWED_ORIGIN
ARG REDIS_HOST
ARG REDIS_PORT
ARG OTP_EXPIRY
ARG DATABASE_URL
ARG JWT_ACCESS_SECRET
ARG JWT_REFRESH_SECRET

ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV
ENV ALLOWED_ORIGIN=$ALLOWED_ORIGIN
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV OTP_EXPIRY=$OTP_EXPIRY
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

EXPOSE $PORT

CMD ["node", "dist/index.js"]
