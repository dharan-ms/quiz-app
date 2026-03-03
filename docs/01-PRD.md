# 1) Product Requirements Document (PRD)

## Product Name
**QuizForge** — full-stack quiz platform for learning teams and self-learners.

## Goal & Target Users

### Goal
Deliver a secure, responsive, production-ready quiz system where users can discover quizzes, attempt them under a timer, review results with explanations, and compete on leaderboards while admins manage all quiz content.

### Target Users
- **Students/Learners**: practice and track improvements.
- **Instructors/Content teams**: publish and maintain quiz banks.
- **Operations/Admins**: monitor usage and quality via analytics.

## User Roles
- **Guest**
  - Browse landing page, quiz catalog, quiz details, leaderboard.
  - Cannot start attempts.
- **User**
  - Register/login/logout.
  - Start/resume/submit attempts.
  - View results and profile history.
- **Admin**
  - Full user capabilities.
  - Create/update/delete quizzes and questions.
  - View analytics.

## Core User Journeys

1. **Signup/Login**
   - User creates account or signs in.
   - Backend creates server session via secure httpOnly cookie.

2. **Browse Quizzes**
   - User filters by search/difficulty.
   - User opens quiz details and sees metadata + top leaderboard.

3. **Attempt Quiz**
   - User starts attempt.
   - System creates or resumes in-progress attempt.
   - Timer counts down for whole quiz.
   - User answers MCQ/TrueFalse/FillBlank.

4. **Submit + Results**
   - User submits (or auto-submits on expiry).
   - Backend scores, stores answer correctness, updates leaderboard.
   - User sees detailed review with explanations.

5. **Leaderboard**
   - Users view global ranking entries and per-quiz ranking in quiz details.

6. **Profile + History**
   - User sees past attempts and opens detailed result views.

7. **Admin Content Management**
   - Admin creates quiz metadata.
   - Admin adds/updates/deletes questions.
   - Admin publishes or soft-deletes quiz.

## Functional Scope

### MVP
- Session auth (register/login/logout/me).
- Quiz catalog + filtering.
- Attempt start/save/submit flow.
- Auto-scoring with explanations.
- Attempt history.
- Admin CRUD for quizzes/questions.

### Advanced (implemented foundation + partial)
- Shuffle questions/options.
- Quiz availability windows.
- Password reset token flow.
- Rate limiting.
- Tab-switch detection logging for anti-cheat analytics.
- Global leaderboard.

## Non-Functional Requirements

### Security (OWASP Basics)
- Password hashing via bcrypt.
- Session cookie set to `httpOnly`, `sameSite`, secure in production.
- Helmet headers + CORS allow-list.
- Rate limit on auth/global routes.
- Input validation (Zod) and centralized error handling.
- Role-based route guards.

### Performance
- Pagination for list endpoints.
- Indexed DB fields for filters and ranking.
- Lightweight payloads for catalog endpoints.

### Accessibility
- Semantic labels/ARIA for dialog/timer.
- Keyboard-accessible forms and navigation controls.
- Color + text pairing for status indicators.

### Responsive UI
- Mobile-first Tailwind layout.
- Breakpoint-aware cards/tables/forms.

### Reliability
- Global error middleware.
- Consistent API response envelope.
- Loading skeletons + actionable error states in UI.

## Success Metrics
- **Activation**: % registered users attempting at least 1 quiz.
- **Completion rate**: submitted attempts / started attempts.
- **Retention**: D7 returning active users.
- **Content velocity**: quizzes/questions created per admin weekly.
- **Quality**: API error rate and client crash-free sessions.
- **Engagement**: average attempts per active user.
