# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and tsconfig
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy built files and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

# Run Prisma migrations then start server
CMD npx prisma migrate deploy && node dist/index.js
