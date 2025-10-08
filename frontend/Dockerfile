# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all code
COPY . .

# Build Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json and install only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Copy environment variables if needed
# COPY .env .env.production

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["npm", "run", "start"]
