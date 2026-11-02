# My Garden Builder backend

This folder is the server-side layer for My Garden Builder.

## Architecture

- `backend/handlers/` contains the real API request handlers.
- `api/` contains thin Vercel entry points that import those handlers.
- `backend/devServer.js` runs the same handlers locally on port 8787.
- `src/` remains the React/Vite frontend.
- `supabase/` contains the PostgreSQL schema and migrations for the hosted database.

The production backend is deployed as Vercel Functions. The database/auth backend is Supabase. This avoids maintaining a separate always-on Express server while still keeping server-only secrets out of the browser.

## Local development

After installing packages:

```powershell
npm install
npm run dev
```

`npm run dev` starts:

- backend: `http://127.0.0.1:8787`
- Vite frontend: normally `http://localhost:5173`

Vite proxies `/api/*` to the local backend, so the frontend uses the same API paths locally and in production.

You can also run each side separately:

```powershell
npm run dev:api
npm run dev:web
```

## Server-only environment variables

Never prefix private server keys with `VITE_`.

```text
OPENAI_API_KEY
OPENAI_GARDEN_MODEL
OPENAI_GARDEN_VISION_MODEL
PERENUAL_API_KEY
PERENUAL_API_BASE_URL
BACKEND_PORT
```

## Public browser configuration

These values are intentionally available to the React app:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Supabase Row Level Security is what protects user data. Never expose a Supabase service-role or secret key to the browser.

## Database

Database migrations live in:

```text
supabase/migrations/
```

Apply them in timestamp order to the linked Supabase project. The `supabase/config.toml` file makes the repository a valid Supabase CLI project.
