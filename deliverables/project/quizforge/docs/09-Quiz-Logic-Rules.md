# 9) Quiz Logic Rules

## Scoring Rules
- Each question has `points` and optional `negativeMarks`.
- Correct answer:
  - award `points`
- Wrong answer:
  - deduct `negativeMarks`
- Unanswered:
  - `0`
- Final score clamp:
  - `totalScore = max(0, rawScore)`

## Timer Behavior (Whole Quiz)
- Attempt stores `startedAt`.
- Remaining time: `durationSeconds - elapsed`.
- If time reaches zero:
  - backend auto-submits as `AUTO_SUBMITTED`.
  - frontend redirects to result page.

## Randomization
- At attempt creation:
  - question order saved in `Attempt.questionOrder[]`.
  - per-question choice order saved in `Attempt.choiceOrder` JSON.
- Resume uses saved order for consistency.

## Attempt State Machine
- `STARTED` → created attempt
- `IN_PROGRESS` → at least one answer saved
- `SUBMITTED` → manual submit
- `AUTO_SUBMITTED` → timer expiry submit

## Double Submission Prevention
- Backend submit service checks status.
- If already submitted, returns `409 Attempt already submitted`.

## Resume Behavior
- `/quizzes/:id/start` resumes active attempt if still valid.
- `/attempts/:id` returns persisted answers + timer state.

## Leaderboard Efficiency
- `LeaderboardEntry` table stores user’s best per quiz.
- On submission:
  - update only if better score
  - tie-breaker: lower completion time
- Fast reads via index:
  - `(quizId, bestScore DESC, bestTimeSeconds)`
