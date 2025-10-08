# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json, tsconfig, Prisma schema
COPY package*.json tsconfig.json ./  
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy all source code
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy build artifacts and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose backend port
EXPOSE 3001

# Set environment variables (optional)
# ENV NODE_ENV=production

# Start server (consider waiting for DB)
CMD ["node", "dist/index.js"]
