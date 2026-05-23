# ─────────────────────────────────────────────────────────────────────────────
# Backend Dockerfile – NestJS
#
# Stages:
#   deps         →  install ALL dependencies (dev + prod)
#   development  →  dev server with hot-reload (used by docker-compose)
#   build        →  compile TypeScript to dist/
#   production   →  lean runtime image with only prod dependencies
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only manifests first to leverage layer caching
COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps

# ── Stage 2: development (hot-reload) ────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy project files (src is overridden by a bind-mount in docker-compose)
COPY . .

EXPOSE 8080
EXPOSE 9229

# Start NestJS in watch mode for hot-reload
CMD ["npm", "run", "start:dev"]

# ── Stage 3: build TypeScript ─────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ── Stage 4: production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled output
COPY --from=build /app/dist ./dist

# Create uploads directory (matches the NestJS file storage paths)
RUN mkdir -p uploads/bills uploads/birthdays

EXPOSE 8080

CMD ["node", "dist/main"]
