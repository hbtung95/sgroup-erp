FROM node:22-alpine AS builder

WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including dev dependencies for building
RUN npm ci

# Generate Prisma Client (multi-file schema from prisma/schema/)
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the NestJS application (clean build)
RUN rm -rf dist tsconfig.build.tsbuildinfo && npm run build

# ---

FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema directory (multi-file) and generate client in production
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -qO- http://localhost:3000/api || exit 1

# Run migrations then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
