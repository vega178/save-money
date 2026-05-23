# Docker Local Development Environment

## Folder Structure

```
save-money/
├── docker-compose.yml          ← single entry point for the whole stack
├── .env                        ← active env vars (git-ignored)
├── .env.example                ← template to share with the team
├── docker/
│   └── mysql/
│       └── init/
│           └── 01_init.sql     ← runs once on first MySQL startup
├── backend/
│   └── save_money_nestjs/
│       ├── Dockerfile          ← multi-stage: development + production
│       └── .dockerignore
└── frontend/
    ├── Dockerfile              ← multi-stage: development + production
    ├── .dockerignore
    └── docker/
        └── nginx.conf          ← used by the production stage
```

---

## Quick Start (new machine)

Prerequisites: **Docker Desktop** installed and running.

```bash
# 1. Clone the repo
git clone <repo-url>
cd save-money

# 2. Create your local .env from the template
cp .env.example .env
# Edit .env and set real secrets if needed (defaults work out-of-the-box)

# 3. Start the whole stack
docker compose up
```

That's it. Three services start automatically:

| Service  | Local URL                    |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8080/api    |
| Swagger  | http://localhost:8080/api/docs (if enabled) |
| MySQL    | localhost:**3307** (to avoid conflicts with a local MySQL on 3306) |

---

## Common Commands

```bash
# Start everything (build images on first run)
docker compose up

# Start in the background (detached)
docker compose up -d

# Force rebuild images (after dependency changes)
docker compose up --build

# Rebuild a single service
docker compose up --build backend

# Stop containers (keep volumes)
docker compose down

# Stop containers AND delete the MySQL data volume (full reset)
docker compose down -v

# Tail logs for all services
docker compose logs -f

# Tail logs for a single service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql

# Open a shell inside a running container
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec mysql mysql -u appuser -p db_save_money
```

---

## Hot Reload

Both the backend and frontend run in **development** mode with hot reload.

- **Backend**: NestJS watches `/app/src` via `nest start --watch`. The host
  directory `./backend/save_money_nestjs/src` is bind-mounted into the container,
  so any file save triggers an instant restart.

- **Frontend**: Create React App watches `/app/src` and `/app/public`. The
  `CHOKIDAR_USEPOLLING=true` and `WATCHPACK_POLLING=true` env vars ensure file
  changes are detected correctly on macOS bind mounts.

> **Note**: `node_modules` is intentionally NOT mounted from the host. It lives
> only inside the container image. After adding/removing npm packages you must
> rebuild the affected image: `docker compose up --build backend`.

---

## Environment Variables

All variables are in the root `.env` file. Key values:

| Variable | Description |
|---|---|
| `MYSQL_ROOT_PASSWORD` | MySQL root password |
| `MYSQL_USER` / `MYSQL_PASSWORD` | App user credentials |
| `JWT_SECRET` | Must be a long random string in any real environment |
| `REACT_APP_API_URL` | Set to `http://localhost:8080/api` for local dev |

> `DB_HOST` is automatically overridden inside `docker-compose.yml` to `mysql`
> (the Docker service name) so the backend can reach the database container.
> The value in `.env` (`localhost`) is used only when running **outside** Docker.

---

## Production Build

The Dockerfiles contain a multi-stage `production` target. To build production
images locally:

```bash
# Backend production image
docker build \
  --target production \
  -t save-money-backend:prod \
  ./backend/save_money_nestjs

# Frontend production image (pass the API URL at build time)
docker build \
  --target production \
  --build-arg REACT_APP_API_URL=https://your-api.example.com/api \
  -t save-money-frontend:prod \
  ./frontend
```

---

## Persistent Storage

| Volume | Purpose |
|---|---|
| `mysql_data` | MySQL table data – survives `docker compose down` |
| `backend_uploads` | Uploaded bill/birthday files |

Run `docker compose down -v` to wipe all volumes (useful for a clean reset).

---

## Security Notes

- Change `JWT_SECRET` to a cryptographically random value before any deployment.
- Never commit `.env` to git (it is in `.gitignore`).
- In production, set `NODE_ENV=production` and disable TypeORM `synchronize`.
- The MySQL port is exposed as `3307` on the host only; containers talk
  internally on `3306` over the private `app_network`.
