# CityQuest first free-tier deployment plan

## Status

The repository is prepared on `deployment/first-public-hosting`. Platform deployment remains pending because GitHub has no CityQuest repository or app installation, the Supabase connection requires reauthentication, and Render has no secure integration in the current Codex session. Vercel is connected on the `kasre` Hobby team and has no existing project.

## Architecture

- GitHub stores this monorepo and drives preview/production deployments.
- Vercel Hobby builds `frontend/` as the Next.js application.
- Render Free builds `backend/Dockerfile` as the Laravel JSON API.
- Supabase Free provides PostgreSQL with PostGIS. The browser never receives database credentials.
- Laravel remains the system of record for auth and business logic. Web and future mobile clients use the same bearer-token JSON API.
- Redis is not provisioned. Cache and session state use PostgreSQL; queues run synchronously.

## Deployment order

1. Create the GitHub repository, push `main` and `deployment/first-public-hosting`, and open a draft PR.
2. Reauthenticate Supabase, create one Free project in a European region, create the `cityquest` schema, and enable PostGIS in `gis`.
3. Create a Render Blueprint from the repository's root `render.yaml`, which defines the Free Web Service on the deployment branch. Provide its required environment variables in the dashboard. The container runs migrations and the idempotent production seed before starting.
4. Import the same GitHub repository into Vercel Hobby with Root Directory `frontend`, Framework Preset `Next.js`, and Production Branch `deployment/first-public-hosting` for the initial test.
5. Set the Vercel public environment variables and deploy. Put the resulting exact Vercel origin in Render, then redeploy Render once so CORS is exact.
6. Run the hosted smoke suite. After review, merge the PR and change both platforms to track `main`.

## Build and validation commands

```text
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build

docker build --file backend/Dockerfile --tag cityquest-api:deployment backend
php artisan migrate --force
php artisan db:seed --force
```

Render Free does not support pre-deploy commands, shell access, or one-off jobs. `backend/docker/start-render.sh` therefore performs the safe migration and seed on startup before binding to `PORT`.

## Environment variable names

Vercel:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

Render/Laravel:

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_DEBUG`
- `APP_URL`
- `FRONTEND_URL`
- `APP_LOCALE`
- `APP_FALLBACK_LOCALE`
- `LOG_CHANNEL`
- `LOG_DEPRECATIONS_CHANNEL`
- `LOG_LEVEL`
- `DB_CONNECTION`
- `DB_URL`
- `DB_SSLMODE`
- `DB_SEARCH_PATH`
- `CACHE_STORE`
- `SESSION_DRIVER`
- `QUEUE_CONNECTION`
- `FILESYSTEM_DISK`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOWED_ORIGIN_PATTERNS`
- `SEED_DATABASE`
- `PORT` (provided by Render)

Only `NEXT_PUBLIC_*` names are browser-visible. Database, Render, Supabase, and application secrets must never use that prefix.

## Migration and seed plan

- Use `php artisan migrate --force`; never use `migrate:fresh`, `db:wipe`, or destructive reseeding.
- Existing migrations create sessions, cache locks, job tables, Sanctum tokens, all domain tables, and PostGIS-backed place locations.
- The production seeder uses idempotent upserts/deduplication for cities, categories, places, routes, achievements, and starter data.
- Known-password demo users, their favorites, notifications, and demo history are restricted to `local` and `testing`; production public routes have nullable authors.
- `SEED_DATABASE` can be disabled after the first successful deployment. Leaving it enabled is safe but adds cold-start work.

## Rollback

- Application: revert the deployment commit or PR and redeploy. Do not force-push.
- Vercel: promote the last known-good deployment.
- Render: roll back to one of the two retained Free-service deployments.
- Database: prefer forward corrective migrations. Do not run destructive rollback commands against Supabase without a reviewed backup/recovery plan.

## Free-tier limitations

- Render Free sleeps after 15 idle minutes and can take about one minute to wake. Its filesystem is ephemeral, it has no persistent disk, shell, one-off jobs, or pre-deploy commands, and the workspace receives 750 Free instance hours monthly. See [Render Free limitations](https://render.com/docs/free) and [Render deploy lifecycle](https://render.com/docs/deploys).
- Supabase Free allows two active projects, a 500 MB database quota, and pauses low-activity projects after about one week. Automatic backups are not included. See [Supabase pricing](https://supabase.com/pricing) and [database size behavior](https://supabase.com/docs/guides/platform/database-size).
- Vercel Hobby is for personal/non-commercial projects and has monthly resource limits; exceeding most limits pauses that feature until the rolling period resets. See [Vercel Hobby limits](https://vercel.com/docs/plans/hobby).
- No paid disk, database, worker, cron, add-on, domain, or Redis resource is part of this plan.
