# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
COPY src ./src
COPY tsconfig.json .
RUN npm run build

# Stage 2: Runner
FROM node:22-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Fix permissions
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 3000

CMD ["node", "dist/server.js"]
