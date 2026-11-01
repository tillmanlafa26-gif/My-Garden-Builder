# My Garden Builder — Production Deployment

## 1. Merge the release candidate
Copy these items into the existing Vite project root:

- `src/` — replace the current source folder
- `public/` — merge/replace the provided PWA files
- `index.html` — replace the current Vite index file
- `vercel.json` — keep only if deploying to Vercel
- `.env.example` — reference only; do not rename over an existing `.env`

Keep the existing `package.json`, `package-lock.json`, and Vite configuration unless you intentionally need to change them.

## 2. Verify environment variables
The existing local `.env` should contain:

```text
VITE_PERENUAL_API_KEY=YOUR_REAL_KEY
```

Do not commit the real `.env` file.

## 3. Production build
From the project root:

```bash
npm install
npm run build
```

The build should create `dist/`.

## 4. Test the production build locally

```bash
npm run preview
```

Use the preview URL rather than the Vite development URL for PWA testing. The service worker intentionally registers only in production mode.

Test:
- page reloads on `/garden`, `/plants`, `/calendar`, `/journal`, `/privacy`, `/terms`
- Settings → Install App
- offline reload after first successful production load
- weather/API fallback behavior
- dark mode persistence
- reset behavior

## 5. Vercel
The included `vercel.json` provides the SPA fallback needed for BrowserRouter routes.

Set `VITE_PERENUAL_API_KEY` in the Vercel project environment variables before the production build.

## 6. Netlify / Cloudflare Pages
The included `public/_redirects` is copied into `dist` by Vite and provides:

```text
/* /index.html 200
```

Use build command:

```text
npm run build
```

Publish directory:

```text
dist
```

Set `VITE_PERENUAL_API_KEY` in the host's build environment.

## 7. HTTPS
PWA installation and service workers require HTTPS in production. Major deployment hosts provide HTTPS automatically.

## 8. After deployment
Open the production URL on a phone and desktop, complete the QA checklist, then install it to the device home screen.

## Optional Supabase cloud sync

Cloud sync is designed to fail safely. The app remains local-first when these variables are absent:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Before enabling the variables in production, apply the Supabase migrations in order:

1. `20261011_0001_initial_garden_schema.sql`
2. `20261101_0002_builder_data_layer.sql`
3. `20261101_0003_persistence_hardening.sql`

After adding `@supabase/supabase-js`, run `npm install` locally so `package-lock.json` is refreshed before the next dependency maintenance commit.

The Phase 3 migration adds one-active-garden enforcement, idempotent legacy-browser migration support, stronger garden ownership policies, and an atomic garden snapshot RPC.

