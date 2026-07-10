FROM php:8.4-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libonig-dev libpq-dev libzip-dev zip \
    && docker-php-ext-install -j"$(nproc)" bcmath mbstring pdo_pgsql pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --optimize-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --no-dev --optimize \
    && mkdir -p bootstrap/cache storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && chown -R www-data:www-data bootstrap/cache storage

RUN php -r '$required = ["dom", "libxml", "mbstring", "openssl", "pdo_pgsql", "tokenizer", "xml", "xmlreader", "xmlwriter"]; foreach ($required as $extension) { if (! extension_loaded($extension)) { fwrite(STDERR, "Missing PHP extension: {$extension}\n"); exit(1); } }'

COPY --chmod=755 docker/start-render.sh /usr/local/bin/cityquest-start

USER www-data

EXPOSE 10000

CMD ["cityquest-start"]
