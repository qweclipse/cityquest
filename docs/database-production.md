# Supabase PostgreSQL and PostGIS production setup

## Current status

The database has not been created because the connected Supabase app requires reauthentication. No migration or production seed has been run remotely.

## One-time project setup

1. Create one Supabase Free project in a European region near Render Frankfurt.
2. In SQL Editor, run the safe idempotent statement:

```sql
create schema if not exists cityquest;
```

3. Open Database -> Extensions, enable `postgis`, choose Create a new schema, and name it `gis`.
4. From Connect, use the Session Pooler connection on port 5432 for Render. Store it only in the Render secret named `DB_URL`.
5. Keep the application schema out of Supabase's exposed `public` Data API. CityQuest clients must call Laravel, not Supabase directly.

Supabase documents the Laravel Session Pooler flow in its [Laravel guide](https://supabase.com/docs/guides/getting-started/quickstarts/laravel) and recommends a non-public application schema. PostGIS setup is documented in [PostGIS geo queries](https://supabase.com/docs/guides/database/extensions/postgis).

## Laravel connection names

- `DB_CONNECTION`
- `DB_URL`
- `DB_SSLMODE`
- `DB_SEARCH_PATH`

The production configuration uses encrypted PostgreSQL transport. The strongest `verify-full` mode additionally requires installing Supabase's CA certificate as a Render secret file; the first free deployment uses required TLS without committing any certificate or credential. See [Supabase SSL enforcement](https://supabase.com/docs/guides/platform/ssl-enforcement).

## Migration and seed commands

```text
php artisan migrate --force
php artisan db:seed --force
```

Never run `migrate:fresh`, `db:wipe`, or a destructive reseed in production.

The migration set includes:

- PostGIS enablement and geography columns/indexes.
- Users, password reset tokens, database sessions, and Sanctum personal access tokens.
- Cache/cache-lock and queue bookkeeping tables.
- Cities, categories, places/photos, public/generated routes and points.
- Favorites, saved routes, likes, achievements, notifications, moderation, and route activity.

The production seed includes CityQuest product data and excludes known-password demo accounts. It can be run repeatedly.

## Verification

After deployment, verify through Laravel and a read-only SQL check:

```sql
select extname from pg_extension where extname = 'postgis';
select count(*) from cityquest.cities;
select count(*) from cityquest.categories;
select count(*) from cityquest.places;
select count(*) from cityquest.routes where is_public = true;
```

Also verify `/api/health`, `/api/cities`, `/api/categories`, `/api/places`, and `/api/routes/public` on the Render URL.
