# My Garden Builder — Code Audit

Audit date: 2026-11-01

## High-priority findings fixed

### 1. No maintainable backend folder
The project had working Vercel serverless functions under `api/`, but the full server logic lived directly in those deployment entry files.

**Change:** added `backend/` and moved the real AI handlers there. Root `api/` files are now thin Vercel entry points. Added a local Node backend server so the same handlers run during local development.

### 2. Perenual API key exposed to the browser
`src/services/plantApi.js` used `VITE_PERENUAL_API_KEY`. Every `VITE_` variable is browser-visible after a Vite build.

**Change:** plant search/details now call `/api/plants`. The backend reads private `PERENUAL_API_KEY`.

### 3. Frontend-only local development did not run API routes
`npm run dev` previously started only Vite, while AI routes depended on Vercel Functions.

**Change:** `npm run dev` now launches both `backend/devServer.js` and Vite. Vite proxies `/api/*` to the local backend.

### 4. Service worker could cache GET API responses
Same-origin GET requests were eligible for the app-shell cache.

**Change:** `/api/*` is excluded from service-worker caching. Application-specific runtime caches remain responsible for API fallback data.

### 5. `node_modules` was committed
The repository contained tracked dependency files even though `.gitignore` correctly ignored `node_modules`.

**Change:** tracked `node_modules` is removed from the repository.

### 6. Duplicate stale source tree
`scripts/src/` contained an old copy of the React application and could easily be mistaken for current source.

**Change:** removed `scripts/src/`.

### 7. Dependency lock was stale
`package.json` included Supabase while `package-lock.json` did not.

**Change:** the stale lockfile is removed in this audit. Run `npm install` once locally to generate a clean lockfile from the audited `package.json`, then commit that regenerated lockfile.

### 8. Supabase CLI project configuration missing
Migrations existed, but there was no `supabase/config.toml`.

**Change:** added a minimal safe CLI configuration. Hosted project linking still requires the user's actual Supabase project reference.

## Architecture after audit

```text
Browser / React
      |
      | /api/*
      v
Vercel Functions
      |
      +-- backend/handlers/gardenAssistant.js -> OpenAI
      +-- backend/handlers/gardenVision.js    -> OpenAI
      +-- backend/handlers/plants.js          -> Perenual
      +-- backend/handlers/health.js
      |
      +------------------------------+
                                     |
Browser Supabase client ------------> Supabase Auth/Postgres/Storage
              protected by Row Level Security
```

## Remaining work requiring external configuration

The source code is ready for these integrations, but code alone cannot create the user's hosted accounts or secret values.

1. Create/link the Supabase project.
2. Apply the three database migrations.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Add server-only `PERENUAL_API_KEY` to Vercel/local `.env`.
5. Confirm OpenAI server environment variables remain configured.
6. Regenerate and commit `package-lock.json` after a clean local `npm install`.

## Lower-priority technical debt

- `src/App.jsx`, `src/pages/Home.jsx`, and `src/index.css` are very large and should eventually be split into smaller domain modules.
- Automated unit/integration coverage is still limited; the persistence and calculation utilities are good candidates for tests.
- Public API endpoints should eventually receive platform-level abuse/rate controls before broad public launch.
- Cloud photo storage is prepared in Supabase, but the current local camera image flow still needs its final upload/signed-URL integration.
