# First public hosting deployment result

## Outcome

Safe repository and deployment preparation is complete on the local branch. Hosted deployment is blocked by one-time account connections, so no public URL, remote migration, seed, or hosted smoke-test pass is claimed.

## GitHub

- Local repository: `F:/pet/cityquest`
- Base branch: `main`
- Deployment branch: `deployment/first-public-hosting`
- Remote repository: pending
- Pull request: pending

The GitHub connector identifies the user but has no installed-account repository access, and no CityQuest repository was found. No force-push, branch deletion, or visibility change occurred.

## Vercel

- Team: `kasre`
- Plan target: Hobby
- Project name: `cityquest-web` (planned)
- Root Directory: `frontend`
- Production URL: pending
- Build status: local `npm ci`, lint, typecheck, and Next.js production build passed.

## Render

- Service name: `cityquest-api` (planned)
- Plan target: Free Web Service
- Root/Docker context: `backend`
- Health path: `/api/health`
- API URL: pending
- Build/deploy status: pending secure Render connection and GitHub source.

## Supabase

- Plan target: Free
- Project name/identifier: pending reauthentication and creation
- PostGIS: pending
- Remote migrations: not run
- Remote seed/import: not run

## Smoke tests

- Local frontend dependency install: PASS
- Local frontend lint: PASS
- Local frontend typecheck: PASS
- Local frontend production build: PASS (26 routes)
- Production Docker build and required PHP extension gate: PASS
- Laravel test suite in the production Linux runtime: PASS (11 tests, 203 assertions)
- Container startup migration, production-safe seed, health, database API, and exact/untrusted CORS checks: PASS
- Production npm and Composer vulnerability audits: PASS (no known advisories after compatible lockfile patches)
- Host-only PHP dependency refresh remains unavailable because the Windows PHP installation lacks OpenSSL and mbstring; the verified Docker runtime supplies both.
- Hosted home/theme/API/data/map/collections/routes/auth/profile/inventory/favorites/moderation/console/mobile checks: BLOCKED until hosted URLs exist.

## Remaining one-time actions

1. GitHub: create an empty `cityquest` repository under the connected account without a README/license/gitignore, keep the chosen visibility unchanged afterward, and grant the Codex, Vercel, and Render GitHub apps access to that repository.
2. Supabase: reauthenticate the Supabase app connection, then create the Free project and perform the schema/PostGIS steps in `docs/database-production.md`.
3. Render: either connect the secure Render MCP/secret environment or use Dashboard -> New -> Blueprint, select the repository, and apply the root `render.yaml`. Confirm the generated Web Service uses the deployment branch and Free plan. Enter values only in Render's environment UI.
4. Vercel: import the repository into the connected Hobby team, select `frontend`, set the public environment variables, and deploy after the Render URL exists.

Environment variable names still requiring manual values:

- `DB_URL`
- `FRONTEND_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

`APP_KEY` is generated as a 256-bit value by Render and normalized in process without printing or committing it.

## Free-tier limitations and exclusions

Render cold starts, ephemeral filesystem, monthly hours, no shell/one-off/pre-deploy command, Supabase size/inactivity limits, and Vercel Hobby quotas are documented in `docs/deployment-plan.md`.

Production deployment excludes prompts, audits, old screenshots, reports, traces, logs, dumps, caches, dependencies, generated graph output, and development-only test artifacts. Referenced avatar art, hero/section art, route/place images, icons, and attribution files remain included. No historical screenshots existed in `frontend/public`, so none were removed.

## Security and API confirmation

- Gitleaks scanned both the staged 316-file baseline and the final 329-file deployment tree with redaction and found no leaks.
- No `.env`, token, API key, database password, private key, or secret value is tracked in the prepared source.
- The revoked Render credential and the unrelated pasted cache credential were not used or stored.
- Laravel bearer-token JSON endpoints and domain logic remain intact for future Expo/Android/iOS clients.
