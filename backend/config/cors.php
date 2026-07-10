<?php

$split = static fn (?string $value): array => array_values(array_filter(
    array_map('trim', explode(',', (string) $value)),
));

$frontendUrl = trim((string) env('FRONTEND_URL', ''));

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_unique([
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        ...($frontendUrl === '' ? [] : [$frontendUrl]),
        ...$split(env('CORS_ALLOWED_ORIGINS')),
    ])),
    'allowed_origins_patterns' => $split(env('CORS_ALLOWED_ORIGIN_PATTERNS')),
    'allowed_headers' => ['Accept', 'Authorization', 'Content-Type', 'Origin', 'X-Requested-With'],
    'exposed_headers' => [],
    'max_age' => 600,
    'supports_credentials' => false,
];
