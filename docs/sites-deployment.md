# ChatGPT Sites compatibility

Assessment date: 2026-10-22. Status: blocked; no Site identity or production URL has been assigned.

## Runtime boundary

The installed official Sites workflow serves static files or server code in Cloudflare Workers (JavaScript/TypeScript, 128 MB per isolate, HTTP external connections, no raw TCP). Its server starter uses Vinext rather than a long-running `next start` process.

| Existing dependency | Sites impact |
| --- | --- |
| Laravel 13 / PHP 8.3+ | Cannot execute directly in a Worker. Auth, moderation, notifications, and route generation live here. |
| PostgreSQL / PostGIS | PDO connections/geography migrations cannot move to D1 unchanged. D1 is not PostgreSQL or PostGIS. |
| Sanctum / favorites / history | Must retain durable records and authorization; browser memory is not a replacement. |
| Next.js dynamic routes | A normal `.next` directory is not a Sites archive. Worker builds require adaptation and verification; static export cannot simply replace current dynamic pages. |
| Images | Existing local assets and URL fallbacks remain. No upload endpoint currently requires R2. |
| Queues / cache | Defaults use synchronous queues and database cache/sessions. Sites cannot run a PHP queue worker. |

No database/storage binding has been created, no `.openai/hosting.json` is fabricated, and no partial/demo frontend is published as working CityQuest.

## Smallest path preserving the backend

1. Supply an existing HTTPS Laravel API backed by persistent PostgreSQL/PostGIS. Use its real `/api` URL. Provisioning another hosting provider is outside this Sites-only deployment.
2. Preserve schema/data and Sanctum auth; set production variables and exact CORS origins. Back up retained data before forward migrations.
3. Prepare the existing frontend using the official Sites Vinext/Worker workflow in an isolated checkout, preserving components, routing, assets, and API calls. This step is still unimplemented/unverified; a Next.js build does not prove Vinext compatibility.
4. Call native Sites `create_site` once when the app can actually be deployed. Immediately persist the returned project ID using `set-project-id.mjs`, retaining `.openai/hosting.json` in Git. Never put credentials in it.
5. Build with the real public API URL. Allow the exact Site origin in backend CORS. Test auth, moderation, favorites, route generation/history, assets, and mobile navigation.
6. Use official `site-workflow.mjs` for source synchronization/build/archive, passing credentials through hidden stdin. Save using its exact pushed commit SHA and matching archive. Enable public access when allowed, deploy the saved version natively, and verify the real production URL.
7. Push generated source configuration to GitHub and record matching GitHub/Sites commit identities. No production synchronization is claimed before these steps succeed.

## If everything must run inside Sites

Laravel endpoints, auth, moderation, route generation, and PostgreSQL/PostGIS queries require a substantial Worker/D1 port and verified schema/data migration. This separate migration has not been attempted because this task requires preserving the existing application.
