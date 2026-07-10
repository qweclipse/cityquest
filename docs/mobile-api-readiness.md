# Mobile API readiness

## Preserved contract

Laravel remains the only business-logic and persistence API. Next.js is a client of the existing `/api` JSON routes; no Laravel logic or database access moved into the frontend.

Public endpoints cover health, cities, categories, places, map data, public routes, route generation/preview, route detail, and collections. Sanctum bearer-token endpoints cover registration/login, profile, saved routes, favorites, route progress, notifications, place submission, correction suggestions, and protected moderation.

## Authentication

- Registration and login return a Sanctum bearer token and user resource.
- Web requests send `Authorization: Bearer` and do not use credentialed cross-origin cookies.
- Expo/Android/iOS clients should supply a device-specific `device_name`, store tokens in Keychain/Keystore-backed secure storage, and send the same Authorization header.
- Logout revokes the current token. Mobile clients should clear local secure storage on logout or an unrecoverable authentication failure.
- Tokens must never be placed in URLs, analytics, logs, screenshots, or frontend build variables.

## CORS and transport

- CORS allows the exact production frontend origin, an anchored CityQuest Vercel preview pattern, and local development origins.
- `supports_credentials` is disabled because authentication uses bearer tokens.
- HTTPS is required for hosted frontend/API traffic. Supabase credentials remain server-only.
- Mobile apps are not governed by browser CORS, but they use the same HTTPS JSON contract and authorization checks.

## Compatibility guardrails

- Keep response resources and endpoint paths backward compatible; add fields rather than renaming/removing them without API versioning.
- Preserve Laravel validation and role middleware as the trust boundary.
- Do not embed Supabase service-role/database credentials in Next.js or mobile binaries.
- If cookie-based web auth is introduced later, review CSRF, credentialed CORS, cookie domain/SameSite, and Sanctum stateful domains separately. That redesign is not part of the first deployment.
