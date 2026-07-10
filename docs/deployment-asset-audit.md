# Deployment asset audit

## Included production assets

- All 24 avatar item PNGs under `frontend/public/images/avatar/items/`.
- Hero and section artwork under `frontend/public/images/hero/` and `frontend/public/images/sections/`.
- Route art under `frontend/public/images/routes/`.
- All place/category fallback JPG and SVG assets under `frontend/public/images/fallbacks/`.
- `frontend/app/favicon.ico` and `frontend/public/images/ATTRIBUTIONS.md`.
- `backend/database/data/chisinau_places_geocoded.json`, which the production-safe seeder reads.

The audit mapped 88 application image assets to runtime code, CSS, or seed references. No local font files exist; the application uses a CSS system font stack and Lucide icons.

## Excluded from Git and deployment contexts

- `.prompts/`, `_cityquest_audit_for_chatgpt/`, `cityquest_audit_for_chatgpt.zip`.
- `graphify-out/`, `output/`, `PROGRESS.md`.
- Playwright screenshots, traces, videos, reports, test results, coverage, and blob reports.
- `.next/`, `node_modules/`, `vendor/`, PHPUnit caches, Laravel compiled views/cache, and local logs.
- `.env*` except the name-only example files.
- Database dumps, SQL exports, SQLite files, archives, backups, IDE, and OS files.
- Backend tests and local-only seed CSV/TXT sources from the Render Docker context.
- Frontend tests, Playwright configuration outputs, Docker files, and development documentation from the Vercel upload context.

The root and service-specific `.gitignore`, `.dockerignore`, and `.vercelignore` files enforce these boundaries.

## `frontend/public` inspection

`frontend/public` contains no historical screenshot candidates. The only old screenshots are in `_cityquest_audit_for_chatgpt/07_screenshots/` and `output/playwright/`, both excluded wholesale and unreferenced by production source.

No public files were removed. Five unreferenced Next starter SVGs were retained because they are not historical screenshots, matching the prompt's narrow deletion rule.
