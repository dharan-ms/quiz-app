# 6) Frontend Code (all files with filenames)

## Frontend Root
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/eslint.config.mjs`
- `apps/web/jest.config.cjs`
- `apps/web/jest.setup.ts`
- `apps/web/.env.example`
- `apps/web/Dockerfile`
- `apps/web/.dockerignore`

## App Router Pages
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/globals.css`

### Auth
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/register/page.tsx`
- `apps/web/src/app/(auth)/forgot-password/page.tsx`

### User
- `apps/web/src/app/quizzes/page.tsx`
- `apps/web/src/app/quizzes/[id]/page.tsx`
- `apps/web/src/app/attempts/[id]/page.tsx`
- `apps/web/src/app/attempts/[id]/result/page.tsx`
- `apps/web/src/app/profile/page.tsx`
- `apps/web/src/app/leaderboard/page.tsx`

### Admin
- `apps/web/src/app/admin/page.tsx`
- `apps/web/src/app/admin/quizzes/new/page.tsx`
- `apps/web/src/app/admin/quizzes/[id]/page.tsx`

## Components

### Layout
- `apps/web/src/components/layout/AuthBootstrap.tsx`
- `apps/web/src/components/layout/Navbar.tsx`
- `apps/web/src/components/layout/ProtectedPage.tsx`

### UI
- `apps/web/src/components/ui/Button.tsx`
- `apps/web/src/components/ui/Input.tsx`
- `apps/web/src/components/ui/Card.tsx`
- `apps/web/src/components/ui/Modal.tsx`
- `apps/web/src/components/ui/Skeleton.tsx`

### Quiz
- `apps/web/src/components/quiz/QuizFilters.tsx`
- `apps/web/src/components/quiz/QuizTimer.tsx`
- `apps/web/src/components/quiz/QuestionCard.tsx`

### Admin
- `apps/web/src/components/admin/QuizForm.tsx`
- `apps/web/src/components/admin/QuestionForm.tsx`

## Hooks / State / Lib
- `apps/web/src/hooks/useAuthBootstrap.ts`
- `apps/web/src/hooks/useRequireAuth.ts`
- `apps/web/src/store/auth-store.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/constants.ts`
- `apps/web/src/lib/utils.ts`
- `apps/web/src/types/index.ts`

## Frontend Test
- `apps/web/src/components/ui/Button.test.tsx`

## Auth Storage Choice
- LocalStorage token approach:
  - ✅ Simple to implement.
  - ❌ Vulnerable to token theft on XSS.
- httpOnly cookie session approach (implemented):
  - ✅ Not readable by JavaScript, lower XSS token-theft risk.
  - ✅ Server-side invalidation on logout/session destroy.
  - ❌ Requires CORS + cookie config care.
- Frontend stores only non-sensitive user profile in memory (`zustand`) and rehydrates via `/auth/me`.
