# My Garden Builder — Development & Deployment

## Architecture

My Garden Builder is a full-stack Vite application.

- `src/` — React frontend
- `backend/` — server-side application code
- `api/` — thin Vercel Function entry points
- `supabase/` — database configuration and SQL migrations
- `public/` — PWA/service-worker assets

Production uses Vercel Functions for the Node backend and Supabase for authentication/PostgreSQL/storage.

## Local development

Install packages first:

```powershell
npm install
```

Then start the complete local application:

```powershell
npm run dev
```

That starts the local backend on port 8787 and the Vite frontend on port 5173. Vite proxies `/api/*` to the backend.

You can also run the two processes separately:

```powershell
npm run dev:api
npm run dev:web
```

Backend health check:

```text
http://127.0.0.1:8787/api/health
```

## Environment variables

Copy `.env.example` to `.env` for local development. Never commit the real `.env`.

Server-only values:

```text
OPENAI_API_KEY
OPENAI_GARDEN_MODEL
OPENAI_GARDEN_VISION_MODEL
PERENUAL_API_KEY
PERENUAL_API_BASE_URL
BACKEND_PORT
```

The Perenual key is intentionally server-only. Do not use `VITE_PERENUAL_API_KEY`.

Public Supabase browser configuration:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

`VITE_SUPABASE_ANON_KEY` remains supported as a backward-compatible fallback.

Never place a Supabase service-role or secret key in a `VITE_` variable.

## Supabase database

The repository is now initialized as a Supabase CLI project with `supabase/config.toml`.

Install the Supabase CLI as a project dependency when you are ready to work with the hosted database:

```powershell
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

Apply migrations in timestamp order:

1. `20261011_0001_initial_garden_schema.sql`
2. `20261101_0002_builder_data_layer.sql`
3. `20261101_0003_persistence_hardening.sql`

Preview first:

```powershell
npx supabase db push --dry-run
```

Then apply:

```powershell
npx supabase db push
```

## Production build

```powershell
npm install
npm run build
```

The build output is `dist/`.

## Vercel

Configure these server environment variables in Vercel:

```text
OPENAI_API_KEY
OPENAI_GARDEN_MODEL
OPENAI_GARDEN_VISION_MODEL
PERENUAL_API_KEY
```

When cloud sync is enabled, also configure:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

After changing Vercel environment variables, create a new deployment so the Vite build receives the public Supabase values.

## PWA testing

Use a production build or deployed URL when testing the service worker.

Verify:

- direct route reloads
- installability
- offline app shell
- local garden persistence
- `/api/health`
- AI assistant
- garden photo analysis
- plant library
- Supabase sign-in and cloud sync, when configured

API GET responses are deliberately excluded from the service-worker app cache. The plant library maintains its own runtime cache instead.
