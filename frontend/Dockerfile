# ─────────────────────────────────────────────────────────────────────────────
# Frontend Dockerfile – React (Create React App)
#
# Stages:
#   deps         →  install ALL dependencies
#   development  →  CRA dev server with hot-reload (used by docker-compose)
#   build        →  create the production build
#   production   →  serve the static build with Nginx
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json* ./

# Use --legacy-peer-deps because some CRA packages have peer dep conflicts
RUN npm ci --legacy-peer-deps

# ── Stage 2: development (hot-reload) ────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

# Copy all project files (src/ and public/ are overridden by bind-mounts)
COPY . .

# Increase inotify watchers limit hint (actual limit set on the host)
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["npm", "start"]

# ── Stage 3: production build ─────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# REACT_APP_API_URL must be provided at build time for a static bundle
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# ── Stage 4: production – serve with Nginx ────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy the static build
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config that supports client-side routing (react-router)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
