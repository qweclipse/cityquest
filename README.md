# CityQuest

CityQuest is a public-beta web app for planning city leisure routes: walks, dates, family days, cafes, parks, cultural routes, and shared community routes.

Current stage: public beta hardening. The app now has a production-minded app shell, local real-photo visual assets, RU/EN/RO localization, map data contract fixes, moderation-safe UGC, route progress tracking, and a profile retention loop.

## Public Beta Preview

Product screenshots from the audit package:

![CityQuest home](./_cityquest_audit_for_chatgpt/07_screenshots/desktop_light_home.png)
![CityQuest map](./_cityquest_audit_for_chatgpt/07_screenshots/desktop_light_map.png)
![CityQuest profile](./_cityquest_audit_for_chatgpt/07_screenshots/desktop_light_profile.png)
![CityQuest moderation](./_cityquest_audit_for_chatgpt/07_screenshots/desktop_light_admin.png)

Public beta focus:
- useful route discovery and route generation;
- map filters with visible status/pagination context;
- saved routes, favorite places, achievements, and route activity tied together in profile;
- community place submission with moderation/data-quality safeguards;
- smoke coverage for the main public-beta paths.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Lucide React, MapLibre GL JS, custom light/dark/system theme provider, and RU/EN/RO i18n foundation.
- Backend: Laravel API, Laravel Sanctum, API Resources, queues, Redis.
- Database: PostgreSQL with PostGIS.
- Infrastructure: Docker Compose.

## Structure

```text
cityquest/
  frontend/
  backend/
  tools/python/
  docker-compose.yml
  README.md
  PROGRESS.md
```

The design reference image remains in the parent folder and should not be moved or deleted.

## Run With Docker

```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API health: http://localhost:8000/api/health
- Postgres/PostGIS: localhost:5432
- Redis: localhost:6379

Useful backend commands:

```bash
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan migrate:fresh --seed
docker compose exec backend php artisan queue:work
```

## Seed Data

The seed data creates realistic Chisinau content for local development:
- 1 city: Chișinău, Moldova.
- 12 categories.
- 161 active places with lat/lng, map links, source links, and local fallback images.
- 245-row source candidate dataset in `backend/database/data/chisinau_places_seed.csv` and `backend/database/data/chisinau_places_seed.txt`.
- Geocoded candidate data in `backend/database/data/chisinau_places_geocoded.json`; the seeder imports only candidates with usable coordinates and category-compatible geocoding results.
- 8 public routes with ordered route points.
- 3 seed users, 5 achievements, favorites, saves, likes, and notifications.

Seed users all use the password `password`:
- `alexander@cityquest.test`
- `maria@cityquest.test`
- `ion@cityquest.test`

## API

Public endpoints:

```text
GET    /api/health
GET    /api/cities
GET    /api/categories
GET    /api/places
GET    /api/places/{place}
GET    /api/routes/public
GET    /api/routes/{route}
POST   /api/routes/generate
GET    /api/collections
POST   /api/register
POST   /api/login
```

Authenticated endpoints use Sanctum bearer tokens:

```text
POST   /api/logout
GET    /api/me
GET    /api/profile
PATCH  /api/profile
POST   /api/routes/{route}/save
DELETE /api/routes/{route}/save
POST   /api/routes/{route}/like
DELETE /api/routes/{route}/like
POST   /api/routes/{route}/start
POST   /api/routes/{route}/complete
POST   /api/places
POST   /api/places/{place}/favorite
DELETE /api/places/{place}/favorite
GET    /api/notifications
PATCH  /api/notifications/{notification}/read
```

The API is built for the public-beta web app and future mobile clients: controllers return Laravel API Resources, writes are validated by Form Requests, and generated routes include ordered points plus line coordinates for map rendering.

## Frontend Data Layer

The frontend talks to Laravel through a typed API layer:

- API DTOs and payload types: `frontend/lib/api/types.ts`
- Fetch client and API functions: `frontend/lib/api/http.ts`, `frontend/lib/api/cityquest-api.ts`
- Query keys: `frontend/lib/api/query-keys.ts`
- TanStack Query hooks: `frontend/hooks/api/use-cityquest.ts`
- Auth token storage/context: `frontend/lib/api/auth-token.ts`, `frontend/lib/auth/auth-provider.tsx`
- RU/EN/RO dictionaries and provider: `frontend/lib/i18n/`
- Custom theme provider without inline scripts: `frontend/lib/theme/theme-provider.tsx`
- Zod schemas for forms: `frontend/lib/validation/cityquest-schemas.ts`
- App-level providers: `frontend/components/providers/app-providers.tsx`

Available hooks include `useCities`, `useCategories`, `usePlaces`, `usePlace`, `useGenerateRoute`, `useRoute`, `useCollections`, `useProfile`, `useNotifications`, `useSavedRoutes`, and `useFavoritePlaces`, plus auth and mutation helpers such as `useLogin`, `useRegister`, `useLogout`, `useUpdateProfile`, `useCreatePlace`, and favorite/save mutations.

## Frontend Shell

The app shell is in `frontend/components/layout/app-shell.tsx` and includes:
- desktop sidebar navigation with open/close state;
- mobile drawer navigation;
- mobile bottom navigation;
- top bar with city status, language menu, and a notifications link with unread count;
- compact theme segmented switch in the sidebar footer;
- responsive content area for planned feature pages.

Primary sidebar, top bar, mobile navigation, home action cards, and feature-page CTAs point to implemented internal routes. Navigation is periodically checked with a browser crawl so planned feature pages remain explicit pages instead of accidental 404s.

## Frontend Homepage Visual Assets

The homepage uses local real-photo assets instead of remote image URLs:

- hero backgrounds: `frontend/public/images/hero/city-dark.jpg` and `frontend/public/images/hero/city-light.jpg`;
- lower homepage section: `frontend/public/images/sections/city-card-dark.jpg` and `frontend/public/images/sections/city-card-light.jpg`;
- attributions: `frontend/public/images/ATTRIBUTIONS.md`.

Theme-aware image selection and overlay strength live in `frontend/app/globals.css` through the `cityquest-home-hero-photo`, `cityquest-home-hero-overlay`, and `cityquest-home-section-photo` classes. The component itself stays focused on layout and actions in `frontend/components/home/home-page.tsx`.

## Frontend Route Flow

The first feature flow is implemented with reusable route components:

- random route generation: `frontend/app/routes/random/page.tsx`;
- route creation form: `frontend/app/routes/create/page.tsx`;
- generated route results: `frontend/app/routes/results/page.tsx`;
- route detail map screen: `frontend/app/routes/[routeId]/page.tsx`;
- shared UI: `frontend/components/route/`.

The flow uses React Hook Form, Zod validation, TanStack Query, live city/category API data, and `POST /api/routes/generate`. Generated route results render localized route titles and ordered points while preserving API payloads for the future mobile client.

The `/routes/random` route uses the same generation API with a quick random preset: route type, vibe, duration, budget, verified places, and category hints are selected client-side, then the user is redirected to `/routes/results?route={id}`. The home action cards now link to real app routes instead of acting as inert buttons.

Route details use MapLibre GL with numbered markers, route line geometry from the API, a desktop side panel, mobile bottom sheet behavior, per-stop map links, and Google Maps walking directions. Route display helpers live in `frontend/lib/routes/route-format.ts` so web and future mobile-oriented UI can share title, budget, point ordering, and direction URL logic.

The current map style uses OpenStreetMap raster tiles through MapLibre. Before production or mobile scale, make the tile provider configurable and review the selected provider's usage policy.

## Frontend Route Discovery

Public route discovery is implemented at `frontend/app/collections/page.tsx` with reusable UI in `frontend/components/collections/collections-page.tsx` and `frontend/components/route/route-card.tsx`.

The page uses `GET /api/collections` through TanStack Query, keeps tab and route-type filters in the URL, renders localized route cards, and links every card into the MapLibre route detail screen. Shared route label, budget, point, and map helpers live in `frontend/lib/routes/route-format.ts`; collection URL parsers live in `frontend/lib/routes/collection-filters.ts` so server and client components can share the same query validation without crossing client boundaries.

Route discovery supports RU/EN/RO dictionaries for page copy, tabs, filters, route type labels, route vibe labels, empty states, and card actions.

## Frontend Places

Places catalog and place detail pages are implemented with reusable place components:

- catalog page: `frontend/app/places/page.tsx`;
- place detail page: `frontend/app/places/[placeId]/page.tsx`;
- community place entry page: `frontend/app/places/new/page.tsx`;
- new user-added places filter page: `frontend/app/places/newest/page.tsx`;
- shared UI: `frontend/components/place/`;
- shared helpers: `frontend/lib/places/`.

The catalog uses `GET /api/places` through TanStack Query and keeps `q`, `category`, and `status` filters in the URL. Cards render localized category names, verification labels, price ranges, visit duration, source type, disabled favorite entry points for logged-out users, and links into details.

Place details use MapLibre with the shared OpenStreetMap raster style, a single place marker, source links, map links, gallery photos, and structured facts.

The `/places/new` route is now a login-gated community submission form wired to `POST /api/places`. It uses the existing Zod schema and API mutation, lets users choose city/category, add coordinates, description, visit time, price and source links, then redirects to the created place detail page.

## Frontend Map

The global city map is implemented at `frontend/app/map/page.tsx` with UI in `frontend/components/map/`.

The `/map` page uses the existing places API, verified place data, simple category filters, MapLibre GL, the shared OpenStreetMap raster style, and a selected-place side panel. It intentionally stays lighter than route detail maps: no route generation, no dense dashboard controls, and no direct database access from the frontend.

## Frontend Auth And Profile

Auth and profile screens are implemented as web-first flows that reuse the same Laravel Sanctum API contracts planned for the future mobile client:

- login page: `frontend/app/login/page.tsx`;
- registration page: `frontend/app/register/page.tsx`;
- profile page: `frontend/app/profile/page.tsx`;
- shared auth components: `frontend/components/auth/`;
- profile UI: `frontend/components/profile/profile-page.tsx`;
- localized feature copy: `frontend/lib/i18n/feature-copy.ts`;
- common form controls and API error helpers: `frontend/components/common/form-controls.tsx`, `frontend/lib/forms/api-errors.ts`.

The profile page displays account data, saved routes, favorite places, recent route activity, suggested next route, city-vibe chips, contribution status, achievements, and editable preferences for name, avatar URL, preferred city, language, and theme. Login/register invalidate the profile query after setting the token so the profile screen fetches full relationship data instead of showing stale or incomplete counts.

Account library pages are implemented behind the same auth guard:

- saved routes: `frontend/app/saved-routes/page.tsx`;
- favorite places: `frontend/app/favorite-places/page.tsx`;
- achievements: `frontend/app/achievements/page.tsx`;
- walk history/activity: `frontend/app/history/page.tsx`;
- notifications: `frontend/app/notifications/page.tsx`;
- shared account UI: `frontend/components/account/`;
- account formatting helpers: `frontend/lib/account/account-format.ts`.

Saved routes and favorite places reuse the production route/place cards. Achievements and notifications use the profile and notifications API data. The history page now includes route start/complete activity from the profile payload, so completed walks are visible beyond the route detail screen.

## Frontend Planned Feature Areas

Events and deals are implemented as planned feature pages:

- events page: `frontend/app/events/page.tsx`;
- deals page: `frontend/app/deals/page.tsx`;
- shared planned-feature UI: `frontend/components/roadmap/planned-feature-page.tsx`.

The `/events` page does not show fake dates, live schedules, ticket purchases, booking, or organizer tools. The `/deals` page does not enable payments, promo codes, partner bookings, personal discounts, or affiliate flows. Both pages redirect users to currently working areas: route creation, public route collections, and places.

Advanced functionality is implemented as a planned feature page at `frontend/app/advanced/page.tsx` with UI in `frontend/components/roadmap/advanced-page.tsx`.

The `/advanced` page collects future layers such as fresh events, deals, personal routes, notifications, richer place data, city packs, travel mode, and shared walks. It does not implement payments, subscription checkout, partner payouts, billing tools, or any navigation label named "Premium".

Shared walks are implemented as a planned feature page at `frontend/app/buddy/page.tsx` with UI in `frontend/components/community/buddy-page.tsx`.

The `/buddy` page is intentionally non-social in the current web version. It explains that shared walks will arrive later and will require identity confirmation and extra safety measures. It does not implement people search, chat, walk requests, passport checks, phone checks, or parental permission flows. The page provides safe redirects into currently available product areas such as route creation, route collections, and places.

## Homepage and App Shell

The home page is the primary web-app entry point, not a marketing landing page:

- hero and value-block UI: `frontend/components/home/home-page.tsx`;
- localized home/action copy: `frontend/lib/i18n/dictionaries.ts`;
- localized homepage value-block copy: `frontend/lib/i18n/feature-copy.ts`;
- local visual assets: `frontend/public/images/hero/`, `frontend/public/images/sections/`, and fallback images in `frontend/public/images/fallbacks/`;
- shell/sidebar/topbar layout: `frontend/components/layout/app-shell.tsx`;
- language menu and theme controls: `frontend/components/common/language-switcher.tsx`, `frontend/components/common/theme-toggle.tsx`.

The current home flow keeps the first screen action-oriented: random route, custom route, profile, then a short explanation block and community place-submission CTA. The sidebar keeps primary navigation visible, moves theme switching into a compact segmented control near the profile card, and keeps the topbar focused on city, language, and notifications.

Useful frontend commands:

```bash
cd frontend
npm run dev
npm run lint
npm run test:e2e
npm run typecheck
npm run build
```

## QA And Test Notes

Frontend public-beta checks:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

`npm run test:e2e` uses Playwright and expects the backend API at `http://127.0.0.1:8000/api`. The Playwright config starts the built frontend on port `3010` unless `CITYQUEST_E2E_BASE_URL` is set.

Backend checks in Docker:

```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan test
```

Direct host PHP may fail if local extensions are missing. The known missing-extension symptoms on this machine are `pdo_pgsql`/`pgsql` for database access and `mbstring` plus XML-related extensions for PHPUnit. Treat that as a local PHP environment issue, not a product test failure, when the same suite passes inside Docker.

## Environment

Backend example: `backend/.env.example`.
Frontend example: `frontend/.env.example`.

For Docker development, `backend/.env` is already configured for the `postgres` and `redis` services.

## Roadmap

- Database migrations and seed data for Chisinau content.
- Public API endpoints for cities, categories, places, routes, collections, and route generation.
- Auth with Laravel Sanctum.
- Warm Urban responsive UI with light/dark theme and RU/EN/RO language switcher.
- Route creation flow through the Laravel route generation API.
- Random route flow through the same route generation API and results screen.
- MapLibre route details with numbered markers, route line geometry, and mobile bottom sheet behavior.
- Global city map with verified place markers and simple category filters.
- Public route discovery with tabs, filters, route cards, and route detail links.
- Places catalog and place detail pages.
- Community place submission form and profile/login UI.
- Account library pages for saved routes, favorite places, achievements, history/activity, and notifications.
- Events and deals planned feature pages with explicit no-ticket/no-payment guardrails.
- Advanced functionality planned feature page with explicit no-payment/no-premium guardrails.
- Shared walks planned feature page with explicit identity and safety guardrails.
- Future data ingestion through `tools/python`.
- Later mobile client via the Laravel API.
- Future optional booking/affiliate integrations after product and legal requirements are clear.
