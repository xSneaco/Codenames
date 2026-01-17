# ===========================================
# Build Stage
# ===========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===========================================
# Development Stage (for docker-compose dev mode)
# ===========================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for drizzle-kit)
RUN npm ci

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3001

# Start in development mode
CMD ["npm", "run", "start:dev"]

# ===========================================
# Production Stage
# ===========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies plus drizzle-kit and @nestjs/cli for migrations
RUN npm ci --only=production && \
    npm install drizzle-kit @nestjs/cli && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary config files and folders
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src/db ./src/db

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
