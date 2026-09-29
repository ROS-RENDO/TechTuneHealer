# =========================================================================
# Multi-Stage Dockerfile for TechTune Healer Backend API Gateway
# =========================================================================

# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl python3 make g++

# Copy package descriptors
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies including devDependencies for TypeScript compilation
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and compile
COPY src ./src/
RUN npx tsc

# Stage 2: Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install runtime dependencies for MariaDB client and OpenSSL
RUN apk add --no-cache openssl dumb-init curl

# Create non-root system user for security
RUN addgroup -S techtune && adduser -S techtune -G techtune

# Copy package descriptors and install production-only dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy generated Prisma artifacts and compiled dist from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/dist ./dist

# Set ownership to non-root user
USER techtune

EXPOSE 5000

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
