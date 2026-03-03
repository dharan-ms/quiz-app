# Deliverables Folder

## 1) Project Folder
- Path: `deliverables/project/quizforge/`
- This is a clean repository snapshot (no `.git`, no `node_modules`, no build cache).

## 2) UI Screenshots
- Path: `deliverables/ui-screenshots/`
- Captured pages:
  - `01-home.png`
  - `02-login.png`
  - `03-register.png`
  - `04-quizzes.png`
  - `05-leaderboard.png`
  - `06-admin.png`
  - `07-forgot-password.png`
  - `08-quiz-details.png`

## 3) Run Website Locally
From project root:

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run db:push
npm run db:seed
npm run dev
```

Open:
- Frontend: `http://localhost:3000`
- API: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api-docs`
