#!/bin/sh
set -eu

case "${APP_KEY:-}" in
    "")
        echo "APP_KEY is required." >&2
        exit 1
        ;;
    base64:*) ;;
    *) export APP_KEY="base64:${APP_KEY}" ;;
esac

php artisan config:cache
php artisan migrate --force

if [ "${SEED_DATABASE:-false}" = "true" ]; then
    php artisan db:seed --force
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
