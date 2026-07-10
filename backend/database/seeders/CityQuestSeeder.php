<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Category;
use App\Models\City;
use App\Models\Notification;
use App\Models\Place;
use App\Models\Route as CityRoute;
use App\Models\User;
use App\Support\UniqueSlug;
use JsonException;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CityQuestSeeder extends Seeder
{
    /**
     * Seed idempotent CityQuest product data and non-production demo accounts.
     */
    public function run(): void
    {
        $city = City::query()->updateOrCreate(
            ['slug' => 'chisinau'],
            [
                'country' => 'Moldova',
                'name' => 'Chișinău',
                'lat' => 47.0105,
                'lng' => 28.8638,
                'timezone' => 'Europe/Chisinau',
                'currency_code' => 'MDL',
                'is_active' => true,
            ],
        );

        $categories = $this->seedCategories();
        $users = app()->environment(['local', 'testing']) ? $this->seedUsers($city) : [];
        $places = $this->seedPlaces($city, $categories);
        $this->seedImportedPlaces($city, $categories);
        $routes = $this->seedRoutes($city, $users, $places);
        $achievements = $this->seedAchievements();

        if ($users !== []) {
            $this->seedUserState($users, $places, $routes, $achievements);
        }

        $this->refreshPlaceLocations();
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        $items = [
            ['name' => 'Парки', 'slug' => 'parks', 'icon' => 'Trees', 'color' => '#7a7d3c'],
            ['name' => 'Кафе', 'slug' => 'cafes', 'icon' => 'Coffee', 'color' => '#9a6a43'],
            ['name' => 'Музеи', 'slug' => 'museums', 'icon' => 'Landmark', 'color' => '#8f6d4f'],
            ['name' => 'Архитектура', 'slug' => 'architecture', 'icon' => 'Building2', 'color' => '#a9785a'],
            ['name' => 'История', 'slug' => 'history', 'icon' => 'ScrollText', 'color' => '#6f5f43'],
            ['name' => 'Фото-места', 'slug' => 'photo-spots', 'icon' => 'Camera', 'color' => '#b97954'],
            ['name' => 'Семья', 'slug' => 'family', 'icon' => 'Baby', 'color' => '#c58b63'],
            ['name' => 'Романтика', 'slug' => 'romance', 'icon' => 'Heart', 'color' => '#b56f65'],
            ['name' => 'Еда', 'slug' => 'food', 'icon' => 'Utensils', 'color' => '#b98546'],
            ['name' => 'Культура', 'slug' => 'culture', 'icon' => 'Drama', 'color' => '#7b6b8f'],
            ['name' => 'Бесплатные места', 'slug' => 'free-places', 'icon' => 'BadgeCheck', 'color' => '#6f7d46'],
            ['name' => 'Скрытые места', 'slug' => 'hidden-places', 'icon' => 'MapPinned', 'color' => '#7a6a46'],
        ];

        $categories = [];

        foreach ($items as $item) {
            $categories[$item['slug']] = Category::query()->updateOrCreate(
                ['slug' => $item['slug']],
                $item,
            );
        }

        return $categories;
    }

    /**
     * @return array<string, User>
     */
    private function seedUsers(City $city): array
    {
        $items = [
            'alexander' => [
                'name' => 'Александр',
                'email' => 'alexander@cityquest.test',
                'avatar_url' => '/images/fallbacks/city.svg',
                'preferred_language' => 'ru',
                'preferred_theme' => 'light',
                'level' => 12,
            ],
            'maria' => [
                'name' => 'Мария',
                'email' => 'maria@cityquest.test',
                'avatar_url' => '/images/fallbacks/romance.svg',
                'preferred_language' => 'ru',
                'preferred_theme' => 'dark',
                'level' => 8,
            ],
            'ion' => [
                'name' => 'Ion',
                'email' => 'ion@cityquest.test',
                'avatar_url' => '/images/fallbacks/park.svg',
                'preferred_language' => 'ro',
                'preferred_theme' => 'light',
                'level' => 5,
            ],
        ];

        $users = [];

        foreach ($items as $key => $item) {
            $users[$key] = User::query()->updateOrCreate(
                ['email' => $item['email']],
                [
                    ...$item,
                    'password' => Hash::make('password'),
                    'preferred_city_id' => $city->id,
                    'email_verified_at' => now(),
                ],
            );
        }

        return $users;
    }

    /**
     * @param array<string, Category> $categories
     *
     * @return array<string, Place>
     */
    private function seedPlaces(City $city, array $categories): array
    {
        $visit = 'https://visit.chisinau.md/en/';
        $moldovaTravel = 'https://moldova.travel/en/chisinau-city/';

        $items = [
            [
                'slug' => 'stefan-cel-mare-central-park',
                'category' => 'parks',
                'name' => 'Парк Штефана чел Маре',
                'short_description' => 'Старейший центральный парк города с тенистыми аллеями.',
                'description' => 'Классическая отправная точка для прогулки по центру Кишинёва: спокойные аллеи, памятник Штефану чел Маре и быстрый переход к главным достопримечательностям.',
                'address' => 'Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.02556,
                'lng' => 28.82782,
                'duration' => 35,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'cathedral-park',
                'category' => 'free-places',
                'name' => 'Соборный парк',
                'short_description' => 'Зелёная площадь вокруг Кафедрального собора.',
                'description' => 'Один из самых узнаваемых городских ансамблей: Соборный парк, колокольня, Триумфальная арка и открытое пространство для неторопливой прогулки.',
                'address' => 'Piața Marii Adunări Naționale',
                'lat' => 47.0257107,
                'lng' => 28.8340321,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'dendrarium-park',
                'category' => 'parks',
                'name' => 'Дендрарий',
                'short_description' => 'Большой зелёный парк в Буюканах.',
                'description' => 'Дендрарий ценят за ухоженные дорожки, редкие растения и спокойную атмосферу. Подходит для свиданий, семейных прогулок и тихого маршрута без спешки.',
                'address' => 'Sectorul Buiucani',
                'lat' => 47.033405,
                'lng' => 28.807665,
                'duration' => 75,
                'price_min' => 10,
                'price_max' => 25,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'botanical-garden',
                'category' => 'parks',
                'name' => 'Ботанический сад',
                'short_description' => 'Большой ботанический комплекс в районе Ботаника.',
                'description' => 'Ботанический сад Академии наук — место для длинных прогулок, сезонных фото и отдыха среди зелени на юге города.',
                'address' => '18, sectorul Botanica',
                'lat' => 46.97436,
                'lng' => 28.8852252,
                'duration' => 90,
                'price_min' => 10,
                'price_max' => 40,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'valea-morilor-park',
                'category' => 'romance',
                'name' => 'Парк Валя Морилор',
                'short_description' => 'Озеро, лестницы и один из лучших прогулочных кругов.',
                'description' => 'Валя Морилор — один из самых атмосферных парков Кишинёва: озеро, каскадные лестницы, зелёные склоны и удобный маршрут для прогулки на 1–2 часа.',
                'address' => 'Sectorul Buiucani / Centru',
                'lat' => 47.0140737,
                'lng' => 28.8107114,
                'duration' => 80,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'la-izvor-park',
                'category' => 'parks',
                'name' => 'Парк Ла Извор',
                'short_description' => 'Большой парк с озёрами и широкими прогулочными зонами.',
                'description' => 'Ла Извор подходит для длинной прогулки, велосипедного настроения и спокойного дня рядом с водой.',
                'address' => 'Calea Ieșilor',
                'lat' => 47.0479299,
                'lng' => 28.7927427,
                'duration' => 90,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'alunelul-park',
                'category' => 'parks',
                'name' => 'Парк Алунелул',
                'short_description' => 'Небольшой районный парк в Буюканах.',
                'description' => 'Алунелул — уютный парк для короткой прогулки, отдыха на лавочке и маршрута без большого потока туристов.',
                'address' => 'Calea Ieșilor',
                'lat' => 47.038124,
                'lng' => 28.8052541,
                'duration' => 35,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'rose-valley-park',
                'category' => 'parks',
                'name' => 'Парк Валя Трандафирилор',
                'short_description' => 'Парк с озёрами в районе Ботаника.',
                'description' => 'Валя Трандафирилор, или Долина роз, — популярное место для прогулок у воды, семейного отдыха и вечернего маршрута.',
                'address' => 'Sectorul Botanica',
                'lat' => 46.9972459,
                'lng' => 28.8408507,
                'duration' => 70,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/relation/13721147',
                'image' => '/images/fallbacks/park.svg',
            ],
            [
                'slug' => 'afghanistan-park',
                'category' => 'history',
                'name' => 'Парк «Герои Отечества»',
                'short_description' => 'Парк и мемориальный комплекс в Рышкановке.',
                'description' => 'Парк известен мемориалом, посвящённым погибшим в Афганской войне. Это спокойная историческая точка для маршрута в северной части города.',
                'address' => 'Sectorul Rîșcani',
                'lat' => 47.0496594,
                'lng' => 28.8656295,
                'duration' => 35,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/obiective/parcuri/',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'green-theater',
                'category' => 'culture',
                'name' => 'Зелёный театр',
                'short_description' => 'Открытая сцена в парке Валя Морилор.',
                'description' => 'Зелёный театр — летняя сцена и узнаваемая культурная точка в Валя Морилор. Хорошо ложится в вечерние и фото-маршруты.',
                'address' => 'Strada Timiș, Valea Morilor',
                'lat' => 47.0164379,
                'lng' => 28.8191297,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 200,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'national-history-museum',
                'category' => 'museums',
                'name' => 'Национальный музей истории Молдовы',
                'short_description' => 'Главный исторический музей страны.',
                'description' => 'Музей в центре города знакомит с историей Молдовы от древности до современности. Во дворе находится копия Капитолийской волчицы.',
                'address' => '121A, Strada 31 August 1989',
                'lat' => 47.0226545,
                'lng' => 28.8279769,
                'duration' => 90,
                'price_min' => 10,
                'price_max' => 50,
                'official' => 'https://www.nationalmuseum.md/en/',
                'source' => 'https://visit.chisinau.md/en/obiective_turistice/muzeul-national-de-istorie/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'ethnography-natural-history-museum',
                'category' => 'museums',
                'name' => 'Национальный музей этнографии и естественной истории',
                'short_description' => 'Старейший музей Молдовы в выразительном историческом здании.',
                'description' => 'Музей известен коллекциями по природе, человеку и культуре, а также архитектурой здания на улице Михаила Когэлничану.',
                'address' => '82, Strada Mihail Kogălniceanu',
                'lat' => 47.0234934,
                'lng' => 28.8207837,
                'duration' => 90,
                'price_min' => 10,
                'price_max' => 50,
                'source' => 'https://visit.chisinau.md/en/obiective_turistice/muzeul-national-de-etnografie-si-istorie-naturala/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'national-art-museum',
                'category' => 'museums',
                'name' => 'Национальный художественный музей Молдовы',
                'short_description' => 'Ключевой художественный музей в центре.',
                'description' => 'Музей расположен в историческом здании и показывает молдавское и европейское искусство. Хорошая точка для спокойного культурного маршрута.',
                'address' => '115, Strada 31 August 1989',
                'lat' => 47.0218411,
                'lng' => 28.8296133,
                'duration' => 75,
                'price_min' => 10,
                'price_max' => 60,
                'official' => 'https://www.mnam.md/en',
                'source' => 'https://visit.chisinau.md/en/obiective_turistice/muzeul-national-de-arta-al-moldovei/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'water-tower-city-museum',
                'category' => 'museums',
                'name' => 'Музей города Кишинёва — Водонапорная башня',
                'short_description' => 'Историческая башня и городская смотровая точка.',
                'description' => 'Водонапорная башня — архитектурный символ конца XIX века, где сегодня работает Музей города Кишинёва.',
                'address' => 'Strada Alexei Mateevici',
                'lat' => 47.0226,
                'lng' => 28.8197,
                'duration' => 45,
                'price_min' => 10,
                'price_max' => 40,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'pushkin-house-museum',
                'category' => 'museums',
                'name' => 'Дом-музей Александра Пушкина',
                'short_description' => 'Музей в доме, связанном с периодом ссылки поэта.',
                'description' => 'Дом-музей Александра Пушкина — камерная историко-литературная точка в старой части Кишинёва.',
                'address' => '19, Strada Anton Pann',
                'lat' => 47.0317364,
                'lng' => 28.836731,
                'duration' => 45,
                'price_min' => 10,
                'price_max' => 40,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'military-history-museum',
                'category' => 'museums',
                'name' => 'Военно-исторический музей',
                'short_description' => 'Музей с военными документами, фотографиями и экспонатами.',
                'description' => 'Военно-исторический музей подходит для маршрута о XX веке, памяти и военной истории Молдовы.',
                'address' => '47, Strada Tighina',
                'lat' => 47.0160147,
                'lng' => 28.8402887,
                'duration' => 60,
                'price_min' => 10,
                'price_max' => 50,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'zemstvo-museum',
                'category' => 'museums',
                'name' => 'Земский музей',
                'short_description' => 'Историческое здание и музей на улице Алексея Щусева.',
                'description' => 'Земский музей расположен в здании бывшего приюта и губернской земской управы Бессарабии. Это место для любителей городской истории и архитектуры.',
                'address' => '103, Strada Alexei Șciusev',
                'lat' => 47.0237232,
                'lng' => 28.8217614,
                'duration' => 45,
                'price_min' => 0,
                'price_max' => 40,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/museum.svg',
            ],
            [
                'slug' => 'village-museum',
                'category' => 'family',
                'name' => 'Музей села',
                'short_description' => 'Этнографический музей у городских ворот.',
                'description' => 'Музей села показывает традиционную архитектуру и атмосферу молдавского села. Подходит для семейной прогулки и спокойных фото.',
                'address' => 'Băcioi / Porțile Orașului',
                'lat' => 46.9638924,
                'lng' => 28.8747369,
                'duration' => 75,
                'price_min' => 10,
                'price_max' => 50,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/family.svg',
            ],
            [
                'slug' => 'coffeegrinder-museum-cafe',
                'category' => 'cafes',
                'name' => 'CoffeeGrinder — Coffee Museum Cafe',
                'short_description' => 'Кофейная точка с музейной идеей.',
                'description' => 'CoffeeGrinder соединяет формат кафе и небольшого музея кофе. Хорошая остановка между культурными точками в центре.',
                'address' => 'Chișinău',
                'lat' => 47.0217,
                'lng' => 28.8322,
                'duration' => 45,
                'price_min' => 60,
                'price_max' => 180,
                'source' => 'https://visit.chisinau.md/en/obiective/muzee/',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'triumphal-arch',
                'category' => 'architecture',
                'name' => 'Триумфальная арка',
                'short_description' => 'Один из главных символов центра Кишинёва.',
                'description' => 'Триумфальная арка стоит рядом с Соборным парком и Кафедральным собором. Это обязательная точка короткого маршрута по центру.',
                'address' => 'Piața Marii Adunări Naționale',
                'lat' => 47.024731,
                'lng' => 28.832597,
                'duration' => 15,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/relation/20340431',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'nativity-cathedral',
                'category' => 'architecture',
                'name' => 'Кафедральный собор Рождества Христова',
                'short_description' => 'Главный собор в центре города.',
                'description' => 'Кафедральный собор Рождества Христова формирует центральный ансамбль Кишинёва вместе с колокольней, парком и Триумфальной аркой.',
                'address' => '138, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0260616,
                'lng' => 28.8345281,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/way/25764333',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'stephen-great-monument',
                'category' => 'history',
                'name' => 'Памятник Штефану чел Маре',
                'short_description' => 'Исторический памятник у входа в центральный парк.',
                'description' => 'Памятник господарю Штефану чел Маре — узнаваемый ориентир и удобная стартовая точка для прогулки по бульвару.',
                'address' => 'Strada Mitropolit Gavriil Bănulescu-Bodoni',
                'lat' => 47.0255105,
                'lng' => 28.8303111,
                'duration' => 15,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'chisinau-city-hall',
                'category' => 'architecture',
                'name' => 'Здание мэрии Кишинёва',
                'short_description' => 'Историческое здание начала XX века на главном бульваре.',
                'description' => 'Здание мэрии — архитектурная доминанта центрального бульвара и хороший пункт для маршрута по наследию Бернардацци.',
                'address' => '83, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0227905,
                'lng' => 28.8345816,
                'duration' => 15,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://visit.chisinau.md/en/',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'parliament-moldova',
                'category' => 'architecture',
                'name' => 'Парламент Республики Молдова',
                'short_description' => 'Современная государственная архитектура на центральном бульваре.',
                'description' => 'Здание Парламента интересно как часть административного центра города и хорошо сочетается с прогулкой у Оперного театра и Президентуры.',
                'address' => '105, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0272882,
                'lng' => 28.8263403,
                'duration' => 15,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/relation/17536997',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'presidency-moldova',
                'category' => 'architecture',
                'name' => 'Здание Президентуры Республики Молдова',
                'short_description' => 'Административное здание рядом с Парламентом.',
                'description' => 'Президентура — заметная точка на центральном бульваре, которую удобно включить в обзорный маршрут по государственному центру.',
                'address' => '154, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0284179,
                'lng' => 28.8281408,
                'duration' => 15,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/way/27616508',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'organ-hall',
                'category' => 'culture',
                'name' => 'Органный зал',
                'short_description' => 'Концертная площадка в историческом здании.',
                'description' => 'Органный зал — камерная культурная точка рядом с мэрией и Национальным театром. Подходит для маршрута с музыкой и архитектурой.',
                'address' => '81, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0221983,
                'lng' => 28.8349736,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 250,
                'source' => 'https://www.openstreetmap.org/way/25192896',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'national-opera-ballet',
                'category' => 'culture',
                'name' => 'Национальный театр оперы и балета «Мария Биешу»',
                'short_description' => 'Главная оперная сцена Молдовы.',
                'description' => 'Театр оперы и балета расположен на центральном бульваре и является одной из ключевых культурных остановок города.',
                'address' => '152, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0278898,
                'lng' => 28.8302194,
                'duration' => 45,
                'price_min' => 80,
                'price_max' => 500,
                'official' => 'https://www.tnob.md/en',
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'mihai-eminescu-theater',
                'category' => 'culture',
                'name' => 'Национальный театр «Михай Эминеску»',
                'short_description' => 'Один из главных драматических театров города.',
                'description' => 'Театр «Михай Эминеску» находится в самом центре и хорошо подходит для культурного вечера или маршрута по театрам.',
                'address' => '79, Strada Mihai Eminescu',
                'lat' => 47.0215434,
                'lng' => 28.8359073,
                'duration' => 45,
                'price_min' => 80,
                'price_max' => 300,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'eugene-ionesco-theater',
                'category' => 'culture',
                'name' => 'Национальный театр «Eugene Ionesco»',
                'short_description' => 'Современный театр в центральной части города.',
                'description' => 'Театр «Eugene Ionesco» — важная независимая культурная точка для тех, кто хочет добавить в маршрут современную сцену.',
                'address' => '11, Bulevardul Grigore Vieru',
                'lat' => 47.0310707,
                'lng' => 28.8406116,
                'duration' => 45,
                'price_min' => 80,
                'price_max' => 300,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'satiricus-theater',
                'category' => 'culture',
                'name' => 'Театр Satiricus Ion Luca Caragiale',
                'short_description' => 'Муниципальный театр сатиры и драмы.',
                'description' => 'Satiricus — центральная театральная точка для лёгкого вечернего маршрута с культурным акцентом.',
                'address' => '55, Strada Mihai Eminescu',
                'lat' => 47.0230058,
                'lng' => 28.8381019,
                'duration' => 45,
                'price_min' => 80,
                'price_max' => 250,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'luceafarul-theater',
                'category' => 'culture',
                'name' => 'Театр «Luceafărul»',
                'short_description' => 'Республиканский театр для детей и молодёжи.',
                'description' => 'Театр «Luceafărul» подходит для семейных и молодёжных культурных маршрутов в центре.',
                'address' => 'Strada Veronica Micle',
                'lat' => 47.0199999,
                'lng' => 28.8357464,
                'duration' => 45,
                'price_min' => 60,
                'price_max' => 250,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'guguta-puppet-theater',
                'category' => 'family',
                'name' => 'Муниципальный театр кукол «Гугуцэ»',
                'short_description' => 'Детский кукольный театр в секторе Чеканы.',
                'description' => '«Гугуцэ» — семейная культурная остановка для маршрутов с детьми и спокойного выходного.',
                'address' => '1, Strada Maria Drăgan',
                'lat' => 47.0302488,
                'lng' => 28.8850582,
                'duration' => 45,
                'price_min' => 50,
                'price_max' => 180,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/family.svg',
            ],
            [
                'slug' => 'licurici-puppet-theater',
                'category' => 'family',
                'name' => 'Республиканский театр кукол «Licurici»',
                'short_description' => 'Кукольный театр рядом с музеями центра.',
                'description' => '«Licurici» — классическая семейная точка в центре, рядом с Национальным музеем истории и художественным музеем.',
                'address' => '121, Strada 31 August 1989',
                'lat' => 47.0221699,
                'lng' => 28.8291282,
                'duration' => 45,
                'price_min' => 50,
                'price_max' => 180,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/family.svg',
            ],
            [
                'slug' => 'national-palace-nicolae-sulac',
                'category' => 'culture',
                'name' => 'Национальный дворец «Nicolae Sulac»',
                'short_description' => 'Крупная концертная и фестивальная площадка.',
                'description' => 'Национальный дворец — место концертов и крупных событий, расположенное в центре рядом с главной площадью.',
                'address' => '21, Piața Marii Adunări Naționale',
                'lat' => 47.022597,
                'lng' => 28.8312144,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 500,
                'source' => 'https://visit.chisinau.md/en/obiective/teatre/',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'ciuflea-monastery',
                'category' => 'architecture',
                'name' => 'Свято-Теодоро-Тироновский монастырь (Ciuflea)',
                'short_description' => 'Яркий монастырский комплекс недалеко от центра.',
                'description' => 'Монастырь Ciuflea — заметная архитектурная и духовная точка рядом с центральной частью города.',
                'address' => '14, Strada Ciuflea',
                'lat' => 47.0127527,
                'lng' => 28.8471139,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q19315589',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'mazarache-church',
                'category' => 'hidden-places',
                'name' => 'Мазаракиевская церковь',
                'short_description' => 'Одна из старейших церквей Кишинёва.',
                'description' => 'Мазаракиевская церковь — историческая точка в старой части города, хорошо подходящая для маршрута о раннем Кишинёве.',
                'address' => '3/5, Strada Măzărachi',
                'lat' => 47.0309923,
                'lng' => 28.8489941,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'https://www.openstreetmap.org/way/145671580',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'saint-teodora-sihla-church',
                'category' => 'architecture',
                'name' => 'Церковь Святой Теодоры де ла Сихла',
                'short_description' => 'Историческая церковь в центре города.',
                'description' => 'Церковь Святой Теодоры де ла Сихла — выразительная точка для архитектурной прогулки по центральным улицам.',
                'address' => 'Strada Pușkin / Strada București',
                'lat' => 47.0189,
                'lng' => 28.8329,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q12721761',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'armenian-church-saint-mary',
                'category' => 'hidden-places',
                'name' => 'Армянская церковь Святой Богородицы',
                'short_description' => 'Историческая церковь в старой части Кишинёва.',
                'description' => 'Армянская церковь Святой Богородицы добавляет маршруту слой старого многонационального Кишинёва.',
                'address' => '8, Strada Piața Veche',
                'lat' => 47.0307862,
                'lng' => 28.8437632,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q12721780',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'cathedral-divine-providence',
                'category' => 'architecture',
                'name' => 'Католический собор Божественного Провидения',
                'short_description' => 'Католический собор рядом с центральным парком.',
                'description' => 'Собор Божественного Провидения — спокойная архитектурная точка рядом с парком Штефана чел Маре.',
                'address' => '85, Strada Mitropolit Dosoftei',
                'lat' => 47.0290834,
                'lng' => 28.8291522,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q12723696',
                'image' => '/images/fallbacks/city.svg',
            ],
            [
                'slug' => 'central-market',
                'category' => 'food',
                'name' => 'Центральный рынок',
                'short_description' => 'Живой городской рынок рядом с центром.',
                'description' => 'Центральный рынок — шумная, настоящая городская точка: фрукты, локальные продукты, быстрые покупки и ощущение повседневного Кишинёва.',
                'address' => '63, Strada Mitropolit Varlaam',
                'lat' => 47.0195174,
                'lng' => 28.8428251,
                'duration' => 50,
                'price_min' => 20,
                'price_max' => 200,
                'source' => 'http://www.wikidata.org/entity/Q19708311',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'bucuria-confectionery',
                'category' => 'food',
                'name' => 'Bucuria',
                'short_description' => 'Молдавские сладости и классический сувенирный вкус.',
                'description' => 'Bucuria — узнаваемый бренд молдавских конфет. Подходит как короткая вкусная остановка или сувенирная точка.',
                'address' => '12, Strada Nikolai Zelinski',
                'lat' => 46.9926489,
                'lng' => 28.859769,
                'duration' => 25,
                'price_min' => 30,
                'price_max' => 250,
                'source' => 'https://visit.chisinau.md/en/',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'vatra-neamului',
                'category' => 'food',
                'name' => 'Vatra Neamului',
                'short_description' => 'Ресторан с молдавской кухней в центре.',
                'description' => 'Vatra Neamului — вариант для маршрута с национальной кухней после музеев или прогулки по бульвару.',
                'address' => '20B, Strada Alexandr Pușkin',
                'lat' => 47.0202895,
                'lng' => 28.8293517,
                'duration' => 75,
                'price_min' => 180,
                'price_max' => 500,
                'source' => 'https://www.openstreetmap.org/node/837536010',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'la-placinte-stefan-cel-mare',
                'category' => 'food',
                'name' => 'La Plăcinte на Штефан чел Маре',
                'short_description' => 'Доступная молдавская кухня в центре.',
                'description' => 'La Plăcinte — удобная остановка для плацинд, супов и простой еды в маршруте по центральному бульвару.',
                'address' => '3, Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.0148024,
                'lng' => 28.8463358,
                'duration' => 60,
                'price_min' => 120,
                'price_max' => 300,
                'source' => 'https://www.openstreetmap.org/node/11253491941',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'creme-de-la-creme',
                'category' => 'cafes',
                'name' => 'Crème de la Crème',
                'short_description' => 'Кафе-кондитерская в центральной части города.',
                'description' => 'Crème de la Crème подходит для кофе, десерта и короткой паузы между театрами, музеями и прогулкой по старому центру.',
                'address' => '98A, Strada Alexandru cel Bun',
                'lat' => 47.0278105,
                'lng' => 28.8367444,
                'duration' => 45,
                'price_min' => 80,
                'price_max' => 250,
                'source' => 'https://www.openstreetmap.org/node/1274099138',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'tucano-coffee-costa-rica',
                'category' => 'cafes',
                'name' => 'Tucano Coffee Costa Rica',
                'short_description' => 'Популярная кофейная точка у старого центра.',
                'description' => 'Tucano Coffee — удобная остановка для кофе перед музеем, театром или прогулкой по улице Пушкина.',
                'address' => '15, Strada Alexandr Pușkin',
                'lat' => 47.020607,
                'lng' => 28.8293329,
                'duration' => 40,
                'price_min' => 60,
                'price_max' => 180,
                'source' => 'https://www.openstreetmap.org/node/1617265006',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'delice-dange',
                'category' => 'cafes',
                'name' => 'Délice d’Ange',
                'short_description' => 'Кофе и десерты рядом с музеями центра.',
                'description' => 'Délice d’Ange — компактная сладкая остановка рядом с художественным музеем и Национальным музеем истории.',
                'address' => '117/2, Strada 31 August 1989',
                'lat' => 47.0222959,
                'lng' => 28.8296181,
                'duration' => 40,
                'price_min' => 70,
                'price_max' => 220,
                'source' => 'https://www.openstreetmap.org/node/5809652389',
                'image' => '/images/fallbacks/cafe.svg',
            ],
            [
                'slug' => 'chisinau-zoo',
                'category' => 'family',
                'name' => 'Кишинёвский зоопарк',
                'short_description' => 'Классическая семейная точка на Ботанике.',
                'description' => 'Кишинёвский зоопарк работает как отдельный семейный пункт или часть маршрута с Ботаническим садом и Музеем села.',
                'address' => '50/4, Bulevardul Dacia',
                'lat' => 46.9725673,
                'lng' => 28.8682047,
                'duration' => 120,
                'price_min' => 30,
                'price_max' => 100,
                'source' => 'https://visit.chisinau.md/en/',
                'image' => '/images/fallbacks/family.svg',
            ],
            [
                'slug' => 'malldova',
                'category' => 'family',
                'name' => 'Shopping MallDova',
                'short_description' => 'Крупный торговый центр для семейной паузы.',
                'description' => 'MallDova можно использовать как практичную остановку: еда, покупки, кино и укрытие от плохой погоды.',
                'address' => 'Strada Arborilor / Melestiu',
                'lat' => 47.0045962,
                'lng' => 28.8405485,
                'duration' => 75,
                'price_min' => 0,
                'price_max' => 600,
                'source' => 'https://www.openstreetmap.org/relation/17775548',
                'image' => '/images/fallbacks/family.svg',
            ],
            [
                'slug' => 'eternity-memorial',
                'category' => 'history',
                'name' => 'Мемориальный комплекс «Вечность»',
                'short_description' => 'Крупный мемориальный ансамбль недалеко от центра.',
                'description' => 'Мемориальный комплекс «Вечность» — серьёзная историческая остановка, которую лучше включать в спокойный дневной маршрут.',
                'address' => 'Centrul Istoric',
                'lat' => 47.0091337,
                'lng' => 28.8324375,
                'duration' => 35,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q39058860',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'capitoline-wolf',
                'category' => 'photo-spots',
                'name' => 'Капитолийская волчица',
                'short_description' => 'Небольшой памятник у Национального музея истории.',
                'description' => 'Капитолийская волчица — узнаваемая фото-точка рядом с Национальным музеем истории Молдовы.',
                'address' => 'Strada 31 August 1989',
                'lat' => 47.0229233,
                'lng' => 28.8285421,
                'duration' => 10,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q5035974',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'alley-of-classics',
                'category' => 'photo-spots',
                'name' => 'Аллея классиков',
                'short_description' => 'Скульптурная аллея в центральном парке.',
                'description' => 'Аллея классиков объединяет бюсты литераторов и культурных деятелей. Это короткая, но насыщенная остановка в парке Штефана чел Маре.',
                'address' => 'Grădina Publică Ștefan cel Mare',
                'lat' => 47.0258914,
                'lng' => 28.8286383,
                'duration' => 20,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q4062622',
                'image' => '/images/fallbacks/history.svg',
            ],
            [
                'slug' => 'municipal-library-hasdeu',
                'category' => 'culture',
                'name' => 'Муниципальная библиотека B. P. Hasdeu',
                'short_description' => 'Центральная городская библиотека.',
                'description' => 'Библиотека B. P. Hasdeu — спокойная культурная точка рядом с центральным парком, хорошая для маршрута о городской литературной жизни.',
                'address' => 'Bulevardul Ștefan cel Mare și Sfânt',
                'lat' => 47.02602,
                'lng' => 28.83076,
                'duration' => 30,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q2326827',
                'image' => '/images/fallbacks/culture.svg',
            ],
            [
                'slug' => 'chisinau-railway-station',
                'category' => 'architecture',
                'name' => 'Железнодорожный вокзал Кишинёва',
                'short_description' => 'Исторический вокзал и городские ворота поезда.',
                'description' => 'Железнодорожный вокзал интересен архитектурой, городской историей и как финальная точка маршрута по южной части центра.',
                'address' => 'Piața Gării',
                'lat' => 47.0125,
                'lng' => 28.8597222,
                'duration' => 25,
                'price_min' => 0,
                'price_max' => 0,
                'source' => 'http://www.wikidata.org/entity/Q4222669',
                'image' => '/images/fallbacks/city.svg',
            ],
        ];

        $places = [];

        foreach ($items as $item) {
            $priceMin = $item['price_min'];
            $priceMax = $item['price_max'];

            $places[$item['slug']] = Place::query()->updateOrCreate(
                [
                    'city_id' => $city->id,
                    'slug' => $item['slug'],
                ],
                [
                    'category_id' => $categories[$item['category']]->id,
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'short_description' => $item['short_description'],
                    'address' => $item['address'],
                    'lat' => $item['lat'],
                    'lng' => $item['lng'],
                    'average_price_min' => $priceMin,
                    'average_price_max' => $priceMax,
                    'currency_code' => 'MDL',
                    'visit_duration_minutes' => $item['duration'],
                    'verification_status' => Place::STATUS_VERIFIED,
                    'source_type' => Place::SOURCE_OFFICIAL,
                    'official_url' => $item['official'] ?? null,
                    'google_maps_url' => $this->googleMapsUrl($item['lat'], $item['lng']),
                    'yandex_maps_url' => $this->yandexMapsUrl($item['lat'], $item['lng']),
                    'external_source_url' => $item['source'],
                    'image_url' => $item['image'],
                    'is_active' => true,
                ],
            );

            $places[$item['slug']]->photos()->updateOrCreate(
                ['image_url' => $item['image']],
                ['source' => 'Local fallback image'],
            );
        }

        return $places;
    }

    /**
     * @param array<string, Category> $categories
     *
     * @throws JsonException
     */
    private function seedImportedPlaces(City $city, array $categories): void
    {
        $path = database_path('data/chisinau_places_geocoded.json');

        if (! file_exists($path)) {
            return;
        }

        $items = json_decode(file_get_contents($path) ?: '[]', true, 512, JSON_THROW_ON_ERROR);
        $knownPlaces = Place::query()
            ->where('city_id', $city->id)
            ->get(['name', 'category_id', 'lat', 'lng'])
            ->map(fn (Place $place) => [
                'name' => $this->normalizePlaceName($place->name),
                'category_id' => $place->category_id,
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
            ])
            ->all();

        foreach ($items as $item) {
            if (! is_array($item) || ! $this->shouldImportPlaceCandidate($item)) {
                continue;
            }

            $categorySlug = $this->importedPlaceCategorySlug((string) ($item['category'] ?? ''));

            if (! isset($categories[$categorySlug])) {
                continue;
            }

            $category = $categories[$categorySlug];
            $geocode = $item['geocode'];
            $lat = (float) $geocode['lat'];
            $lng = (float) $geocode['lng'];
            $name = trim((string) $item['name']);

            if ($name === '' || $this->hasExistingPlaceMatch($knownPlaces, $name, $category->id, $lat, $lng)) {
                continue;
            }

            $verificationStatus = match (true) {
                ($item['source_verification_status'] ?? null) === 'seed_verified' => Place::STATUS_VERIFIED,
                (bool) ($item['allow_outside_city'] ?? false) => Place::STATUS_USER_ADDED,
                default => Place::STATUS_COMMUNITY_CONFIRMED,
            };

            $image = $item['image_url'] ?: $this->fallbackImageForCategory($categorySlug);

            $place = Place::query()->create([
                'city_id' => $city->id,
                'category_id' => $category->id,
                'name' => $name,
                'slug' => UniqueSlug::make(
                    Place::class,
                    $name,
                    fn ($query) => $query->where('city_id', $city->id),
                ),
                'description' => $this->cleanImportedDescription($item),
                'short_description' => $item['short_description'] ?: null,
                'address' => $item['address'] ?: null,
                'lat' => $lat,
                'lng' => $lng,
                'average_price_min' => $item['price_from'],
                'average_price_max' => $item['price_to'],
                'currency_code' => $item['currency'] ?: $city->currency_code,
                'visit_duration_minutes' => $item['visit_duration_minutes'],
                'verification_status' => $verificationStatus,
                'source_type' => Place::SOURCE_IMPORTED,
                'official_url' => $item['official_url'] ?: null,
                'google_maps_url' => $this->googleMapsUrl($lat, $lng),
                'yandex_maps_url' => $this->yandexMapsUrl($lat, $lng),
                'external_source_url' => $item['external_source_url'] ?: 'https://photon.komoot.io/',
                'image_url' => $image,
                'is_active' => true,
            ]);

            $place->photos()->updateOrCreate(
                ['image_url' => $image],
                ['source' => 'Local fallback image'],
            );

            $knownPlaces[] = [
                'name' => $this->normalizePlaceName($place->name),
                'category_id' => $place->category_id,
                'lat' => (float) $place->lat,
                'lng' => (float) $place->lng,
            ];
        }
    }

    /**
     * @param array<string, mixed> $item
     */
    private function shouldImportPlaceCandidate(array $item): bool
    {
        if (! isset($item['geocode']) || ! is_array($item['geocode'])) {
            return false;
        }

        $type = (string) ($item['geocode']['type'] ?? '');

        if ($type === '' || in_array($type, ['advertising_agency', 'bus_stop', 'car_wash', 'stop', 'vacant'], true)) {
            return false;
        }

        $category = (string) ($item['category'] ?? '');
        $allowedTypes = match ($category) {
            'Архитектура' => ['aerodrome', 'attraction', 'commercial', 'courthouse', 'diplomatic', 'government', 'house', 'library', 'office', 'public', 'townhall', 'university', 'yes'],
            'Винный бар' => ['bar', 'pub', 'restaurant', 'wine'],
            'Винодельня' => ['attraction', 'industrial', 'restaurant', 'wine'],
            'Выездной маршрут' => ['attraction', 'castle', 'monastery', 'place_of_worship', 'public', 'town', 'village'],
            'Галерея' => ['arts_centre', 'association', 'gallery', 'museum'],
            'Еда' => ['bakery', 'cafe', 'confectionery', 'fast_food', 'restaurant', 'supermarket'],
            'Информация' => ['office', 'travel_agency'],
            'Кафе' => ['bakery', 'cafe', 'confectionery', 'fast_food', 'pub', 'restaurant'],
            'Культура' => ['arts_centre', 'association', 'library', 'museum', 'ngo', 'theatre', 'university', 'yes'],
            'Локальный опыт' => ['baby_goods', 'beauty', 'commercial', 'company', 'department_store', 'doityourself', 'electronics', 'gift', 'mobile_phone', 'retail', 'supermarket', 'travel_agency', 'veterinary'],
            'Музей' => ['arts_centre', 'attraction', 'gallery', 'military', 'museum'],
            'Памятник' => ['attraction', 'monument', 'public'],
            'Парк' => ['garden', 'park', 'wood'],
            'Площадь' => ['attraction', 'pedestrian', 'square'],
            'Прогулка' => ['neighbourhood', 'pedestrian', 'primary', 'quarter', 'residential', 'secondary', 'suburb', 'tertiary'],
            'Развлечения' => ['attraction', 'bar', 'beauty', 'cinema', 'party', 'pub', 'restaurant', 'sports_centre'],
            'Ресторан' => ['bar', 'cafe', 'fast_food', 'pub', 'restaurant', 'wine'],
            'Рынок' => ['marketplace', 'retail', 'supermarket'],
            'Семья' => ['attraction', 'baby_goods', 'mall', 'park', 'school', 'sports_centre', 'veterinary'],
            'Спорт' => ['pitch', 'sports_centre', 'stadium'],
            'Театр' => ['arts_centre', 'theatre'],
            'Торговый центр' => ['commercial', 'department_store', 'doityourself', 'electronics', 'mall', 'retail', 'supermarket'],
            'Улица' => ['pedestrian', 'primary', 'residential', 'secondary', 'tertiary'],
            'Фото-место' => ['attraction', 'hostel', 'lake', 'park', 'pedestrian', 'square'],
            'Церковь' => ['monastery', 'place_of_worship'],
            default => [],
        };

        return $allowedTypes === [] || in_array($type, $allowedTypes, true);
    }

    private function importedPlaceCategorySlug(string $category): string
    {
        return match ($category) {
            'Парк' => 'parks',
            'Кафе' => 'cafes',
            'Музей' => 'museums',
            'Архитектура', 'Площадь', 'Улица' => 'architecture',
            'Памятник', 'Церковь' => 'history',
            'Фото-место' => 'photo-spots',
            'Семья' => 'family',
            'Еда', 'Ресторан', 'Рынок', 'Винный бар' => 'food',
            'Галерея', 'Информация', 'Культура', 'Театр' => 'culture',
            'Винодельня', 'Выездной маршрут', 'Локальный опыт', 'Прогулка', 'Развлечения', 'Спорт', 'Торговый центр' => 'hidden-places',
            default => 'hidden-places',
        };
    }

    private function fallbackImageForCategory(string $categorySlug): string
    {
        return match ($categorySlug) {
            'cafes', 'food' => '/images/fallbacks/cafe.svg',
            'culture' => '/images/fallbacks/culture.svg',
            'family' => '/images/fallbacks/family.svg',
            'history' => '/images/fallbacks/history.svg',
            'museums' => '/images/fallbacks/museum.svg',
            'parks' => '/images/fallbacks/park.svg',
            'photo-spots', 'romance' => '/images/fallbacks/romance.svg',
            default => '/images/fallbacks/city.svg',
        };
    }

    /**
     * @param array<string, mixed> $item
     */
    private function cleanImportedDescription(array $item): string
    {
        $description = trim((string) ($item['description'] ?? ''));
        $description = preg_replace('/\s*Данные подходят.+$/u', '', $description) ?: $description;

        return $description !== ''
            ? $description
            : (string) ($item['short_description'] ?? 'Городская точка для маршрутов CityQuest.');
    }

    private function normalizePlaceName(string $name): string
    {
        $normalized = mb_strtolower($name);
        $normalized = str_replace(['ё', 'ă', 'â', 'î', 'ș', 'ş', 'ț', 'ţ'], ['е', 'a', 'a', 'i', 's', 's', 't', 't'], $normalized);

        return preg_replace('/[^\p{L}\p{N}]+/u', '', $normalized) ?: $normalized;
    }

    /**
     * @param array<int, array{name: string, category_id: int, lat: float, lng: float}> $knownPlaces
     */
    private function hasExistingPlaceMatch(array $knownPlaces, string $name, int $categoryId, float $lat, float $lng): bool
    {
        $normalizedName = $this->normalizePlaceName($name);

        foreach ($knownPlaces as $place) {
            if ($place['name'] === $normalizedName) {
                return true;
            }

            $distanceKm = $this->distanceKm($lat, $lng, $place['lat'], $place['lng']);

            if ($distanceKm <= 0.015) {
                return true;
            }

            if ($place['category_id'] === $categoryId && $distanceKm <= 0.05) {
                return true;
            }
        }

        return false;
    }

    private function distanceKm(float $latA, float $lngA, float $latB, float $lngB): float
    {
        $earthRadius = 6371;
        $latDelta = deg2rad($latB - $latA);
        $lngDelta = deg2rad($lngB - $lngA);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($latA)) * cos(deg2rad($latB)) * sin($lngDelta / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * @param array<string, User> $users
     * @param array<string, Place> $places
     *
     * @return array<string, CityRoute>
     */
    private function seedRoutes(City $city, array $users, array $places): array
    {
        $items = [
            [
                'slug' => 'evening-classic',
                'title' => 'Вечерняя классика',
                'description' => 'Мягкий маршрут по главным символам центра: парк, арка, собор и кофе рядом со старым городом.',
                'route_type' => 'walk',
                'vibe' => 'classic',
                'duration' => 150,
                'distance' => 2.4,
                'budget_min' => 60,
                'budget_max' => 180,
                'image' => '/images/fallbacks/romance.svg',
                'author' => 'maria',
                'points' => [
                    ['stefan-cel-mare-central-park', 30, 'Начните с тенистых аллей и спокойного темпа.'],
                    ['stephen-great-monument', 10, 'Короткая историческая остановка у входа в парк.'],
                    ['triumphal-arch', 15, 'Главная фото-точка центральной площади.'],
                    ['cathedral-park', 25, 'Пройдитесь вокруг соборного ансамбля.'],
                    ['nativity-cathedral', 20, 'Зайдите внутрь, если открыт доступ.'],
                    ['tucano-coffee-costa-rica', 40, 'Финал с кофе в старом центре.'],
                ],
            ],
            [
                'slug' => 'romantic-evening-center',
                'title' => 'Романтический вечер в центре',
                'description' => 'Прогулка для двоих: театр, парк, десерт и закатная атмосфера Валя Морилор.',
                'route_type' => 'date',
                'vibe' => 'romantic',
                'duration' => 210,
                'distance' => 3.6,
                'budget_min' => 160,
                'budget_max' => 420,
                'image' => '/images/fallbacks/romance.svg',
                'author' => 'maria',
                'points' => [
                    ['national-opera-ballet', 20, 'Начните у красивого фасада театра.'],
                    ['alley-of-classics', 20, 'Спокойная аллея для неспешного разговора.'],
                    ['delice-dange', 40, 'Короткая остановка на десерт.'],
                    ['water-tower-city-museum', 30, 'Историческая башня и хороший городской акцент.'],
                    ['valea-morilor-park', 75, 'Лучшее завершение у воды.'],
                ],
            ],
            [
                'slug' => 'coffee-and-inspiration',
                'title' => 'Кофе и вдохновение',
                'description' => 'Кофейные паузы, искусство и центр города для спокойного творческого дня.',
                'route_type' => 'cafe_walk',
                'vibe' => 'creative',
                'duration' => 190,
                'distance' => 2.1,
                'budget_min' => 180,
                'budget_max' => 420,
                'image' => '/images/fallbacks/cafe.svg',
                'author' => 'alexander',
                'points' => [
                    ['coffeegrinder-museum-cafe', 40, 'Начните с кофе и небольшой музейной темы.'],
                    ['national-art-museum', 70, 'Основной культурный блок маршрута.'],
                    ['capitoline-wolf', 10, 'Быстрая фото-точка у музея истории.'],
                    ['creme-de-la-creme', 40, 'Пауза на десерт.'],
                    ['organ-hall', 20, 'Финальный архитектурный акцент.'],
                ],
            ],
            [
                'slug' => 'family-day',
                'title' => 'Семейный день',
                'description' => 'Маршрут для выходного с детьми: зоопарк, музей села и зелёные пространства Ботаники.',
                'route_type' => 'family',
                'vibe' => 'easy',
                'duration' => 300,
                'distance' => 5.2,
                'budget_min' => 120,
                'budget_max' => 450,
                'image' => '/images/fallbacks/family.svg',
                'author' => 'ion',
                'points' => [
                    ['chisinau-zoo', 120, 'Главная активность дня.'],
                    ['village-museum', 60, 'Спокойная этнографическая остановка рядом.'],
                    ['botanical-garden', 80, 'Зелёный блок маршрута.'],
                    ['malldova', 60, 'Практичный финал: еда, отдых, покупки.'],
                ],
            ],
            [
                'slug' => 'nature-and-silence',
                'title' => 'Природа и тишина',
                'description' => 'Маршрут без городского шума: большие парки, вода и зелёные паузы.',
                'route_type' => 'walk',
                'vibe' => 'calm',
                'duration' => 280,
                'distance' => 7.8,
                'budget_min' => 0,
                'budget_max' => 80,
                'image' => '/images/fallbacks/park.svg',
                'author' => 'ion',
                'points' => [
                    ['dendrarium-park', 75, 'Самая спокойная зелёная часть маршрута.'],
                    ['alunelul-park', 35, 'Короткая районная остановка.'],
                    ['la-izvor-park', 90, 'Большие пространства и вода.'],
                    ['valea-morilor-park', 70, 'Финальный круг у озера.'],
                ],
            ],
            [
                'slug' => 'historical-walk',
                'title' => 'Историческая прогулка',
                'description' => 'Центральная история города: музеи, памятники, административная архитектура и старый Кишинёв.',
                'route_type' => 'culture',
                'vibe' => 'history',
                'duration' => 260,
                'distance' => 4.2,
                'budget_min' => 50,
                'budget_max' => 150,
                'image' => '/images/fallbacks/history.svg',
                'author' => 'alexander',
                'points' => [
                    ['national-history-museum', 80, 'Главный исторический блок.'],
                    ['capitoline-wolf', 10, 'Фото-точка во дворе музея.'],
                    ['chisinau-city-hall', 15, 'Архитектурная остановка на бульваре.'],
                    ['triumphal-arch', 15, 'Символ центральной площади.'],
                    ['parliament-moldova', 15, 'Государственный центр города.'],
                    ['presidency-moldova', 15, 'Финальная административная точка.'],
                ],
            ],
            [
                'slug' => 'photo-walk',
                'title' => 'Фото-прогулка',
                'description' => 'Маршрут для красивых кадров: башня, музейные фасады, аллеи и вечерняя вода.',
                'route_type' => 'photo',
                'vibe' => 'inspiring',
                'duration' => 220,
                'distance' => 3.9,
                'budget_min' => 0,
                'budget_max' => 100,
                'image' => '/images/fallbacks/city.svg',
                'author' => 'maria',
                'points' => [
                    ['water-tower-city-museum', 30, 'Начните с исторической вертикали.'],
                    ['ethnography-natural-history-museum', 30, 'Фасад музея хорошо смотрится в маршруте.'],
                    ['alley-of-classics', 20, 'Скульптуры и парк.'],
                    ['cathedral-park', 25, 'Открытое пространство центральной площади.'],
                    ['green-theater', 25, 'Необычная сцена в зелени.'],
                    ['valea-morilor-park', 60, 'Финал у озера.'],
                ],
            ],
            [
                'slug' => 'budget-weekend',
                'title' => 'Недорогой маршрут на выходные',
                'description' => 'Бюджетный день в городе: рынок, сладости, бесплатные памятники и старые улицы.',
                'route_type' => 'budget',
                'vibe' => 'local',
                'duration' => 230,
                'distance' => 5.1,
                'budget_min' => 50,
                'budget_max' => 220,
                'image' => '/images/fallbacks/city.svg',
                'author' => 'alexander',
                'points' => [
                    ['central-market', 50, 'Начните с живого местного рынка.'],
                    ['bucuria-confectionery', 25, 'Купите сладкий сувенир.'],
                    ['ciuflea-monastery', 25, 'Красивая бесплатная остановка.'],
                    ['chisinau-railway-station', 25, 'Архитектурная точка у вокзала.'],
                    ['mazarache-church', 30, 'Исторический финал в старой части города.'],
                ],
            ],
        ];

        $routes = [];

        foreach ($items as $item) {
            $routes[$item['slug']] = CityRoute::query()->updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'user_id' => $users[$item['author']]->id ?? null,
                    'city_id' => $city->id,
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'route_type' => $item['route_type'],
                    'vibe' => $item['vibe'],
                    'duration_minutes' => $item['duration'],
                    'distance_km' => $item['distance'],
                    'budget_min' => $item['budget_min'],
                    'budget_max' => $item['budget_max'],
                    'currency_code' => 'MDL',
                    'is_public' => true,
                    'likes_count' => 0,
                    'saves_count' => 0,
                    'image_url' => $item['image'],
                    'created_source' => CityRoute::SOURCE_SHARED,
                ],
            );

            $routes[$item['slug']]->points()->delete();

            foreach ($item['points'] as $index => [$placeSlug, $duration, $note]) {
                $routes[$item['slug']]->points()->create([
                    'place_id' => $places[$placeSlug]->id,
                    'order_number' => $index + 1,
                    'estimated_duration_minutes' => $duration,
                    'note' => $note,
                ]);
            }
        }

        return $routes;
    }

    /**
     * @return array<string, Achievement>
     */
    private function seedAchievements(): array
    {
        $items = [
            'urban-walker' => ['name' => 'Urban Walker', 'description' => 'Открыл первые городские маршруты.', 'icon' => 'Footprints'],
            'coffee-explorer' => ['name' => 'Coffee Explorer', 'description' => 'Нашёл уютные кофейные остановки.', 'icon' => 'Coffee'],
            'park-lover' => ['name' => 'Park Lover', 'description' => 'Выбирает зелёные маршруты и прогулки у воды.', 'icon' => 'Trees'],
            'weekend-starter' => ['name' => 'Weekend Starter', 'description' => 'Собрал идею для выходного дня.', 'icon' => 'CalendarHeart'],
            'hidden-places-finder' => ['name' => 'Hidden Places Finder', 'description' => 'Любит находить менее очевидные городские точки.', 'icon' => 'MapPinned'],
        ];

        $achievements = [];

        foreach ($items as $code => $item) {
            $achievements[$code] = Achievement::query()->updateOrCreate(
                ['code' => $code],
                $item,
            );
        }

        return $achievements;
    }

    /**
     * @param array<string, User> $users
     * @param array<string, Place> $places
     * @param array<string, CityRoute> $routes
     * @param array<string, Achievement> $achievements
     */
    private function seedUserState(array $users, array $places, array $routes, array $achievements): void
    {
        $users['alexander']->savedRoutes()->syncWithoutDetaching([
            $routes['evening-classic']->id,
            $routes['historical-walk']->id,
            $routes['budget-weekend']->id,
        ]);
        $users['maria']->savedRoutes()->syncWithoutDetaching([
            $routes['romantic-evening-center']->id,
            $routes['photo-walk']->id,
        ]);
        $users['ion']->savedRoutes()->syncWithoutDetaching([
            $routes['family-day']->id,
            $routes['nature-and-silence']->id,
        ]);

        $users['alexander']->favoritePlaces()->syncWithoutDetaching([
            $places['national-history-museum']->id,
            $places['central-market']->id,
            $places['mazarache-church']->id,
        ]);
        $users['maria']->favoritePlaces()->syncWithoutDetaching([
            $places['valea-morilor-park']->id,
            $places['delice-dange']->id,
            $places['national-opera-ballet']->id,
        ]);
        $users['ion']->favoritePlaces()->syncWithoutDetaching([
            $places['chisinau-zoo']->id,
            $places['botanical-garden']->id,
            $places['village-museum']->id,
        ]);

        $likes = [
            'evening-classic' => ['alexander', 'maria', 'ion'],
            'romantic-evening-center' => ['alexander', 'maria'],
            'coffee-and-inspiration' => ['alexander', 'maria'],
            'family-day' => ['ion', 'alexander'],
            'nature-and-silence' => ['ion'],
            'historical-walk' => ['alexander', 'ion'],
            'photo-walk' => ['maria', 'alexander'],
            'budget-weekend' => ['alexander', 'ion', 'maria'],
        ];

        foreach ($likes as $routeSlug => $userKeys) {
            foreach ($userKeys as $userKey) {
                $users[$userKey]->likedRoutes()->syncWithoutDetaching([$routes[$routeSlug]->id]);
            }
        }

        foreach ($routes as $route) {
            $route->forceFill([
                'likes_count' => $route->likedByUsers()->count(),
                'saves_count' => $route->savedByUsers()->count(),
            ])->save();
        }

        $users['alexander']->achievements()->syncWithoutDetaching([
            $achievements['urban-walker']->id => ['unlocked_at' => now()->subDays(14)],
            $achievements['coffee-explorer']->id => ['unlocked_at' => now()->subDays(7)],
            $achievements['hidden-places-finder']->id => ['unlocked_at' => now()->subDays(2)],
        ]);
        $users['maria']->achievements()->syncWithoutDetaching([
            $achievements['urban-walker']->id => ['unlocked_at' => now()->subDays(10)],
            $achievements['weekend-starter']->id => ['unlocked_at' => now()->subDays(3)],
        ]);
        $users['ion']->achievements()->syncWithoutDetaching([
            $achievements['park-lover']->id => ['unlocked_at' => now()->subDays(5)],
            $achievements['weekend-starter']->id => ['unlocked_at' => now()->subDay()],
        ]);

        $notifications = [
            ['user' => 'alexander', 'title' => 'Новый маршрут готов', 'body' => 'Попробуйте подборку «Историческая прогулка» в центре Кишинёва.', 'type' => 'route'],
            ['user' => 'alexander', 'title' => 'Место добавлено в избранное', 'body' => 'Национальный музей истории теперь в ваших избранных местах.', 'type' => 'favorite', 'read_at' => now()->subDay()],
            ['user' => 'maria', 'title' => 'Идея для вечера', 'body' => 'Маршрут «Романтический вечер в центре» хорошо подходит для прогулки после 18:00.', 'type' => 'recommendation'],
            ['user' => 'ion', 'title' => 'Семейный маршрут', 'body' => 'Зоопарк, Музей села и Ботанический сад уже ждут в подборке.', 'type' => 'family'],
            ['user' => 'ion', 'title' => 'Достижение открыто', 'body' => 'Вы получили бейдж Park Lover.', 'type' => 'achievement', 'read_at' => now()->subHours(6)],
        ];

        foreach ($notifications as $notification) {
            Notification::query()->updateOrCreate(
                [
                    'user_id' => $users[$notification['user']]->id,
                    'title' => $notification['title'],
                ],
                [
                    'body' => $notification['body'],
                    'type' => $notification['type'],
                    'read_at' => $notification['read_at'] ?? null,
                ],
            );
        }
    }

    private function refreshPlaceLocations(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::statement('UPDATE places SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography');
    }

    private function googleMapsUrl(float $lat, float $lng): string
    {
        return 'https://www.google.com/maps/search/?api=1&query='.rawurlencode($lat.','.$lng);
    }

    private function yandexMapsUrl(float $lat, float $lng): string
    {
        return 'https://yandex.com/maps/?ll='.rawurlencode($lng.','.$lat).'&z=16';
    }
}
