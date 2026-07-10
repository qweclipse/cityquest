<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('country');
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->string('timezone');
            $table->string('currency_code', 3);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('preferred_city_id')
                ->references('id')
                ->on('cities')
                ->nullOnDelete();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('places', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->text('description');
            $table->string('short_description')->nullable();
            $table->string('address')->nullable();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->decimal('average_price_min', 10, 2)->nullable();
            $table->decimal('average_price_max', 10, 2)->nullable();
            $table->string('currency_code', 3)->nullable();
            $table->unsignedInteger('visit_duration_minutes')->nullable();
            $table->string('verification_status')->default('user_added');
            $table->string('source_type')->default('manual');
            $table->string('official_url', 2048)->nullable();
            $table->string('google_maps_url', 2048)->nullable();
            $table->string('yandex_maps_url', 2048)->nullable();
            $table->string('external_source_url', 2048)->nullable();
            $table->string('image_url', 2048)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['city_id', 'slug']);
            $table->index(['city_id', 'category_id']);
            $table->index(['city_id', 'verification_status', 'is_active']);
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE places ADD COLUMN location geography(Point, 4326) NULL');
            DB::statement('CREATE INDEX places_location_gist ON places USING GIST (location)');
        }

        Schema::create('place_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')->constrained()->cascadeOnDelete();
            $table->string('image_url', 2048);
            $table->string('source')->nullable();
            $table->foreignId('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->index();
            $table->text('description')->nullable();
            $table->string('route_type')->nullable();
            $table->string('vibe')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->string('currency_code', 3)->nullable();
            $table->boolean('is_public')->default(false);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('saves_count')->default(0);
            $table->string('image_url', 2048)->nullable();
            $table->string('created_source')->default('generated');
            $table->timestamps();

            $table->index(['city_id', 'is_public']);
            $table->index(['city_id', 'route_type']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('route_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained()->cascadeOnDelete();
            $table->foreignId('place_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('order_number');
            $table->unsignedInteger('estimated_duration_minutes')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['route_id', 'order_number']);
            $table->index(['place_id']);
        });

        Schema::create('saved_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('route_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'route_id']);
        });

        Schema::create('favorite_places', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('place_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'place_id']);
        });

        Schema::create('route_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('route_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'route_id']);
        });

        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description');
            $table->string('icon')->nullable();
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('unlocked_at');
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('type')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
        Schema::dropIfExists('route_likes');
        Schema::dropIfExists('favorite_places');
        Schema::dropIfExists('saved_routes');
        Schema::dropIfExists('route_points');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('place_photos');
        Schema::dropIfExists('places');
        Schema::dropIfExists('categories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['preferred_city_id']);
        });

        Schema::dropIfExists('cities');
    }
};
