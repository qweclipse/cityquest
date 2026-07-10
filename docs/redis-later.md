# Redis later, not in the first deployment

## First deployment

No Redis or Upstash resource is used or created. Laravel is configured with:

- `CACHE_STORE` using the database cache tables.
- `SESSION_DRIVER` using the database sessions table.
- `QUEUE_CONNECTION` running synchronously.

The required migrations already exist. Application source contains no direct Redis calls or queued jobs, so auth, profile, inventory presentation, places, route generation, saved routes, favorites, notifications, and moderation do not depend on Redis.

Any credential previously pasted into chat is out of scope and must be revoked/rotated; it is not stored in this repository or deployment configuration.

## When to add Redis

Add Redis only after measured cache/queue pressure justifies another service and a durable free option is acceptable. At that point:

1. Provision the service explicitly and review its persistence/sleep limits.
2. Store its connection URL only as a Render secret.
3. Change cache and/or queue environment names deliberately; do not switch sessions without testing auth continuity.
4. Add a separate worker only if the selected plan supports it and the user approves any cost.
5. Run regression tests for auth, route generation, saved routes, favorites, and moderation before cutover.

`predis/predis` remains in Composer for future compatibility, but the production Docker image does not install an unnecessary Redis PHP extension.
