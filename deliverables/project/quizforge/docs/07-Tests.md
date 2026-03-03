# 7) Tests

## Test Strategy

### Backend Unit Tests
- `utils/scoring.ts` correctness (MCQ + FillBlank normalization).
- `services/attempt.service.ts` timer expiry helper.

### Backend Integration Tests (Jest + Supertest)
Covered required scenarios:
1. **login invalid password** → `401`.
2. **start quiz unauthorized** → `401`.
3. **submit attempt twice** → `409`.
4. **admin route blocked for user role** → `403`.

### Frontend Component Test (optional)
- `Button` rendering + click handler.

## Executed Commands
- `npm run test --workspace @quiz/api`
- `npm run test --workspace @quiz/web`
- `npm run test` (root)

## Test Files
- `apps/api/tests/unit/scoring.service.test.ts`
- `apps/api/tests/unit/attempt.service.test.ts`
- `apps/api/tests/integration/api.integration.test.ts`
- `apps/web/src/components/ui/Button.test.tsx`

## Additional Recommended Tests (next iteration)
- E2E timer expiry auto-submit in browser (Playwright).
- Attempt resume persistence after browser reload.
- Admin question update edge-cases for all question types.
