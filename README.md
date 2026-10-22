# CityQuest

CityQuest plans city leisure routes in Chișinău. The existing application includes place discovery and maps, route previews and generation, saved routes, favorites, route progress, profiles, achievements, community submissions, and moderation. The interface supports Russian, English, Romanian, and light/dark themes. Some navigation destinations explicitly describe planned features.

## Architecture

- `frontend/`: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn styles/components, TanStack Query, React Hook Form, Zod, and MapLibre GL.
- `backend/`: PHP 8.3+ / Laravel 13 JSON API, Sanctum bearer tokens, validated requests, role-based moderation, and route generation.
- PostgreSQL with PostGIS stores domain records and authentication data. SQLite is used by automated tests. Redis is included in local Docker Compose; the default example uses database cache/sessions and synchronous queues.
- `backend/database/`: migrations, seeders, and source/geocoded Chișinău place datasets.
- `frontend/public/images/`: required local artwork, photos, fallback images, and attributions.

Entry points: `frontend/app/layout.tsx` and `frontend/app/page.tsx`; `backend/public/index.php`, `backend/bootstrap/app.php`, and `backend/routes/api.php`. The frontend calls Laravel directly through `frontend/lib/api/http.ts`; there is no replacement backend in Next.js.

## Local setup

Requirements: Node.js 22, npm, PHP 8.3+, Composer 2, PostgreSQL/PostGIS, or Docker Compose. PHP needs the Laravel/Composer extensions including OpenSSL, mbstring, DOM/XML, fileinfo, and PDO PostgreSQL; tests also need PDO SQLite. Enable extensions before running Composer or tests.

Preserve existing local environment files. On a new checkout, copy `.env.example` to `.env`, `backend/.env.example` to `backend/.env`, and `frontend/.env.example` to `frontend/.env.local`. Set a unique `DB_PASSWORD` in the root `.env`. Compose passes it to both PostgreSQL and Laravel.

Docker development:

```sh
docker compose build
docker compose run --rm backend composer install
docker compose run --rm backend php artisan key:generate
docker compose up -d
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
```

The frontend is at `http://localhost:3000`, API at `http://localhost:8000/api`, and API health at `/api/health`. Published Compose ports bind to loopback only. Existing PostgreSQL volumes retain their original password: configure the existing password when reusing a volume; changing the environment does not rotate database credentials.

Without Docker, set `DB_HOST=127.0.0.1` and database credentials in `backend/.env`, then:

```sh
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=127.0.0.1 --port=8000
```

In another terminal:

```sh
cd frontend
npm ci
npm run dev
```

Run the seeder only when initializing a fresh database. Repeating it can reset seeded place moderation, route counters, and route points; back up retained data and review the seed before rerunning it. Demo accounts are created only in `local` or `testing`; never enable those environments in production. Keep `SEED_DATABASE=false` after initialization. Never use `migrate:fresh` or `db:wipe` against retained data.

## Verification and production build

```sh
cd backend
composer validate --strict
composer audit
php artisan test

cd ../frontend
npm ci
npm audit
npm run lint
npm run build
npm run typecheck
npm run start
```

Set `NEXT_PUBLIC_API_URL` to the real HTTPS API URL **before** the production frontend build; Next.js embeds public variables in browser bundles. A successful build alone does not prove API connectivity.

At the 2026-10-22 check, Composer and production npm dependencies have no known advisories. The full npm audit still flags development tooling through the `braces`/`fast-glob` chain. Do not run these tools against untrusted glob patterns; a clean production audit does not mean all development dependencies are advisory-free. The original shadcn stylesheet version is retained to preserve the interface.

With the API running and a production frontend build available, run `npm run test:e2e` from `frontend/`. Playwright starts the frontend on port 3010. Set `CITYQUEST_E2E_API_URL` for another test API and `CITYQUEST_E2E_BASE_URL` to test an already-running frontend. The suite creates test accounts and route activity; use an isolated test database. Configure `CORS_ALLOWED_ORIGINS` with the exact test origin. Install Chromium with `npx playwright install chromium` if missing.

## Configuration and deployment

Frontend public variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`.

Backend production variables: `APP_ENV=production`, `APP_DEBUG=false`, a private `APP_KEY`, `APP_URL`, `FRONTEND_URL`, `DB_CONNECTION=pgsql`, `DB_URL` or separate `DB_*` values, `DB_SSLMODE`, `DB_SEARCH_PATH`, `CACHE_STORE`, `SESSION_DRIVER`, `QUEUE_CONNECTION`, and exact `CORS_ALLOWED_ORIGINS`. Configure `TRUSTED_PROXIES` only with verified proxy addresses/CIDRs whose forwarding headers are sanitized. Use HTTPS and secure cookies. Keep database credentials server-side.

The PHP container retains its existing startup script: it validates `APP_KEY`, runs forward migrations, optionally seeds when `SEED_DATABASE=true`, and starts the API. It is a PHP/container artifact, not a Sites Worker.

**ChatGPT Sites deployment is blocked by the existing PHP/PostgreSQL backend.** Sites supports static assets and Cloudflare Workers; it cannot directly run this Laravel application or PostgreSQL/PostGIS. No working production API URL has been configured, no Site has been published, and no production URL is claimed. See [Sites compatibility and prerequisites](docs/sites-deployment.md).

No other hosting provider is deployed by this migration. Source is intended for `https://github.com/qweclipse/cityquest`, branch `main`.

## Data and application limits

- Maps use external OpenStreetMap raster tiles; connectivity and the provider's usage policy apply.
- Place images/source links may reference third parties; local fallbacks are retained. There is no upload endpoint requiring R2.
- Generated routes are shareable by their URL. `is_public` controls discovery listings; an unlisted route is not private.
- Production needs persistent PostgreSQL/PostGIS and backups. SQLite tests do not validate PostGIS operations.
- Historical prompts, audits, screenshots, caches, secrets, dependencies, and generated graphs are excluded from Git. Archived originals remain outside the project.
