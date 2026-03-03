# 8) Deployment + Docker

## Local Development (without Docker)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env files:
   - `cp apps/api/.env.example apps/api/.env`
   - `cp apps/web/.env.example apps/web/.env`
3. Start PostgreSQL (local or cloud), then run:
   ```bash
   npm run db:push
   npm run db:seed
   npm run dev
   ```

## Local Development (Docker Compose)
```bash
docker compose up --build
```
Services:
- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- DB: `localhost:5432`

## Production Deployment (Vercel + Railway)

### Backend (Railway)
1. Create new Railway project from `apps/api`.
2. Add PostgreSQL plugin.
3. Set env vars from `apps/api/.env.example`.
4. Build command:
   ```bash
   npm install && npm run prisma:generate
   ```
5. Start command:
   ```bash
   npm run db:push && npm run db:seed && npm run start
   ```
6. Configure custom domain (e.g., `api.quizforge.app`).

### Frontend (Vercel)
1. Import `apps/web` as project root.
2. Set env var:
   - `NEXT_PUBLIC_API_URL=https://api.quizforge.app/api/v1`
3. Deploy and map domain `quizforge.app`.

### CORS + Cookies
- Set backend `CLIENT_ORIGIN=https://quizforge.app`.
- Keep session cookie as:
  - `httpOnly: true`
  - `secure: true` in production
  - `sameSite: none` for cross-domain frontend/backend.

## HTTPS
- Use managed certificates from Railway + Vercel.
- Enforce HTTPS-only cookies in production.

## Monitoring / Logs
- Railway runtime logs for API.
- Vercel function and edge logs for frontend.
- Add Sentry/Datadog in next iteration for alerts and traces.

## Scaling Notes
- Scale API horizontally behind load balancer.
- Move session store from memory to PostgreSQL (already configured).
- Add Redis cache for hot quiz lists and leaderboard if traffic grows.
- Use read replicas for analytics-heavy workloads.

## Docker Files
- `docker-compose.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
