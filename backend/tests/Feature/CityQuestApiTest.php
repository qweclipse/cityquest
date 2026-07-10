<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Place;
use App\Models\Route as CityRoute;
use App\Models\RouteActivity;
use App\Models\User;
use Database\Seeders\CityQuestSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CityQuestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_seed_keeps_product_data_without_demo_accounts(): void
    {
        $this->app->detectEnvironment(fn () => 'production');

        $this->artisan('db:seed', [
            '--class' => CityQuestSeeder::class,
            '--force' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('cities', ['slug' => 'chisinau']);
        $this->assertDatabaseHas('routes', ['is_public' => true, 'user_id' => null]);
        $this->assertDatabaseMissing('users', ['email' => 'alexander@cityquest.test']);
    }

    public function test_unauthenticated_api_requests_never_redirect_to_a_web_login_route(): void
    {
        $this->get('/api/me')
            ->assertUnauthorized()
            ->assertJsonStructure(['message']);
    }

    public function test_cors_allows_the_configured_frontend_origin(): void
    {
        config([
            'cors.allowed_origins' => ['https://cityquest-web.vercel.app'],
            'cors.allowed_origins_patterns' => [],
        ]);

        $this->withHeader('Origin', 'https://cityquest-web.vercel.app')
            ->getJson('/api/health')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'https://cityquest-web.vercel.app');
    }

    public function test_cors_rejects_an_untrusted_origin(): void
    {
        config([
            'cors.allowed_origins' => ['https://cityquest-web.vercel.app'],
            'cors.allowed_origins_patterns' => [],
        ]);

        $response = $this->withHeader('Origin', 'https://untrusted.example')
            ->getJson('/api/health')
            ->assertOk();

        $allowOrigin = $response->headers->get('Access-Control-Allow-Origin');

        $this->assertNotSame('*', $allowOrigin);
        $this->assertNotSame('https://untrusted.example', $allowOrigin);
    }

    public function test_public_endpoints_return_seeded_cityquest_data(): void
    {
        $this->seed(CityQuestSeeder::class);

        $this->getJson('/api/cities')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'chisinau');

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(12, 'data');

        $this->getJson('/api/places?per_page=3')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'coordinates' => ['lat', 'lng'],
                        'links' => ['google_maps', 'yandex_maps', 'external_source'],
                    ],
                ],
            ]);

        $route = CityRoute::query()->where('is_public', true)->firstOrFail();

        $this->getJson('/api/routes/public?per_page=2')
            ->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta']);

        $this->getJson('/api/routes/'.$route->id)
            ->assertOk()
            ->assertJsonPath('data.id', $route->id)
            ->assertJsonStructure([
                'data' => [
                    'points' => [
                        '*' => [
                            'order_number',
                            'place' => ['id', 'name', 'coordinates'],
                        ],
                    ],
                    'line',
                ],
            ]);

        $this->getJson('/api/collections?per_page=2')
            ->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_route_generation_creates_mobile_ready_route_payload(): void
    {
        $this->seed(CityQuestSeeder::class);

        $city = City::query()->where('slug', 'chisinau')->firstOrFail();

        $this->postJson('/api/routes/generate', [
            'city_id' => $city->id,
            'duration_minutes' => 180,
            'route_type' => 'walk',
            'vibe' => 'calm',
            'budget_mode' => 'any',
            'place_mode' => 'verified_only',
        ])
            ->assertCreated()
            ->assertJsonPath('data.created_source', 'generated')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'duration_minutes',
                    'distance_km',
                    'budget' => ['min', 'max', 'currency_code'],
                    'points' => [
                        '*' => [
                            'order_number',
                            'estimated_duration_minutes',
                            'place' => ['id', 'name', 'coordinates'],
                        ],
                    ],
                    'line',
                ],
            ]);

        $this->assertDatabaseHas('routes', ['created_source' => 'generated']);
    }

    public function test_token_auth_profile_and_protected_actions_work(): void
    {
        $this->seed(CityQuestSeeder::class);

        $route = CityRoute::query()->where('is_public', true)->firstOrFail();
        $place = Place::query()->firstOrFail();

        $login = $this->postJson('/api/login', [
            'email' => 'alexander@cityquest.test',
            'password' => 'password',
            'device_name' => 'feature-test',
        ])
            ->assertOk()
            ->assertJsonPath('user.email', 'alexander@cityquest.test')
            ->json();

        $token = $login['token'];

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'alexander@cityquest.test');

        $this->withToken($token)
            ->patchJson('/api/profile', [
                'preferred_language' => 'en',
                'preferred_theme' => 'dark',
            ])
            ->assertOk()
            ->assertJsonPath('data.preferred_language', 'en')
            ->assertJsonPath('data.preferred_theme', 'dark');

        $this->withToken($token)
            ->postJson('/api/routes/'.$route->id.'/save')
            ->assertOk()
            ->assertJsonPath('data.id', $route->id);

        $this->withToken($token)
            ->postJson('/api/routes/'.$route->id.'/like')
            ->assertOk()
            ->assertJsonPath('data.id', $route->id);

        $this->withToken($token)
            ->postJson('/api/routes/'.$route->id.'/start')
            ->assertOk()
            ->assertJsonPath('data.status', RouteActivity::STATUS_STARTED)
            ->assertJsonPath('data.route.id', $route->id);

        $this->withToken($token)
            ->postJson('/api/routes/'.$route->id.'/complete')
            ->assertOk()
            ->assertJsonPath('data.status', RouteActivity::STATUS_COMPLETED)
            ->assertJsonPath('data.route.id', $route->id);

        $this->withToken($token)
            ->postJson('/api/places/'.$place->id.'/favorite')
            ->assertOk()
            ->assertJsonPath('data.id', $place->id);

        $this->withToken($token)
            ->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('data.stats.completed_routes_count', 1)
            ->assertJsonStructure([
                'data' => [
                    'contribution_status',
                    'preferred_categories',
                    'preferred_vibes',
                    'recent_route_activity' => [
                        '*' => ['id', 'status', 'route', 'started_at', 'completed_at'],
                    ],
                    'stats' => [
                        'achievements_count',
                        'completed_routes_count',
                        'contributions_count',
                        'favorite_places_count',
                        'saved_routes_count',
                    ],
                    'suggested_next_route',
                ],
            ]);

        $notifications = $this->withToken($token)
            ->getJson('/api/notifications')
            ->assertOk()
            ->json('data');

        $this->assertNotEmpty($notifications);

        $this->withToken($token)
            ->patchJson('/api/notifications/'.$notifications[0]['id'].'/read')
            ->assertOk()
            ->assertJsonPath('data.id', $notifications[0]['id']);

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseHas('users', [
            'email' => 'alexander@cityquest.test',
            'preferred_language' => 'en',
            'preferred_theme' => 'dark',
        ]);

        $this->assertDatabaseHas('route_activities', [
            'route_id' => $route->id,
            'status' => RouteActivity::STATUS_COMPLETED,
            'user_id' => User::query()->where('email', 'alexander@cityquest.test')->value('id'),
        ]);
    }

    public function test_authenticated_user_can_submit_community_place(): void
    {
        $this->seed(CityQuestSeeder::class);

        $user = User::query()->where('email', 'alexander@cityquest.test')->firstOrFail();
        $city = City::query()->where('slug', 'chisinau')->firstOrFail();
        $categoryId = Place::query()->firstOrFail()->category_id;

        Sanctum::actingAs($user);

        $this
            ->postJson('/api/places', [
                'city_id' => $city->id,
                'category_id' => $categoryId,
                'name' => 'Community Test Place',
                'description' => 'A user-submitted place used to verify the add place endpoint.',
                'short_description' => 'User-submitted place',
                'address' => 'Test address',
                'lat' => 47.021,
                'lng' => 28.833,
                'average_price_min' => 0,
                'average_price_max' => 50,
                'currency_code' => 'MDL',
                'visit_duration_minutes' => 30,
                'external_source_url' => 'https://example.com/community-test-place',
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Community Test Place')
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.verification_status', 'needs_image_review');

        $this->assertDatabaseHas('places', [
            'name' => 'Community Test Place',
            'created_by_user_id' => $user->id,
            'is_active' => false,
            'verification_status' => 'needs_image_review',
        ]);

        $place = Place::query()->where('name', 'Community Test Place')->firstOrFail();

        $this->assertDatabaseHas('moderation_actions', [
            'action' => 'submitted',
            'entity_id' => $place->id,
            'entity_type' => Place::class,
            'new_status' => 'needs_image_review',
        ]);
    }

    public function test_moderator_can_review_places_and_users_can_suggest_corrections(): void
    {
        $this->seed(CityQuestSeeder::class);

        $user = User::query()->where('email', 'alexander@cityquest.test')->firstOrFail();
        $moderator = User::factory()->create([
            'email' => 'moderator@cityquest.test',
            'role' => User::ROLE_MODERATOR,
        ]);
        $city = City::query()->where('slug', 'chisinau')->firstOrFail();
        $categoryId = Place::query()->firstOrFail()->category_id;

        Sanctum::actingAs($user);

        $submittedPlaceId = $this
            ->postJson('/api/places', [
                'city_id' => $city->id,
                'category_id' => $categoryId,
                'name' => 'Moderation Queue Test Place',
                'description' => 'A complete user-submitted place waiting for human review.',
                'short_description' => 'Pending place',
                'address' => 'Review street 12',
                'lat' => 47.024,
                'lng' => 28.845,
                'average_price_min' => 0,
                'average_price_max' => 75,
                'currency_code' => 'MDL',
                'visit_duration_minutes' => 35,
                'external_source_url' => 'https://example.com/moderation-queue-place',
                'image_url' => 'https://example.com/moderation-queue-place.jpg',
            ])
            ->assertCreated()
            ->assertJsonPath('data.verification_status', 'needs_review')
            ->json('data.id');

        $existingPlace = Place::query()
            ->where('verification_status', Place::STATUS_VERIFIED)
            ->firstOrFail();

        $this
            ->postJson('/api/places/'.$existingPlace->id.'/suggest-correction', [
                'payload' => [
                    'reason' => 'source_link',
                    'note' => 'Official page moved to a newer URL.',
                    'official_url' => 'https://example.com/new-official-source',
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        Sanctum::actingAs($moderator);

        $this
            ->getJson('/api/admin/places/pending')
            ->assertOk()
            ->assertJsonFragment(['name' => 'Moderation Queue Test Place']);

        $this
            ->getJson('/api/admin/places/data-quality')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'correction_suggestions',
                    'duplicate_candidates',
                    'missing_coordinates',
                    'missing_images',
                    'missing_source',
                ],
            ]);

        $this
            ->patchJson('/api/admin/places/'.$submittedPlaceId.'/approve', [
                'note' => 'Looks useful for beta.',
                'status' => Place::STATUS_COMMUNITY_CONFIRMED,
            ])
            ->assertOk()
            ->assertJsonPath('data.is_active', true)
            ->assertJsonPath('data.verification_status', 'community_confirmed');

        $this->assertDatabaseHas('moderation_actions', [
            'action' => 'approve',
            'entity_id' => $submittedPlaceId,
            'entity_type' => Place::class,
            'moderator_id' => $moderator->id,
            'new_status' => 'community_confirmed',
        ]);
    }
}
