# 2) Architecture Diagram + Folder Structure

## High-Level Architecture

```text
┌───────────────────────────┐
│         Browser           │
│ Next.js App Router (UI)   │
└─────────────┬─────────────┘
              │ HTTPS (cookies, JSON)
              ▼
┌───────────────────────────┐
│     Quiz API (Express)    │
│  /api/v1 + Session Auth   │
│  RBAC + Validation + RL   │
└───────┬──────────┬────────┘
        │          │
        │          └───────────────┐
        ▼                          ▼
┌─────────────────────┐     ┌─────────────────────┐
│ PostgreSQL Database │     │  Swagger / API Docs │
│ Prisma ORM          │     │  /api-docs          │
└─────────────────────┘     └─────────────────────┘
```

## Auth Flow (Session-Based)
1. `POST /auth/login` validates credentials.
2. API sets `qid` httpOnly session cookie.
3. Frontend sends cookie with `withCredentials: true`.
4. `GET /auth/me` hydrates user state.
5. RBAC middleware checks `req.session.role` for admin routes.

## Deployment Topology (Selected Hosting)
- **Frontend**: Vercel (Next.js app).
- **Backend API**: Railway service (Node/Express).
- **Database**: Railway PostgreSQL.
- **Domain setup**:
  - `https://quizforge.app` → frontend
  - `https://api.quizforge.app` → backend
- **CORS**: backend allows frontend origin.

## File Storage Strategy (Question Images)
- Current schema supports `Question.imageUrl`.
- Recommended production pattern:
  - Upload images to object storage (S3/R2/Cloudinary).
  - Save only URL in DB (`imageUrl`).
  - Serve via CDN for low-latency delivery.

## API Versioning Strategy
- Base path: `/api/v1`.
- Future versions: `/api/v2` while preserving backward compatibility.
- Breaking changes introduced only in new version path.

## Logging Strategy
- Request logs via `morgan`.
- Structured app logs via `logger` utility.
- Error middleware logs path/method/error payload.
- In production, route logs should be shipped to a centralized sink (Railway logs + APM).

## Error Handling Strategy
- Throw `ApiError(statusCode, message, details)` from controllers/services.
- Use global `errorMiddleware` to normalize all failures:
  - Validation errors → `400`.
  - Auth errors → `401/403`.
  - Conflict/state errors → `409`.
  - Unknown errors → `500`.
- Consistent JSON envelope:
  - `{ success: false, message, data? }`

## Environment Variables

### Backend (`apps/api/.env`)
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `SESSION_SECRET`
- `CLIENT_ORIGIN`
- `API_BASE_PATH`
- `BCRYPT_ROUNDS`
- `RATE_LIMIT_WINDOW_MINUTES`
- `RATE_LIMIT_MAX_REQUESTS`
- `AUTH_RATE_LIMIT_MAX_REQUESTS`

### Frontend (`apps/web/.env`)
- `NEXT_PUBLIC_API_URL`

## Folder Structure

```text
workspace/
├─ apps/
│  ├─ api/
│  │  ├─ src/
│  │  │  ├─ config/
│  │  │  ├─ controllers/
│  │  │  ├─ middleware/
│  │  │  ├─ routes/v1/
│  │  │  ├─ services/
│  │  │  ├─ utils/
│  │  │  ├─ validators/
│  │  │  └─ types/
│  │  ├─ prisma/
│  │  ├─ tests/
│  │  └─ docs/openapi.yaml
│  └─ web/
│     ├─ src/app/
│     ├─ src/components/
│     ├─ src/hooks/
│     ├─ src/lib/
│     ├─ src/store/
│     └─ src/types/
├─ docs/
├─ docker-compose.yml
└─ README.md
```
