import type {
  Achievement,
  CityQuestNotification,
  CityRoute,
  LanguageCode,
  Place,
  RoutePoint,
  RoutePreviewPlace,
  RoutePreviewVariant,
} from "@/lib/api/types";

type LocaleText = Partial<Record<LanguageCode, string>>;

interface PlaceText {
  shortDescription?: LocaleText;
}

interface PlaceNameText {
  original: string;
  translations: LocaleText;
}

interface RouteText {
  description: LocaleText;
  title: LocaleText;
}

interface LocalizedPlaceContent {
  description: string;
  name: string;
  shortDescription: string | null;
}

interface LocalizedRouteContent {
  description: string | null;
  title: string;
}

interface LocalizedPreviewContent {
  description: string;
  explanation: string;
  title: string;
  tradeoffs: string[];
}

interface LocalizedAchievementContent {
  description: string | null;
  name: string;
}

interface LocalizedNotificationContent {
  body: string | null;
  title: string;
}

const placeTextBySlug: Record<string, PlaceText> = {
  "afghanistan-park": {
    shortDescription: {
      en: "A park and memorial complex in Riscani.",
      ro: "Un parc si complex memorial in Riscani.",
    },
  },
  "alley-of-classics": {
    shortDescription: {
      en: "A sculpture alley in the central park.",
      ro: "O alee cu sculpturi in parcul central.",
    },
  },
  "alunelul-park": {
    shortDescription: {
      en: "A small neighborhood park in Buiucani.",
      ro: "Un mic parc de cartier in Buiucani.",
    },
  },
  "armenian-church-saint-mary": {
    shortDescription: {
      en: "A historic church in old Chisinau.",
      ro: "O biserica istorica in partea veche a Chisinaului.",
    },
  },
  "botanical-garden": {
    shortDescription: {
      en: "A large botanical complex in Botanica.",
      ro: "Un complex botanic mare in sectorul Botanica.",
    },
  },
  "bucuria-confectionery": {
    shortDescription: {
      en: "Moldovan sweets and a classic souvenir stop.",
      ro: "Dulciuri moldovenesti si o oprire clasica pentru suveniruri.",
    },
  },
  "capitoline-wolf": {
    shortDescription: {
      en: "A small monument near the National History Museum.",
      ro: "Un mic monument langa Muzeul National de Istorie.",
    },
  },
  "cathedral-divine-providence": {
    shortDescription: {
      en: "A Catholic cathedral beside the central park.",
      ro: "O catedrala catolica langa parcul central.",
    },
  },
  "cathedral-park": {
    shortDescription: {
      en: "A green square around the Nativity Cathedral.",
      ro: "O piata verde in jurul Catedralei Nasterea Domnului.",
    },
  },
  "central-market": {
    shortDescription: {
      en: "A lively city market close to the center.",
      ro: "O piata urbana vie aproape de centru.",
    },
  },
  "chisinau-city-hall": {
    shortDescription: {
      en: "An early 20th-century landmark on the main boulevard.",
      ro: "O cladire istorica de la inceputul secolului XX pe bulevardul principal.",
    },
  },
  "chisinau-railway-station": {
    shortDescription: {
      en: "A historic railway station and train gateway to the city.",
      ro: "O gara istorica si poarta feroviara a orasului.",
    },
  },
  "chisinau-zoo": {
    shortDescription: {
      en: "A classic family stop in Botanica.",
      ro: "O oprire clasica pentru familie in Botanica.",
    },
  },
  "ciuflea-monastery": {
    shortDescription: {
      en: "A vivid monastery complex near the center.",
      ro: "Un complex monastic expresiv aproape de centru.",
    },
  },
  "coffeegrinder-museum-cafe": {
    shortDescription: {
      en: "A coffee stop with a small museum idea.",
      ro: "O oprire pentru cafea cu o idee de mic muzeu.",
    },
  },
  "creme-de-la-creme": {
    shortDescription: {
      en: "A cafe and pastry stop in the central area.",
      ro: "O cafenea-cofetarie in zona centrala.",
    },
  },
  "delice-dange": {
    shortDescription: {
      en: "Coffee and desserts near the central museums.",
      ro: "Cafea si deserturi langa muzeele din centru.",
    },
  },
  "dendrarium-park": {
    shortDescription: {
      en: "A large green park in Buiucani.",
      ro: "Un parc verde mare in Buiucani.",
    },
  },
  "ethnography-natural-history-museum": {
    shortDescription: {
      en: "Moldova's oldest museum in an expressive historic building.",
      ro: "Cel mai vechi muzeu din Moldova, intr-o cladire istorica expresiva.",
    },
  },
  "eternity-memorial": {
    shortDescription: {
      en: "A major memorial ensemble near the center.",
      ro: "Un ansamblu memorial important aproape de centru.",
    },
  },
  "eugene-ionesco-theater": {
    shortDescription: {
      en: "A contemporary theater in the central city.",
      ro: "Un teatru contemporan in zona centrala.",
    },
  },
  "green-theater": {
    shortDescription: {
      en: "An open-air stage in Valea Morilor Park.",
      ro: "O scena in aer liber in Parcul Valea Morilor.",
    },
  },
  "guguta-puppet-theater": {
    shortDescription: {
      en: "A children's puppet theater in Ciocana.",
      ro: "Un teatru de papusi pentru copii in Ciocana.",
    },
  },
  "la-izvor-park": {
    shortDescription: {
      en: "A large park with lakes and wide walking areas.",
      ro: "Un parc mare cu lacuri si zone largi de plimbare.",
    },
  },
  "la-placinte-stefan-cel-mare": {
    shortDescription: {
      en: "Accessible Moldovan food in the center.",
      ro: "Bucatarie moldoveneasca accesibila in centru.",
    },
  },
  "licurici-puppet-theater": {
    shortDescription: {
      en: "A puppet theater near the central museums.",
      ro: "Un teatru de papusi langa muzeele din centru.",
    },
  },
  "luceafarul-theater": {
    shortDescription: {
      en: "A national theater for children and young people.",
      ro: "Un teatru republican pentru copii si tineri.",
    },
  },
  "malldova": {
    shortDescription: {
      en: "A large shopping center for a family break.",
      ro: "Un centru comercial mare pentru o pauza de familie.",
    },
  },
  "mazarache-church": {
    shortDescription: {
      en: "One of Chisinau's oldest churches.",
      ro: "Una dintre cele mai vechi biserici din Chisinau.",
    },
  },
  "mihai-eminescu-theater": {
    shortDescription: {
      en: "One of the city's main drama theaters.",
      ro: "Unul dintre principalele teatre dramatice ale orasului.",
    },
  },
  "military-history-museum": {
    shortDescription: {
      en: "A museum with military documents, photos and exhibits.",
      ro: "Un muzeu cu documente, fotografii si exponate militare.",
    },
  },
  "municipal-library-hasdeu": {
    shortDescription: {
      en: "The central municipal library.",
      ro: "Biblioteca municipala centrala.",
    },
  },
  "national-art-museum": {
    shortDescription: {
      en: "A key art museum in the center.",
      ro: "Un muzeu de arta important in centru.",
    },
  },
  "national-history-museum": {
    shortDescription: {
      en: "The country's main history museum.",
      ro: "Principalul muzeu de istorie al tarii.",
    },
  },
  "national-opera-ballet": {
    shortDescription: {
      en: "Moldova's main opera stage.",
      ro: "Principala scena de opera a Moldovei.",
    },
  },
  "national-palace-nicolae-sulac": {
    shortDescription: {
      en: "A large concert and festival venue.",
      ro: "O mare sala pentru concerte si festivaluri.",
    },
  },
  "nativity-cathedral": {
    shortDescription: {
      en: "The main cathedral in the city center.",
      ro: "Catedrala principala din centrul orasului.",
    },
  },
  "organ-hall": {
    shortDescription: {
      en: "A concert venue in a historic building.",
      ro: "O sala de concerte intr-o cladire istorica.",
    },
  },
  "parliament-moldova": {
    shortDescription: {
      en: "Modern state architecture on the central boulevard.",
      ro: "Arhitectura administrativa moderna pe bulevardul central.",
    },
  },
  "presidency-moldova": {
    shortDescription: {
      en: "An administrative landmark beside Parliament.",
      ro: "O cladire administrativa langa Parlament.",
    },
  },
  "pushkin-house-museum": {
    shortDescription: {
      en: "A museum house connected with the poet's exile period.",
      ro: "Un muzeu in casa legata de perioada exilului poetului.",
    },
  },
  "rose-valley-park": {
    shortDescription: {
      en: "A park with lakes in Botanica.",
      ro: "Un parc cu lacuri in sectorul Botanica.",
    },
  },
  "saint-teodora-sihla-church": {
    shortDescription: {
      en: "A historic church in the city center.",
      ro: "O biserica istorica in centrul orasului.",
    },
  },
  "satiricus-theater": {
    shortDescription: {
      en: "The municipal theater of satire and drama.",
      ro: "Teatrul municipal de satira si drama.",
    },
  },
  "stefan-cel-mare-central-park": {
    shortDescription: {
      en: "The city's oldest central park with shady alleys.",
      ro: "Cel mai vechi parc central al orasului, cu alei umbroase.",
    },
  },
  "stephen-great-monument": {
    shortDescription: {
      en: "A historic monument at the central park entrance.",
      ro: "Un monument istoric la intrarea in parcul central.",
    },
  },
  "triumphal-arch": {
    shortDescription: {
      en: "One of the main symbols of central Chisinau.",
      ro: "Unul dintre principalele simboluri ale centrului Chisinaului.",
    },
  },
  "tucano-coffee-costa-rica": {
    shortDescription: {
      en: "A popular coffee stop near the old center.",
      ro: "O cafenea populara langa centrul vechi.",
    },
  },
  "valea-morilor-park": {
    shortDescription: {
      en: "A lake, stairs and one of the best walking loops.",
      ro: "Un lac, scari si unul dintre cele mai bune trasee de plimbare.",
    },
  },
  "vatra-neamului": {
    shortDescription: {
      en: "A restaurant with Moldovan cuisine in the center.",
      ro: "Un restaurant cu bucatarie moldoveneasca in centru.",
    },
  },
  "village-museum": {
    shortDescription: {
      en: "An open-air ethnographic museum at the city gates.",
      ro: "Un muzeu etnografic in aer liber la portile orasului.",
    },
  },
  "water-tower-city-museum": {
    shortDescription: {
      en: "A historic tower and city viewpoint.",
      ro: "Un turn istoric si punct de belvedere urban.",
    },
  },
  "zemstvo-museum": {
    shortDescription: {
      en: "A historic building and museum on Alexei Sciusev Street.",
      ro: "O cladire istorica si muzeu pe strada Alexei Sciusev.",
    },
  },
};

const placeNamesBySlug: Record<string, PlaceNameText> = {
  "afghanistan-park": {
    original: "Парк «Герои Отечества»",
    translations: {
      en: "Heroes of the Fatherland Park",
      ro: "Parcul Eroii Patriei",
    },
  },
  "alley-of-classics": {
    original: "Аллея классиков",
    translations: {
      en: "Alley of Classics",
      ro: "Aleea Clasicilor",
    },
  },
  "alunelul-park": {
    original: "Парк Алунелул",
    translations: {
      en: "Alunelul Park",
      ro: "Parcul Alunelul",
    },
  },
  "armenian-church-saint-mary": {
    original: "Армянская церковь Святой Богородицы",
    translations: {
      en: "Armenian Church of Saint Mary",
      ro: "Biserica Armeneasca Sfanta Maria",
    },
  },
  "botanical-garden": {
    original: "Ботанический сад",
    translations: {
      en: "Botanical Garden",
      ro: "Gradina Botanica",
    },
  },
  "bucuria-confectionery": {
    original: "Bucuria",
    translations: {
      en: "Bucuria",
      ro: "Bucuria",
    },
  },
  "capitoline-wolf": {
    original: "Капитолийская волчица",
    translations: {
      en: "Capitoline Wolf",
      ro: "Lupoaica Capitolina",
    },
  },
  "cathedral-divine-providence": {
    original: "Католический собор Божественного Провидения",
    translations: {
      en: "Divine Providence Cathedral",
      ro: "Catedrala Providentei Divine",
    },
  },
  "cathedral-park": {
    original: "Соборный парк",
    translations: {
      en: "Cathedral Park",
      ro: "Parcul Catedralei",
    },
  },
  "central-market": {
    original: "Центральный рынок",
    translations: {
      en: "Central Market",
      ro: "Piata Centrala",
    },
  },
  "chisinau-city-hall": {
    original: "Здание мэрии Кишинёва",
    translations: {
      en: "Chisinau City Hall",
      ro: "Primaria Chisinau",
    },
  },
  "chisinau-railway-station": {
    original: "Железнодорожный вокзал Кишинёва",
    translations: {
      en: "Chisinau Railway Station",
      ro: "Gara Feroviara Chisinau",
    },
  },
  "chisinau-zoo": {
    original: "Кишинёвский зоопарк",
    translations: {
      en: "Chisinau Zoo",
      ro: "Zoo Chisinau",
    },
  },
  "ciuflea-monastery": {
    original: "Свято-Теодоро-Тироновский монастырь (Ciuflea)",
    translations: {
      en: "Ciuflea Monastery",
      ro: "Manastirea Ciuflea",
    },
  },
  "coffeegrinder-museum-cafe": {
    original: "CoffeeGrinder — Coffee Museum Cafe",
    translations: {
      en: "CoffeeGrinder - Coffee Museum Cafe",
      ro: "CoffeeGrinder - Coffee Museum Cafe",
    },
  },
  "creme-de-la-creme": {
    original: "Crème de la Crème",
    translations: {
      en: "Crème de la Crème",
      ro: "Crème de la Crème",
    },
  },
  "delice-dange": {
    original: "Délice d’Ange",
    translations: {
      en: "Délice d'Ange",
      ro: "Délice d'Ange",
    },
  },
  "dendrarium-park": {
    original: "Дендрарий",
    translations: {
      en: "Dendrarium Park",
      ro: "Parcul Dendrarium",
    },
  },
  "ethnography-natural-history-museum": {
    original: "Национальный музей этнографии и естественной истории",
    translations: {
      en: "National Museum of Ethnography and Natural History",
      ro: "Muzeul National de Etnografie si Istorie Naturala",
    },
  },
  "eternity-memorial": {
    original: "Мемориальный комплекс «Вечность»",
    translations: {
      en: "Eternity Memorial Complex",
      ro: "Complexul Memorial Eternitate",
    },
  },
  "eugene-ionesco-theater": {
    original: "Национальный театр «Eugene Ionesco»",
    translations: {
      en: "Eugene Ionesco National Theater",
      ro: "Teatrul National Eugene Ionesco",
    },
  },
  "green-theater": {
    original: "Зелёный театр",
    translations: {
      en: "Green Theater",
      ro: "Teatrul Verde",
    },
  },
  "guguta-puppet-theater": {
    original: "Муниципальный театр кукол «Гугуцэ»",
    translations: {
      en: "Guguta Municipal Puppet Theater",
      ro: "Teatrul Municipal de Papusi Guguta",
    },
  },
  "la-izvor-park": {
    original: "Парк Ла Извор",
    translations: {
      en: "La Izvor Park",
      ro: "Parcul La Izvor",
    },
  },
  "la-placinte-stefan-cel-mare": {
    original: "La Plăcinte на Штефан чел Маре",
    translations: {
      en: "La Placinte on Stefan cel Mare",
      ro: "La Placinte de pe Stefan cel Mare",
    },
  },
  "licurici-puppet-theater": {
    original: "Республиканский театр кукол «Licurici»",
    translations: {
      en: "Licurici Republican Puppet Theater",
      ro: "Teatrul Republican de Papusi Licurici",
    },
  },
  "luceafarul-theater": {
    original: "Театр «Luceafărul»",
    translations: {
      en: "Luceafarul Theater",
      ro: "Teatrul Luceafarul",
    },
  },
  "malldova": {
    original: "Shopping MallDova",
    translations: {
      en: "Shopping MallDova",
      ro: "Shopping MallDova",
    },
  },
  "mazarache-church": {
    original: "Мазаракиевская церковь",
    translations: {
      en: "Mazarache Church",
      ro: "Biserica Mazarache",
    },
  },
  "mihai-eminescu-theater": {
    original: "Национальный театр «Михай Эминеску»",
    translations: {
      en: "Mihai Eminescu National Theater",
      ro: "Teatrul National Mihai Eminescu",
    },
  },
  "military-history-museum": {
    original: "Военно-исторический музей",
    translations: {
      en: "Military History Museum",
      ro: "Muzeul de Istorie Militara",
    },
  },
  "municipal-library-hasdeu": {
    original: "Муниципальная библиотека B. P. Hasdeu",
    translations: {
      en: "B. P. Hasdeu Municipal Library",
      ro: "Biblioteca Municipala B. P. Hasdeu",
    },
  },
  "national-art-museum": {
    original: "Национальный художественный музей Молдовы",
    translations: {
      en: "National Art Museum of Moldova",
      ro: "Muzeul National de Arta al Moldovei",
    },
  },
  "national-history-museum": {
    original: "Национальный музей истории Молдовы",
    translations: {
      en: "National Museum of History of Moldova",
      ro: "Muzeul National de Istorie a Moldovei",
    },
  },
  "national-opera-ballet": {
    original: "Национальный театр оперы и балета «Мария Биешу»",
    translations: {
      en: "Maria Biesu National Opera and Ballet Theater",
      ro: "Teatrul National de Opera si Balet Maria Biesu",
    },
  },
  "national-palace-nicolae-sulac": {
    original: "Национальный дворец «Nicolae Sulac»",
    translations: {
      en: "Nicolae Sulac National Palace",
      ro: "Palatul National Nicolae Sulac",
    },
  },
  "nativity-cathedral": {
    original: "Кафедральный собор Рождества Христова",
    translations: {
      en: "Nativity Cathedral",
      ro: "Catedrala Nasterea Domnului",
    },
  },
  "organ-hall": {
    original: "Органный зал",
    translations: {
      en: "Organ Hall",
      ro: "Sala cu Orga",
    },
  },
  "parliament-moldova": {
    original: "Парламент Республики Молдова",
    translations: {
      en: "Parliament of the Republic of Moldova",
      ro: "Parlamentul Republicii Moldova",
    },
  },
  "presidency-moldova": {
    original: "Здание Президентуры Республики Молдова",
    translations: {
      en: "Presidency of the Republic of Moldova",
      ro: "Presedintia Republicii Moldova",
    },
  },
  "pushkin-house-museum": {
    original: "Дом-музей Александра Пушкина",
    translations: {
      en: "Alexander Pushkin House Museum",
      ro: "Casa-Muzeu Alexandr Puskin",
    },
  },
  "rose-valley-park": {
    original: "Парк Валя Трандафирилор",
    translations: {
      en: "Rose Valley Park",
      ro: "Parcul Valea Trandafirilor",
    },
  },
  "saint-teodora-sihla-church": {
    original: "Церковь Святой Теодоры де ла Сихла",
    translations: {
      en: "Saint Teodora de la Sihla Church",
      ro: "Biserica Sfanta Teodora de la Sihla",
    },
  },
  "satiricus-theater": {
    original: "Театр Satiricus Ion Luca Caragiale",
    translations: {
      en: "Satiricus Ion Luca Caragiale Theater",
      ro: "Teatrul Satiricus Ion Luca Caragiale",
    },
  },
  "stefan-cel-mare-central-park": {
    original: "Парк Штефана чел Маре",
    translations: {
      en: "Stephen the Great Central Park",
      ro: "Parcul Stefan cel Mare",
    },
  },
  "stephen-great-monument": {
    original: "Памятник Штефану чел Маре",
    translations: {
      en: "Stephen the Great Monument",
      ro: "Monumentul lui Stefan cel Mare",
    },
  },
  "triumphal-arch": {
    original: "Триумфальная арка",
    translations: {
      en: "Triumphal Arch",
      ro: "Arcul de Triumf",
    },
  },
  "tucano-coffee-costa-rica": {
    original: "Tucano Coffee Costa Rica",
    translations: {
      en: "Tucano Coffee Costa Rica",
      ro: "Tucano Coffee Costa Rica",
    },
  },
  "valea-morilor-park": {
    original: "Парк Валя Морилор",
    translations: {
      en: "Valea Morilor Park",
      ro: "Parcul Valea Morilor",
    },
  },
  "vatra-neamului": {
    original: "Vatra Neamului",
    translations: {
      en: "Vatra Neamului",
      ro: "Vatra Neamului",
    },
  },
  "village-museum": {
    original: "Музей села",
    translations: {
      en: "Village Museum",
      ro: "Muzeul Satului",
    },
  },
  "water-tower-city-museum": {
    original: "Музей города Кишинёва — Водонапорная башня",
    translations: {
      en: "Chisinau City Museum - Water Tower",
      ro: "Muzeul Orasului Chisinau - Turnul de Apa",
    },
  },
  "zemstvo-museum": {
    original: "Земский музей",
    translations: {
      en: "Zemstvo Museum",
      ro: "Muzeul Zemstvei",
    },
  },
};

const routeTextBySlug: Record<string, RouteText> = {
  "budget-weekend": {
    title: {
      en: "Affordable Weekend Route",
      ro: "Traseu accesibil de weekend",
      ru: "Недорогой маршрут на выходные",
    },
    description: {
      en: "A budget day in the city: market, sweets, free monuments and old streets.",
      ro: "O zi accesibila in oras: piata, dulciuri, monumente gratuite si strazi vechi.",
      ru: "Бюджетный день в городе: рынок, сладости, бесплатные памятники и старые улицы.",
    },
  },
  "coffee-and-inspiration": {
    title: {
      en: "Coffee and Inspiration",
      ro: "Cafea si inspiratie",
      ru: "Кофе и вдохновение",
    },
    description: {
      en: "Coffee breaks, art and the city center for a calm creative day.",
      ro: "Pauze de cafea, arta si centrul orasului pentru o zi creativa linistita.",
      ru: "Кофейные паузы, искусство и центр города для спокойного творческого дня.",
    },
  },
  "evening-classic": {
    title: {
      en: "Evening Classic",
      ro: "Clasica de seara",
      ru: "Вечерняя классика",
    },
    description: {
      en: "A gentle route through the central symbols: park, arch, cathedral and coffee near the old city.",
      ro: "Un traseu lejer prin simbolurile centrului: parc, arc, catedrala si cafea langa orasul vechi.",
      ru: "Мягкий маршрут по главным символам центра: парк, арка, собор и кофе рядом со старым городом.",
    },
  },
  "family-day": {
    title: {
      en: "Family Day",
      ro: "Zi de familie",
      ru: "Семейный день",
    },
    description: {
      en: "A weekend route with children: zoo, village museum and green spaces in Botanica.",
      ro: "Un traseu de weekend cu copii: zoo, Muzeul Satului si spatii verzi in Botanica.",
      ru: "Маршрут для выходного с детьми: зоопарк, музей села и зелёные пространства Ботаники.",
    },
  },
  "historical-walk": {
    title: {
      en: "Historical Walk",
      ro: "Plimbare istorica",
      ru: "Историческая прогулка",
    },
    description: {
      en: "Central city history: museums, monuments, administrative architecture and old Chisinau.",
      ro: "Istoria centrala a orasului: muzee, monumente, arhitectura administrativa si Chisinaul vechi.",
      ru: "Центральная история города: музеи, памятники, административная архитектура и старый Кишинёв.",
    },
  },
  "nature-and-silence": {
    title: {
      en: "Nature and Quiet",
      ro: "Natura si liniste",
      ru: "Природа и тишина",
    },
    description: {
      en: "A route away from city noise: large parks, water and green pauses.",
      ro: "Un traseu fara zgomot urban: parcuri mari, apa si pauze verzi.",
      ru: "Маршрут без городского шума: большие парки, вода и зелёные паузы.",
    },
  },
  "photo-walk": {
    title: {
      en: "Photo Walk",
      ro: "Plimbare foto",
      ru: "Фото-прогулка",
    },
    description: {
      en: "A route for beautiful frames: tower, museum facades, alleys and evening water.",
      ro: "Un traseu pentru cadre frumoase: turn, fatade de muzee, alei si apa seara.",
      ru: "Маршрут для красивых кадров: башня, музейные фасады, аллеи и вечерняя вода.",
    },
  },
  "romantic-evening-center": {
    title: {
      en: "Romantic Evening in the Center",
      ro: "Seara romantica in centru",
      ru: "Романтический вечер в центре",
    },
    description: {
      en: "A walk for two: theater, park, dessert and the sunset mood of Valea Morilor.",
      ro: "O plimbare pentru doi: teatru, parc, desert si atmosfera de apus la Valea Morilor.",
      ru: "Прогулка для двоих: театр, парк, десерт и закатная атмосфера Валя Морилор.",
    },
  },
};

const achievementTextByCode: Record<string, { description: LocaleText; name: LocaleText }> = {
  "coffee-explorer": {
    description: {
      en: "Found cozy coffee stops.",
      ro: "A gasit opriri confortabile pentru cafea.",
      ru: "Нашёл уютные кофейные остановки.",
    },
    name: { en: "Coffee Explorer", ro: "Explorator de cafea", ru: "Кофейный исследователь" },
  },
  "hidden-places-finder": {
    description: {
      en: "Likes finding less obvious city stops.",
      ro: "Ii place sa gaseasca locuri urbane mai putin evidente.",
      ru: "Любит находить менее очевидные городские точки.",
    },
    name: { en: "Hidden Places Finder", ro: "Cautator de locuri ascunse", ru: "Искатель скрытых мест" },
  },
  "park-lover": {
    description: {
      en: "Chooses green routes and walks by the water.",
      ro: "Alege trasee verzi si plimbari langa apa.",
      ru: "Выбирает зелёные маршруты и прогулки у воды.",
    },
    name: { en: "Park Lover", ro: "Iubitor de parcuri", ru: "Любитель парков" },
  },
  "urban-walker": {
    description: {
      en: "Opened the first city routes.",
      ro: "A deschis primele trasee urbane.",
      ru: "Открыл первые городские маршруты.",
    },
    name: { en: "Urban Walker", ro: "Plimbaret urban", ru: "Городской ходок" },
  },
  "weekend-starter": {
    description: {
      en: "Collected an idea for a weekend day.",
      ro: "A strans o idee pentru o zi de weekend.",
      ru: "Собрал идею для выходного дня.",
    },
    name: { en: "Weekend Starter", ro: "Start de weekend", ru: "Старт выходных" },
  },
};

const categoryLabels: Record<LanguageCode, Record<string, string>> = {
  en: {
    architecture: "architecture",
    cafes: "cafe",
    culture: "culture",
    family: "family",
    food: "food",
    "free-places": "free city",
    "hidden-places": "hidden city",
    history: "history",
    museums: "museum",
    parks: "park",
    "photo-spots": "photo",
    romance: "romantic",
  },
  ro: {
    architecture: "arhitectura",
    cafes: "cafenea",
    culture: "cultura",
    family: "familie",
    food: "gastronomie",
    "free-places": "loc gratuit",
    "hidden-places": "loc ascuns",
    history: "istorie",
    museums: "muzeu",
    parks: "parc",
    "photo-spots": "foto",
    romance: "romantic",
  },
  ru: {
    architecture: "архитектурная",
    cafes: "кофейная",
    culture: "культурная",
    family: "семейная",
    food: "гастрономическая",
    "free-places": "бесплатная",
    "hidden-places": "скрытая",
    history: "историческая",
    museums: "музейная",
    parks: "парковая",
    "photo-spots": "фото",
    romance: "романтичная",
  },
};

const routeTypeLabels: Record<LanguageCode, Record<string, string>> = {
  en: {
    budget: "budget",
    cafe: "cafe",
    cafe_walk: "cafe walk",
    culture: "cultural",
    date: "date",
    family: "family",
    friends: "friends",
    photo: "photo",
    walk: "walking",
  },
  ro: {
    budget: "accesibil",
    cafe: "de cafea",
    cafe_walk: "plimbare cu cafea",
    culture: "cultural",
    date: "pentru intalnire",
    family: "de familie",
    friends: "cu prieteni",
    photo: "foto",
    walk: "de plimbare",
  },
  ru: {
    budget: "бюджетный",
    cafe: "кофейный",
    cafe_walk: "кофейная прогулка",
    culture: "культурный",
    date: "для свидания",
    family: "семейный",
    friends: "для друзей",
    photo: "фото",
    walk: "прогулочный",
  },
};

const variantLabels: Record<LanguageCode, Record<RoutePreviewVariant["variant"], string>> = {
  en: {
    balanced: "Balanced route",
    rich: "Rich route",
    short: "Short route",
  },
  ro: {
    balanced: "Traseu echilibrat",
    rich: "Traseu complet",
    short: "Traseu scurt",
  },
  ru: {
    balanced: "Сбалансированный маршрут",
    rich: "Насыщенный маршрут",
    short: "Короткий маршрут",
  },
};

export function getLocalizedPlaceContent(
  place: Place,
  language: LanguageCode,
): LocalizedPlaceContent {
  const entry = placeTextBySlug[place.slug];
  const name = getLocalizedPlaceName(place, language);
  const shortDescription = selectText({
    fallback: buildPlaceShortFallback(place, language),
    language,
    original: place.short_description ?? place.description,
    translated: entry?.shortDescription?.[language],
  });

  return {
    description: selectText({
      fallback: buildPlaceDescriptionFallback(place, language, shortDescription),
      language,
      original: place.description,
    }),
    name,
    shortDescription,
  };
}

export function getLocalizedPlaceName(
  place: Pick<Place, "category" | "name" | "slug">,
  language: LanguageCode,
): string {
  const entry = placeNamesBySlug[place.slug];

  return selectPlaceName({
    categorySlug: place.category?.slug,
    language,
    original: place.name,
    translated: entry?.translations[language],
  });
}

export function getLocalizedPlaceNameText(
  name: string | null | undefined,
  language: LanguageCode,
): string | null {
  if (!name) {
    return null;
  }

  const entry = Object.values(placeNamesBySlug).find(
    (placeName) => placeName.original === name,
  );

  return selectPlaceName({
    language,
    original: name,
    translated: entry?.translations[language],
  });
}

export function getLocalizedRouteContent(
  route: CityRoute,
  language: LanguageCode,
): LocalizedRouteContent {
  const entry = routeTextBySlug[route.slug];

  if (entry) {
    return {
      description: selectText({
        fallback: buildRouteDescriptionFallback(route, language),
        language,
        original: route.description,
        translated: entry.description[language],
      }),
      title: selectText({
        fallback: buildRouteTitleFallback(route, language),
        language,
        original: route.title,
        translated: entry.title[language],
      }),
    };
  }

  return {
    description: route.description
      ? selectText({
          fallback: buildRouteDescriptionFallback(route, language),
          language,
          original: route.description,
        })
      : null,
    title: selectText({
      fallback: buildRouteTitleFallback(route, language),
      language,
      original: route.title,
    }),
  };
}

export function getLocalizedRoutePointNote(
  point: RoutePoint,
  language: LanguageCode,
): string | null {
  if (!point.note && !point.place) {
    return null;
  }

  const placeName = point.place
    ? getLocalizedPlaceName(point.place, language)
    : undefined;

  return selectText({
    fallback: buildRoutePointFallback(point.order_number, placeName, language),
    language,
    original: point.note,
  });
}

export function getLocalizedPreviewContent(
  variant: RoutePreviewVariant,
  language: LanguageCode,
): LocalizedPreviewContent {
  const count = variant.places.length;
  const type = routeTypeLabel(variant.route_type, language);

  return {
    description: selectText({
      fallback: buildPreviewDescription(variant.variant, count, type, language),
      language,
      original: variant.description,
    }),
    explanation: selectText({
      fallback: buildPreviewExplanation(variant, language),
      language,
      original: variant.explanation,
    }),
    title: selectText({
      fallback: variantLabels[language][variant.variant],
      language,
      original: variant.title,
    }),
    tradeoffs: buildPreviewTradeoffs(variant.variant, language, variant.tradeoffs),
  };
}

export function getLocalizedPreviewPlaceReason(
  point: RoutePreviewPlace,
  language: LanguageCode,
): string {
  const placeName = getLocalizedPlaceName(point.place, language);

  return selectText({
    fallback: buildRoutePointFallback(point.order_number, placeName, language),
    language,
    original: point.reason,
  });
}

export function getLocalizedAchievementContent(
  achievement: Achievement,
  language: LanguageCode,
): LocalizedAchievementContent {
  const entry = achievementTextByCode[achievement.code];

  return {
    description: achievement.description
      ? selectText({
          fallback: null,
          language,
          original: achievement.description,
          translated: entry?.description[language],
        })
      : null,
    name: selectText({
      fallback: achievement.name,
      language,
      original: achievement.name,
      translated: entry?.name[language],
    }),
  };
}

export function getLocalizedNotificationContent(
  notification: CityQuestNotification,
  language: LanguageCode,
): LocalizedNotificationContent {
  switch (notification.type) {
    case "achievement":
      return {
        body: {
          en: "You unlocked a new CityQuest achievement.",
          ro: "Ai deblocat o noua realizare CityQuest.",
          ru: "Вы открыли новое достижение CityQuest.",
        }[language],
        title: {
          en: "Achievement unlocked",
          ro: "Realizare deblocata",
          ru: "Достижение открыто",
        }[language],
      };
    case "family":
      return {
        body: {
          en: "The zoo, Village Museum and Botanical Garden are ready in the collection.",
          ro: "Zoo, Muzeul Satului si Gradina Botanica sunt pregatite in colectie.",
          ru: "Зоопарк, Музей села и Ботанический сад уже ждут в подборке.",
        }[language],
        title: {
          en: "Family route",
          ro: "Traseu de familie",
          ru: "Семейный маршрут",
        }[language],
      };
    case "favorite":
      return {
        body: {
          en: "The place is now saved in your favorite places.",
          ro: "Locul este acum salvat in favorite.",
          ru: "Место теперь сохранено в ваших избранных.",
        }[language],
        title: {
          en: "Place added to favorites",
          ro: "Loc adaugat la favorite",
          ru: "Место добавлено в избранное",
        }[language],
      };
    case "recommendation":
      return {
        body: {
          en: "A saved route is a good fit for an evening walk.",
          ro: "Un traseu salvat se potriveste pentru o plimbare de seara.",
          ru: "Сохранённый маршрут хорошо подходит для вечерней прогулки.",
        }[language],
        title: {
          en: "Idea for the evening",
          ro: "Idee pentru seara",
          ru: "Идея для вечера",
        }[language],
      };
    case "route":
      return {
        body: {
          en: "This route is now saved in your history.",
          ro: "Acest traseu este acum salvat in istoricul tau.",
          ru: "Маршрут сохранён в вашей истории.",
        }[language],
        title: {
          en: "Route completed",
          ro: "Traseu finalizat",
          ru: "Маршрут завершён",
        }[language],
      };
    default:
      return {
        body: notification.body
          ? selectText({
              fallback: notification.body,
              language,
              original: notification.body,
            })
          : null,
        title: selectText({
          fallback: notification.title,
          language,
          original: notification.title,
        }),
      };
  }
}

function selectText({
  fallback,
  language,
  original,
  translated,
}: {
  fallback: string | null;
  language: LanguageCode;
  original?: string | null;
  translated?: string | null;
}): string {
  if (translated) {
    return translated;
  }

  if (language === "ru" && original) {
    return original;
  }

  if (language === "en" && original && !hasCyrillic(original)) {
    return original;
  }

  return fallback ?? original ?? "";
}

function selectPlaceName({
  categorySlug,
  language,
  original,
  translated,
}: {
  categorySlug?: string;
  language: LanguageCode;
  original: string;
  translated?: string | null;
}): string {
  if (translated) {
    return translated;
  }

  if (language === "ru" || !hasCyrillic(original)) {
    return original;
  }

  return buildPlaceNameFallback(categorySlug, language);
}

function buildPlaceNameFallback(
  categorySlug: string | undefined,
  language: LanguageCode,
): string {
  const category = categoryLabel(categorySlug, language);

  switch (language) {
    case "en":
      return `${capitalize(category)} in Chisinau`;
    case "ro":
      return `Loc ${category} in Chisinau`;
    case "ru":
      return "Городское место";
  }
}

function buildPlaceShortFallback(place: Place, language: LanguageCode): string {
  const category = categoryLabel(place.category?.slug, language);

  switch (language) {
    case "en":
      return `A ${category} stop in Chisinau for CityQuest routes.`;
    case "ro":
      return `O oprire de ${category} in Chisinau pentru traseele CityQuest.`;
    case "ru":
      return place.short_description ?? place.description;
  }
}

function buildPlaceDescriptionFallback(
  place: Place,
  language: LanguageCode,
  shortDescription: string | null,
): string {
  const shortText = shortDescription ?? buildPlaceShortFallback(place, language);

  switch (language) {
    case "en":
      return `${shortText} Use it for route planning, map checks, visit time and source context before you go.`;
    case "ro":
      return `${shortText} Foloseste-l pentru planificarea traseului, harta, durata vizitei si verificarea surselor.`;
    case "ru":
      return place.description;
  }
}

function buildRouteTitleFallback(route: CityRoute, language: LanguageCode): string {
  const type = routeTypeLabel(route.route_type, language);

  switch (language) {
    case "en":
      return `${capitalize(type)} route`;
    case "ro":
      return `Traseu ${type}`;
    case "ru":
      return route.title;
  }
}

function buildRouteDescriptionFallback(route: CityRoute, language: LanguageCode): string {
  const count = route.points?.length ?? 0;
  const type = routeTypeLabel(route.route_type, language);

  switch (language) {
    case "en":
      return `A ${type} CityQuest plan with ${count || "several"} stops, visible timing, budget and map links.`;
    case "ro":
      return `Un plan CityQuest ${type} cu ${count || "mai multe"} opriri, timp, buget si linkuri pe harta.`;
    case "ru":
      return route.description ?? route.title;
  }
}

function buildRoutePointFallback(
  orderNumber: number,
  placeName: string | undefined,
  language: LanguageCode,
): string {
  const name = placeName ?? "CityQuest";

  switch (language) {
    case "en":
      return `Stop ${orderNumber}: spend time at ${name} and continue through the planned walking order.`;
    case "ro":
      return `Oprirea ${orderNumber}: petrece timp la ${name} si continua in ordinea planificata.`;
    case "ru":
      return `Точка ${orderNumber}: проведите время в ${name} и продолжайте маршрут по порядку.`;
  }
}

function buildPreviewDescription(
  variant: RoutePreviewVariant["variant"],
  count: number,
  type: string,
  language: LanguageCode,
): string {
  switch (language) {
    case "en":
      return variant === "short"
        ? `A compact ${type} plan with ${count} stops.`
        : variant === "rich"
          ? `A fuller ${type} plan with ${count} stops and more variety.`
          : `A balanced ${type} plan with ${count} stops.`;
    case "ro":
      return variant === "short"
        ? `Un plan ${type} compact cu ${count} opriri.`
        : variant === "rich"
          ? `Un plan ${type} mai complet cu ${count} opriri si mai multa varietate.`
          : `Un plan ${type} echilibrat cu ${count} opriri.`;
    case "ru":
      return variant === "short"
        ? `Компактный ${type} план с ${count} точками.`
        : variant === "rich"
          ? `Более полный ${type} план с ${count} точками и большим разнообразием.`
          : `Сбалансированный ${type} план с ${count} точками.`;
  }
}

function buildPreviewExplanation(
  variant: RoutePreviewVariant,
  language: LanguageCode,
): string {
  switch (language) {
    case "en":
      return `${variantLabels.en[variant.variant]}: ${variant.places.length} stops, about ${variant.distance_km} km and a visible budget range.`;
    case "ro":
      return `${variantLabels.ro[variant.variant]}: ${variant.places.length} opriri, aproximativ ${variant.distance_km} km si buget vizibil.`;
    case "ru":
      return `${variantLabels.ru[variant.variant]}: ${variant.places.length} точек, около ${variant.distance_km} км и понятный бюджет.`;
  }
}

function buildPreviewTradeoffs(
  variant: RoutePreviewVariant["variant"],
  language: LanguageCode,
  original: string[],
): string[] {
  if (language === "en" && original.length > 0 && original.every((item) => !hasCyrillic(item))) {
    return original;
  }

  const copy = {
    en: {
      balanced: ["Best default balance", "Not as quick as short and not as deep as rich"],
      rich: ["Most complete city feel", "Needs more time and energy"],
      short: ["Fastest to follow", "Fewer discoveries than longer plans"],
    },
    ro: {
      balanced: ["Cel mai bun echilibru implicit", "Nu este la fel de rapid ca varianta scurta"],
      rich: ["Cea mai completa senzatie de oras", "Cere mai mult timp si energie"],
      short: ["Cel mai rapid de urmat", "Mai putine descoperiri decat planurile lungi"],
    },
    ru: {
      balanced: ["Лучший баланс по умолчанию", "Не такой быстрый, как короткий, и не такой глубокий, как насыщенный"],
      rich: ["Самое полное ощущение города", "Нужно больше времени и энергии"],
      short: ["Быстрее всего пройти", "Меньше открытий, чем в длинных планах"],
    },
  } satisfies Record<LanguageCode, Record<RoutePreviewVariant["variant"], string[]>>;

  return copy[language][variant];
}

function categoryLabel(slug: string | undefined, language: LanguageCode): string {
  if (!slug) {
    return language === "ru" ? "городская" : language === "ro" ? "urbana" : "city";
  }

  return categoryLabels[language][slug] ?? categoryLabels[language]["hidden-places"];
}

function routeTypeLabel(routeType: string | null | undefined, language: LanguageCode): string {
  if (!routeType) {
    return language === "ru" ? "прогулочный" : language === "ro" ? "urban" : "city";
  }

  return routeTypeLabels[language][routeType] ?? routeTypeLabels[language].walk;
}

function hasCyrillic(value: string): boolean {
  return /[А-Яа-яЁё]/.test(value);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
