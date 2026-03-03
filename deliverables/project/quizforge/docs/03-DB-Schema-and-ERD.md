# 3) DB Schema (PostgreSQL) + ERD Text

## ERD Description

### Core Entities
- **User** (1) ──< **Attempt** (many)
- **User** (1) ──< **Quiz** (many, as creator/admin)
- **Quiz** (1) ──< **Question** (many)
- **Question** (1) ──< **Choice** (many for MCQ/TrueFalse)
- **Attempt** (1) ──< **AttemptAnswer** (many)
- **Question** (1) ──< **AttemptAnswer** (many)
- **Quiz** (many) ──< **QuizCategory** >── (many) **Category**
- **Quiz + User** unique pair in **LeaderboardEntry**
- **User** (1) ──< **PasswordResetToken** (many)
- **Admin(User)** (1) ──< **AuditLog** (many)

### Soft Delete
- `Quiz.deletedAt` and `User.deletedAt` support soft-delete behavior.

## Tables & Important Fields

### users
- `id`, `email (unique)`, `passwordHash`, `name`, `role`, `isActive`, `emailVerified`
- timestamps: `createdAt`, `updatedAt`, optional `deletedAt`

### quizzes
- `id`, `title`, `description`, `instructions`
- `difficulty`, `totalMarks`, `durationSeconds`
- `published`, `shuffleQuestions`, `shuffleOptions`
- scheduling: `availableFrom`, `availableTo`
- FK: `createdById -> users.id`
- timestamps + soft delete

### questions
- `id`, `quizId`, `type`, `text`, `explanation`
- scoring: `points`, `negativeMarks`
- order/media: `order`, `imageUrl`
- fill-blank answers: `acceptedAnswers[]`

### choices
- `id`, `questionId`, `text`, `isCorrect`, `order`

### attempts
- `id`, `userId`, `quizId`, `status`
- `startedAt`, `submittedAt`
- scoring summary: `totalScore`, `maxScore`, `percentage`
- anti-cheat/time: `timeSpentSeconds`, `tabSwitchCount`
- randomization snapshots: `questionOrder[]`, `choiceOrder(JSONB)`

### attempt_answers
- unique (`attemptId`, `questionId`)
- `selectedChoiceId` or `textAnswer`
- `isCorrect`, `awardedScore`, `answeredAt`

### categories + quiz_categories
- category taxonomy and many-to-many quiz mapping

### leaderboard_entries
- unique (`quizId`, `userId`)
- stores best attempt summary for fast leaderboard reads

### password_reset_tokens
- hashed token + expiry + used flag (`usedAt`)

### audit_logs
- admin action traces (`action`, `entity`, `entityId`, metadata JSON)

## Indexes & Constraints (Highlights)
- Unique: `users.email`, `categories.slug`, `leaderboard_entries(quizId,userId)`, `attempt_answers(attemptId,questionId)`
- Query indexes:
  - quizzes: `(published, availableFrom, availableTo)`, `(difficulty)`
  - questions: `(quizId, order)`
  - attempts: `(userId, createdAt DESC)`, `(quizId, status)`
  - leaderboard: `(quizId, bestScore DESC, bestTimeSeconds)`

## Full SQL Schema
- Generated from Prisma datamodel:
  - **`docs/sql-schema.sql`**

## Prisma Source of Truth
- **`apps/api/prisma/schema.prisma`**
