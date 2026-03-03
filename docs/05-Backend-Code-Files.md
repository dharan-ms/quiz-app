# 5) Backend Code (all files with filenames)

## Backend Root
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/jest.config.cjs`
- `apps/api/.env.example`
- `apps/api/Dockerfile`
- `apps/api/.dockerignore`

## Prisma + Data
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seed.ts`
- `docs/sql-schema.sql`

## API Documentation
- `apps/api/docs/openapi.yaml`

## Source Files

### Config
- `apps/api/src/config/env.ts`
- `apps/api/src/config/logger.ts`
- `apps/api/src/config/prisma.ts`
- `apps/api/src/config/swagger.ts`

### Middleware
- `apps/api/src/middleware/asyncHandler.ts`
- `apps/api/src/middleware/auth.middleware.ts`
- `apps/api/src/middleware/error.middleware.ts`
- `apps/api/src/middleware/notFound.middleware.ts`
- `apps/api/src/middleware/rateLimit.middleware.ts`
- `apps/api/src/middleware/rbac.middleware.ts`
- `apps/api/src/middleware/validate.middleware.ts`

### Validators
- `apps/api/src/validators/auth.validator.ts`
- `apps/api/src/validators/common.validator.ts`
- `apps/api/src/validators/quiz.validator.ts`
- `apps/api/src/validators/attempt.validator.ts`
- `apps/api/src/validators/admin.validator.ts`

### Controllers
- `apps/api/src/controllers/auth.controller.ts`
- `apps/api/src/controllers/quiz.controller.ts`
- `apps/api/src/controllers/attempt.controller.ts`
- `apps/api/src/controllers/admin.controller.ts`

### Services
- `apps/api/src/services/attempt.service.ts`

### Routes
- `apps/api/src/routes/v1/index.ts`
- `apps/api/src/routes/v1/auth.routes.ts`
- `apps/api/src/routes/v1/quiz.routes.ts`
- `apps/api/src/routes/v1/attempt.routes.ts`
- `apps/api/src/routes/v1/user.routes.ts`
- `apps/api/src/routes/v1/admin.routes.ts`

### Utilities / Types
- `apps/api/src/utils/apiError.ts`
- `apps/api/src/utils/pagination.ts`
- `apps/api/src/utils/password.ts`
- `apps/api/src/utils/response.ts`
- `apps/api/src/utils/scoring.ts`
- `apps/api/src/utils/token.ts`
- `apps/api/src/types/express.d.ts`

### Entry
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`

## Tests
- `apps/api/tests/setupEnv.ts`
- `apps/api/tests/unit/scoring.service.test.ts`
- `apps/api/tests/unit/attempt.service.test.ts`
- `apps/api/tests/integration/api.integration.test.ts`

> Full implementation code is present in the files above; no pseudocode placeholders are used.
