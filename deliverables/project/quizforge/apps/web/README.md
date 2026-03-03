# QuizForge Web App

Next.js frontend for QuizForge.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run test`

## Env
Create `.env` from `.env.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## Notes
- Uses session cookies (`withCredentials`) for auth.
- Do not store auth tokens in localStorage.
