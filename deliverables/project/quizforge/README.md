# QuizForge (Full-Stack Quiz Platform)

Production-ready full-stack quiz application with:
- **Next.js frontend**
- **Express + Prisma backend**
- **PostgreSQL database**
- **Session auth (httpOnly cookies)**
- **Admin panel + analytics + quiz/question CRUD**
- **Timer-based attempts + auto-scoring + result review + leaderboard**

---

## Stack (chosen)
- **Framework**: Next.js frontend + Node/Express API
- **Database**: PostgreSQL
- **Auth**: Session-based auth
- **Hosting target**: Vercel (web) + Railway (API/DB)
- **Quiz Types**: MCQ + True/False + Fill Blank
- **Timer Mode**: Whole-quiz timer

---

## Monorepo Structure

```text
apps/
  api/   -> backend service
  web/   -> Next.js frontend
docs/    -> PRD, architecture, DB/API specs, deployment docs
```

---

## Quick Start

### 1) Install
```bash
npm install
```

### 2) Environment
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3) Database bootstrap
```bash
npm run db:push
npm run db:seed
```

### 4) Run
```bash
npm run dev
```

Apps:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api-docs`

---

## Seed Credentials
- **Admin**: `admin@quizapp.com` / `Admin@12345`
- **User**: `user@quizapp.com` / `User@12345`

---

## Scripts

### Root
- `npm run dev` — run API + web together
- `npm run build` — production build checks
- `npm run test` — backend + frontend tests
- `npm run db:push` — push Prisma schema
- `npm run db:seed` — seed sample data

### API (`apps/api`)
- `npm run dev`
- `npm run start`
- `npm run prisma:generate`
- `npm run db:push`
- `npm run db:seed`
- `npm test`

### Web (`apps/web`)
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm test`

---

## API Summary

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### User Quiz Flow
- `GET /quizzes`
- `GET /quizzes/:id`
- `POST /quizzes/:id/start`
- `GET /attempts/:id`
- `POST /attempts/:id/answer`
- `POST /attempts/:id/submit`
- `GET /attempts/:id/result`
- `GET /users/me/attempts`
- `GET /quizzes/leaderboard`

### Admin
- `GET /admin/quizzes`
- `GET /admin/quizzes/:id`
- `POST /admin/quizzes`
- `PUT /admin/quizzes/:id`
- `DELETE /admin/quizzes/:id`
- `POST /admin/quizzes/:id/questions`
- `PUT /admin/questions/:id`
- `DELETE /admin/questions/:id`
- `GET /admin/analytics`

---

## Security Notes
- Password hashing via bcrypt.
- Session cookies are `httpOnly`.
- Role-based admin route guards.
- Helmet + CORS allow-list.
- Input validation with Zod.
- Rate limiting for auth and global APIs.

---

## Docker

Use:
```bash
docker compose up --build
```

Key files:
- `docker-compose.yml`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

---

## Postman
- Collection file: `docs/postman_collection.json`
- Set variable `baseUrl` to `http://localhost:4000/api/v1`

---

## Troubleshooting

1. **401 after login from frontend**
   - Verify `CLIENT_ORIGIN` matches frontend origin exactly.
   - Ensure axios requests use `withCredentials: true`.

2. **Session cookie not set in production**
   - Confirm HTTPS and `sameSite=none`, `secure=true`.

3. **Prisma connection errors**
   - Check `DATABASE_URL` format and DB accessibility.
   - Re-run `npm run prisma:generate`.

4. **No quiz data**
   - Run `npm run db:seed`.

---

## Documentation Index (deliverables)
- `docs/01-PRD.md`
- `docs/02-Architecture-and-Folder-Structure.md`
- `docs/03-DB-Schema-and-ERD.md`
- `docs/04-API-Spec.md`
- `docs/05-Backend-Code-Files.md`
- `docs/06-Frontend-Code-Files.md`
- `docs/07-Tests.md`
- `docs/08-Deployment-and-Docker.md`
- `docs/sql-schema.sql`
