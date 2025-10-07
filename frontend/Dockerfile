# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all code
COPY . .

# Build Next.js app
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Install 'serve' to serve Next.js static build
RUN npm install -g serve

# Copy build output and package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./  

# Expose port
EXPOSE 3000

# Start Next.js app
CMD ["npx", "next", "start", "-p", "3000"]
