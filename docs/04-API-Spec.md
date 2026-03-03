# 4) API Spec with Examples

Base URL: `{{API_URL}}/api/v1`

## Response Envelope
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

## Auth & Session
- Auth type: **server session + httpOnly cookie** (`qid`)
- Frontend must call with credentials:
  - Axios: `withCredentials: true`

## Validation & Status Codes
- `200` success
- `201` created
- `400` validation error
- `401` unauthorized
- `403` forbidden
- `404` not found
- `409` conflict (e.g., double submission)
- `429` rate limited

## Pagination & Filtering
- Query params:
  - `page` (default 1)
  - `limit` (default 10, max 100)
- Quiz filters:
  - `search`, `difficulty`, `category`

---

## Auth Routes

### POST `/auth/register`
Req:
```json
{ "name": "A User", "email": "user@example.com", "password": "StrongPass1" }
```
Res `201`:
```json
{ "success": true, "message": "Registered successfully", "data": { "user": { "id": "u1", "role": "USER" } } }
```

### POST `/auth/login`
Req:
```json
{ "email": "user@example.com", "password": "StrongPass1" }
```
Res `200`: sets session cookie.

### POST `/auth/logout`
- Auth required.
- Destroys current session.

### GET `/auth/me`
- Auth required.
- Returns current user profile.

### POST `/auth/forgot-password`
Req:
```json
{ "email": "user@example.com" }
```
Res:
```json
{ "success": true, "message": "Password reset token generated", "data": { "resetToken": "..." } }
```

### POST `/auth/reset-password`
Req:
```json
{ "token": "raw-token", "password": "NewStrongPass1" }
```

---

## User Quiz Flow

### GET `/quizzes?search=&difficulty=&category=&page=1&limit=20`
Public route for published + available quizzes.

### GET `/quizzes/:id`
Public details with question previews + per-quiz leaderboard.

### POST `/quizzes/:id/start`
- Auth required.
- Creates or resumes in-progress attempt.
- Returns attempt + questions + timer info.

### GET `/attempts/:id`
- Auth required (owner/admin).
- Fetches attempt state for resume UI.

### POST `/attempts/:id/answer`
- Auth required.
- Req (MCQ/TF):
```json
{ "questionId": "q1", "selectedChoiceId": "c2", "tabSwitchDelta": 1 }
```
- Req (FillBlank):
```json
{ "questionId": "q2", "textAnswer": "jwt" }
```

### POST `/attempts/:id/submit`
- Auth required.
- Prevents double submit.
- Req:
```json
{ "autoSubmit": false }
```

### GET `/attempts/:id/result`
- Auth required (owner/admin).
- Returns summary and per-question review.

### GET `/users/me/attempts?page=1&limit=50`
- Auth required.
- Returns user attempt history.

### GET `/quizzes/leaderboard`
- Public global leaderboard.

---

## Admin Routes (RBAC: ADMIN only)

### GET `/admin/quizzes`
List all quizzes for management.

### GET `/admin/quizzes/:id`
Quiz detail including full question payload.

### POST `/admin/quizzes`
Create quiz.

### PUT `/admin/quizzes/:id`
Update quiz metadata/publication/schedule.

### DELETE `/admin/quizzes/:id`
Soft-delete quiz.

### POST `/admin/quizzes/:id/questions`
Create question under quiz.

### PUT `/admin/questions/:id`
Update question and choices.

### DELETE `/admin/questions/:id`
Delete question.

### GET `/admin/analytics`
Stats: users/quizzes/attempts/completion rate/recent attempts.

---

## Security Controls
- bcrypt password hashing
- Session cookies (`httpOnly`, `sameSite`, `secure` in prod)
- Helmet security headers
- CORS allow-list from env
- Global + auth-specific rate limiting
- Zod input validation
- RBAC middleware for admin APIs

## Interactive API Docs
- Swagger UI: `/api-docs`
- OpenAPI file: `apps/api/docs/openapi.yaml`
