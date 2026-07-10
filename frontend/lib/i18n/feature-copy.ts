import type { LanguageCode, ThemePreference } from "@/lib/api/types";

type ThemeCopy = Record<ThemePreference, string>;

export const homePageCopy = {
  en: {
    addPlace: "Add place",
    benefits: [
      {
        text: "Mood, hobbies and the kind of day you want.",
        title: "Choose preferences",
      },
      {
        text: "Places, route steps and a comfortable order for the walk.",
        title: "We build the route",
      },
      {
        text: "Discover new spots without spending the evening searching.",
        title: "Enjoy the city",
      },
    ],
    community:
      "Know the city well? Share favorite places so more people can discover good routes.",
    description:
      "Set your preferences, vibe and favorite activities. CityQuest will build a route for a walk, date, friends meetup or family day.",
    profileGuestTitle: "Sign in to profile",
    title: "Do not waste time searching - we will do it for you",
  },
  ro: {
    addPlace: "Adauga loc",
    benefits: [
      {
        text: "Starea, hobby-urile si formatul zilei.",
        title: "Alege preferintele",
      },
      {
        text: "Locuri, etape si o ordine comoda pentru plimbare.",
        title: "Pregatim traseul",
      },
      {
        text: "Descopera locuri noi fara cautari lungi.",
        title: "Bucura-te de oras",
      },
    ],
    community:
      "Cunosti bine orasul? Impartaseste locurile preferate ca mai multi oameni sa descopere trasee bune.",
    description:
      "Alege preferintele, vibe-ul si activitatile preferate. CityQuest pregateste un traseu pentru plimbare, intalnire, prieteni sau o zi in familie.",
    profileGuestTitle: "Intra in profil",
    title: "Nu pierde timp cautand - o facem noi pentru tine",
  },
  ru: {
    addPlace: "Добавить место",
    benefits: [
      {
        text: "Настроение, хобби и формат отдыха.",
        title: "Выбирай пожелания",
      },
      {
        text: "Места, этапы и удобный порядок посещения.",
        title: "Мы подберём маршрут",
      },
      {
        text: "Открывай новые места без долгих поисков.",
        title: "Наслаждайся городом",
      },
    ],
    community:
      "Хорошо знаешь город? Поделись любимыми местами с другими, чтобы больше людей открывали хорошие маршруты.",
    description:
      "Укажи пожелания, свой вайб и любимые занятия. CityQuest подберёт маршрут для прогулки, свидания, отдыха с друзьями или семейного дня.",
    profileGuestTitle: "Войти в профиль",
    title: "Не теряй время на поиски — мы сделаем это за тебя",
  },
} as const satisfies Record<LanguageCode, unknown>;

export const localizedThemeNames: Record<LanguageCode, ThemeCopy> = {
  en: {
    dark: "Dark",
    light: "Light",
    system: "System",
  },
  ro: {
    dark: "Intunecata",
    light: "Luminoasa",
    system: "Sistem",
  },
  ru: {
    dark: "Темная",
    light: "Светлая",
    system: "Системная",
  },
};

export const localizedLanguageNames: Record<LanguageCode, string> = {
  en: "English",
  ro: "Romana",
  ru: "Русский",
};

export const authCopy = {
  en: {
    common: {
      alreadySignedIn: "You are already signed in.",
      email: "Email",
      loading: "Checking session",
      name: "Name",
      password: "Password",
      passwordConfirmation: "Repeat password",
      preferredCity: "Preferred city",
      preferredLanguage: "Language",
      preferredTheme: "Theme",
    },
    errors: {
      loginFailed: "Could not sign in. Check your email and password.",
      registerFailed: "Could not create an account. Check the form and try again.",
    },
    login: {
      cta: "Sign in",
      heading: "Welcome back",
      registerLink: "Create account",
      registerText: "New to CityQuest?",
      subtitle: "Save routes, favorite places and continue planning from your profile.",
    },
    register: {
      cta: "Create account",
      heading: "Create your CityQuest profile",
      loginLink: "Sign in",
      loginText: "Already have an account?",
      subtitle: "Set up a profile for saved routes, favorites and future mobile sync.",
    },
  },
  ro: {
    common: {
      alreadySignedIn: "Esti deja conectat.",
      email: "Email",
      loading: "Verificam sesiunea",
      name: "Nume",
      password: "Parola",
      passwordConfirmation: "Repeta parola",
      preferredCity: "Oras preferat",
      preferredLanguage: "Limba",
      preferredTheme: "Tema",
    },
    errors: {
      loginFailed: "Nu am putut autentifica. Verifica emailul si parola.",
      registerFailed: "Nu am putut crea contul. Verifica formularul si incearca din nou.",
    },
    login: {
      cta: "Intra in cont",
      heading: "Bine ai revenit",
      registerLink: "Creeaza cont",
      registerText: "Nou in CityQuest?",
      subtitle: "Salveaza trasee, locuri favorite si continua planificarea din profil.",
    },
    register: {
      cta: "Creeaza cont",
      heading: "Creeaza profilul CityQuest",
      loginLink: "Intra in cont",
      loginText: "Ai deja cont?",
      subtitle: "Configureaza profilul pentru trasee salvate, favorite si sincronizare mobila.",
    },
  },
  ru: {
    common: {
      alreadySignedIn: "Вы уже вошли в аккаунт.",
      email: "Email",
      loading: "Проверяем сессию",
      name: "Имя",
      password: "Пароль",
      passwordConfirmation: "Повторите пароль",
      preferredCity: "Любимый город",
      preferredLanguage: "Язык",
      preferredTheme: "Тема",
    },
    errors: {
      loginFailed: "Не удалось войти. Проверьте email и пароль.",
      registerFailed: "Не удалось создать аккаунт. Проверьте форму и попробуйте снова.",
    },
    login: {
      cta: "Войти",
      heading: "С возвращением",
      registerLink: "Создать аккаунт",
      registerText: "Впервые в CityQuest?",
      subtitle: "Сохраняйте маршруты, избранные места и продолжайте планирование из профиля.",
    },
    register: {
      cta: "Создать аккаунт",
      heading: "Создайте профиль CityQuest",
      loginLink: "Войти",
      loginText: "Уже есть аккаунт?",
      subtitle:
        "Настройте профиль для сохраненных маршрутов, избранных мест и будущей мобильной синхронизации.",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const profileCopy = {
  en: {
    actions: {
      login: "Sign in",
      logout: "Log out",
      register: "Create account",
      save: "Save profile",
      saving: "Saving",
    },
    empty: {
      achievements: "Achievements will appear after completed walks.",
      favorites: "Favorite places will appear here.",
      routes: "Saved routes will appear here.",
    },
    errors: {
      load: "Could not load profile.",
      save: "Could not update profile.",
    },
    fields: {
      avatarUrl: "Avatar URL",
      city: "Preferred city",
      language: "Language",
      name: "Name",
      theme: "Theme",
    },
    guest: {
      subtitle: "Sign in to save routes, favorite places and profile preferences.",
      title: "Profile is available after sign in",
    },
    sections: {
      achievements: "Achievements",
      favorites: "Favorite places",
      overview: "Overview",
      routes: "Saved routes",
      settings: "Settings",
    },
    stats: {
      achievements: "Achievements",
      favorites: "Favorites",
      level: "Level",
      routes: "Routes",
    },
    success: "Profile updated.",
    title: "Profile",
  },
  ro: {
    actions: {
      login: "Intra in cont",
      logout: "Iesi",
      register: "Creeaza cont",
      save: "Salveaza profilul",
      saving: "Se salveaza",
    },
    empty: {
      achievements: "Realizarile vor aparea dupa plimbari finalizate.",
      favorites: "Locurile favorite vor aparea aici.",
      routes: "Traseele salvate vor aparea aici.",
    },
    errors: {
      load: "Profilul nu a putut fi incarcat.",
      save: "Profilul nu a putut fi actualizat.",
    },
    fields: {
      avatarUrl: "URL avatar",
      city: "Oras preferat",
      language: "Limba",
      name: "Nume",
      theme: "Tema",
    },
    guest: {
      subtitle: "Intra in cont pentru trasee salvate, locuri favorite si preferinte.",
      title: "Profilul este disponibil dupa autentificare",
    },
    sections: {
      achievements: "Realizari",
      favorites: "Locuri favorite",
      overview: "Privire generala",
      routes: "Trasee salvate",
      settings: "Setari",
    },
    stats: {
      achievements: "Realizari",
      favorites: "Favorite",
      level: "Nivel",
      routes: "Trasee",
    },
    success: "Profil actualizat.",
    title: "Profil",
  },
  ru: {
    actions: {
      login: "Войти",
      logout: "Выйти",
      register: "Создать аккаунт",
      save: "Сохранить профиль",
      saving: "Сохраняем",
    },
    empty: {
      achievements: "Достижения появятся после завершенных прогулок.",
      favorites: "Избранные места появятся здесь.",
      routes: "Сохраненные маршруты появятся здесь.",
    },
    errors: {
      load: "Не удалось загрузить профиль.",
      save: "Не удалось обновить профиль.",
    },
    fields: {
      avatarUrl: "URL аватара",
      city: "Любимый город",
      language: "Язык",
      name: "Имя",
      theme: "Тема",
    },
    guest: {
      subtitle: "Войдите, чтобы сохранять маршруты, избранные места и настройки профиля.",
      title: "Профиль доступен после входа",
    },
    sections: {
      achievements: "Достижения",
      favorites: "Избранные места",
      overview: "Обзор",
      routes: "Сохраненные маршруты",
      settings: "Настройки",
    },
    stats: {
      achievements: "Достижения",
      favorites: "Избранное",
      level: "Уровень",
      routes: "Маршруты",
    },
    success: "Профиль обновлен.",
    title: "Профиль",
  },
} as const satisfies Record<LanguageCode, unknown>;

export const placeSubmitCopy = {
  en: {
    actions: {
      login: "Sign in",
      register: "Create account",
      submit: "Submit place",
      submitting: "Submitting",
    },
    auth: {
      subtitle: "Only signed-in users can add community places.",
      title: "Sign in to add a place",
    },
    errors: {
      create: "Could not submit the place. Check the fields and try again.",
    },
    fields: {
      address: "Address",
      category: "Category",
      city: "City",
      currency: "Currency",
      description: "Description",
      externalSourceUrl: "Source URL",
      googleMapsUrl: "Google Maps URL",
      imageUrl: "Image URL",
      lat: "Latitude",
      lng: "Longitude",
      name: "Name",
      officialUrl: "Official website",
      priceMax: "Price up to",
      priceMin: "Price from",
      shortDescription: "Short description",
      visitDuration: "Visit time, min",
      yandexMapsUrl: "Yandex Maps URL",
    },
    hints: {
      coordinates: "Chisinau center is prefilled. Adjust the coordinates for the exact place.",
      moderation: "Community places are reviewed before they are used in public recommendations.",
    },
    sections: {
      basics: "Basics",
      details: "Details",
      links: "Links",
      location: "Location",
      price: "Time and price",
    },
    subtitle: "Add a place with category, coordinates, description and useful links.",
    success: "Place submitted.",
    review: {
      addAnother: "Add another place",
      openPlace: "Open submitted place",
      statusLabel: "Current status",
      text: "Thanks. The place is saved in the moderation queue and will not be used in public recommendations or routes until it is reviewed.",
      title: "Place sent for review",
    },
    title: "Add place",
  },
  ro: {
    actions: {
      login: "Intra in cont",
      register: "Creeaza cont",
      submit: "Trimite locul",
      submitting: "Se trimite",
    },
    auth: {
      subtitle: "Doar utilizatorii conectati pot adauga locuri din comunitate.",
      title: "Intra in cont ca sa adaugi un loc",
    },
    errors: {
      create: "Locul nu a putut fi trimis. Verifica campurile si incearca din nou.",
    },
    fields: {
      address: "Adresa",
      category: "Categorie",
      city: "Oras",
      currency: "Moneda",
      description: "Descriere",
      externalSourceUrl: "URL sursa",
      googleMapsUrl: "URL Google Maps",
      imageUrl: "URL imagine",
      lat: "Latitudine",
      lng: "Longitudine",
      name: "Nume",
      officialUrl: "Site oficial",
      priceMax: "Pret pana la",
      priceMin: "Pret de la",
      shortDescription: "Descriere scurta",
      visitDuration: "Timp vizita, min",
      yandexMapsUrl: "URL Yandex Maps",
    },
    hints: {
      coordinates: "Centrul Chisinaului este precompletat. Ajusteaza coordonatele exacte.",
      moderation: "Locurile din comunitate sunt verificate inainte de recomandari publice.",
    },
    sections: {
      basics: "Baza",
      details: "Detalii",
      links: "Linkuri",
      location: "Locatie",
      price: "Timp si pret",
    },
    subtitle: "Adauga un loc cu categorie, coordonate, descriere si linkuri utile.",
    success: "Loc trimis.",
    review: {
      addAnother: "Adauga alt loc",
      openPlace: "Deschide locul trimis",
      statusLabel: "Status curent",
      text: "Multumim. Locul este salvat in coada de moderare si nu va fi folosit in recomandari publice sau trasee pana la verificare.",
      title: "Loc trimis la verificare",
    },
    title: "Adauga loc",
  },
  ru: {
    actions: {
      login: "Войти",
      register: "Создать аккаунт",
      submit: "Отправить место",
      submitting: "Отправляем",
    },
    auth: {
      subtitle: "Добавлять community-места могут только пользователи с аккаунтом.",
      title: "Войдите, чтобы добавить место",
    },
    errors: {
      create: "Не удалось отправить место. Проверьте поля и попробуйте снова.",
    },
    fields: {
      address: "Адрес",
      category: "Категория",
      city: "Город",
      currency: "Валюта",
      description: "Описание",
      externalSourceUrl: "Ссылка на источник",
      googleMapsUrl: "Ссылка Google Maps",
      imageUrl: "Ссылка на изображение",
      lat: "Широта",
      lng: "Долгота",
      name: "Название",
      officialUrl: "Официальный сайт",
      priceMax: "Цена до",
      priceMin: "Цена от",
      shortDescription: "Короткое описание",
      visitDuration: "Время визита, мин",
      yandexMapsUrl: "Ссылка Yandex Maps",
    },
    hints: {
      coordinates: "По умолчанию указан центр Кишинева. Измените координаты на точку места.",
      moderation:
        "Места от сообщества проходят проверку перед попаданием в публичные рекомендации.",
    },
    sections: {
      basics: "Основное",
      details: "Детали",
      links: "Ссылки",
      location: "Локация",
      price: "Время и цена",
    },
    subtitle: "Добавьте место с категорией, координатами, описанием и полезными ссылками.",
    success: "Место отправлено.",
    review: {
      addAnother: "Добавить еще место",
      openPlace: "Открыть отправленное место",
      statusLabel: "Текущий статус",
      text: "Спасибо. Место сохранено в очереди модерации и не попадет в публичные рекомендации или маршруты до проверки.",
      title: "Место отправлено на проверку",
    },
    title: "Добавить место",
  },
} as const satisfies Record<LanguageCode, unknown>;

export const accountCopy = {
  en: {
    actions: {
      createRoute: "Create route",
      explorePlaces: "Explore places",
      login: "Sign in",
      markRead: "Mark read",
      open: "Open",
      register: "Create account",
    },
    common: {
      activity: "Activity",
      loading: "Loading account data",
      read: "Read",
      unread: "Unread",
    },
    errors: {
      notifications: "Could not load notifications.",
      profile: "Could not load account data.",
    },
    guard: {
      subtitle: "Sign in to use saved routes, favorite places, achievements and activity.",
      title: "This section needs an account",
    },
    savedRoutes: {
      emptyText: "Save a route from a route detail page or generate a new walk.",
      emptyTitle: "No saved routes yet",
      subtitle: "Routes you saved for later walks and planning.",
      title: "Saved routes",
    },
    favorites: {
      emptyText: "Add places to favorites from the catalog or place detail pages.",
      emptyTitle: "No favorite places yet",
      subtitle: "Places you marked as worth returning to.",
      title: "Favorite places",
    },
    achievements: {
      emptyText: "Achievements will appear as you explore the city.",
      emptyTitle: "No achievements yet",
      subtitle: "Milestones and progress from your CityQuest activity.",
      title: "Achievements",
    },
    history: {
      emptyText: "Activity will appear after saved routes, favorites and notifications.",
      emptyTitle: "No activity yet",
      routeSection: "Saved walks",
      subtitle: "Recent account activity based on notifications and saved routes.",
      title: "Walk history",
    },
    notifications: {
      emptyText: "New route ideas, favorite updates and account events will appear here.",
      emptyTitle: "No notifications yet",
      subtitle: "Updates that matter for your routes, places and account.",
      title: "Notifications",
      types: {
        achievement: "Achievement",
        favorite: "Favorite",
        place: "Place",
        route: "Route",
        system: "System",
        unknown: "Update",
      },
    },
  },
  ro: {
    actions: {
      createRoute: "Creeaza traseu",
      explorePlaces: "Exploreaza locuri",
      login: "Intra in cont",
      markRead: "Marcheaza citit",
      open: "Deschide",
      register: "Creeaza cont",
    },
    common: {
      activity: "Activitate",
      loading: "Se incarca datele contului",
      read: "Citit",
      unread: "Necitit",
    },
    errors: {
      notifications: "Notificarile nu au putut fi incarcate.",
      profile: "Datele contului nu au putut fi incarcate.",
    },
    guard: {
      subtitle:
        "Intra in cont pentru trasee salvate, locuri favorite, realizari si activitate.",
      title: "Aceasta sectiune necesita cont",
    },
    savedRoutes: {
      emptyText: "Salveaza un traseu din pagina lui sau genereaza o plimbare noua.",
      emptyTitle: "Nu ai trasee salvate",
      subtitle: "Trasee pastrate pentru plimbari si planificare.",
      title: "Trasee salvate",
    },
    favorites: {
      emptyText: "Adauga locuri la favorite din catalog sau din pagina locului.",
      emptyTitle: "Nu ai locuri favorite",
      subtitle: "Locuri la care merita sa revii.",
      title: "Locuri favorite",
    },
    achievements: {
      emptyText: "Realizarile vor aparea pe masura ce explorezi orasul.",
      emptyTitle: "Nu ai realizari inca",
      subtitle: "Etape si progres din activitatea ta CityQuest.",
      title: "Realizari",
    },
    history: {
      emptyText: "Activitatea va aparea dupa trasee salvate, favorite si notificari.",
      emptyTitle: "Nu exista activitate",
      routeSection: "Plimbari salvate",
      subtitle: "Activitate recenta bazata pe notificari si trasee salvate.",
      title: "Istoricul plimbarilor",
    },
    notifications: {
      emptyText: "Idei noi de trasee, favorite si evenimente de cont vor aparea aici.",
      emptyTitle: "Nu ai notificari",
      subtitle: "Actualizari importante pentru trasee, locuri si cont.",
      title: "Notificari",
      types: {
        achievement: "Realizare",
        favorite: "Favorit",
        place: "Loc",
        route: "Traseu",
        system: "Sistem",
        unknown: "Actualizare",
      },
    },
  },
  ru: {
    actions: {
      createRoute: "Создать маршрут",
      explorePlaces: "Открыть места",
      login: "Войти",
      markRead: "Прочитано",
      open: "Открыть",
      register: "Создать аккаунт",
    },
    common: {
      activity: "Активность",
      loading: "Загружаем данные аккаунта",
      read: "Прочитано",
      unread: "Новое",
    },
    errors: {
      notifications: "Не удалось загрузить уведомления.",
      profile: "Не удалось загрузить данные аккаунта.",
    },
    guard: {
      subtitle:
        "Войдите, чтобы пользоваться сохраненными маршрутами, избранными местами, достижениями и активностью.",
      title: "Этот раздел доступен после входа",
    },
    savedRoutes: {
      emptyText: "Сохраните маршрут на странице маршрута или создайте новую прогулку.",
      emptyTitle: "Сохранённых маршрутов пока нет",
      subtitle: "Маршруты, которые вы сохранили для будущих прогулок и планирования.",
      title: "Сохранённые маршруты",
    },
    favorites: {
      emptyText: "Добавляйте места в избранное из каталога или со страницы места.",
      emptyTitle: "Избранных мест пока нет",
      subtitle: "Места, к которым хочется вернуться.",
      title: "Избранные места",
    },
    achievements: {
      emptyText: "Достижения появятся по мере исследования города.",
      emptyTitle: "Достижений пока нет",
      subtitle: "Прогресс и отметки активности в CityQuest.",
      title: "Достижения",
    },
    history: {
      emptyText: "Активность появится после сохранённых маршрутов, избранного и уведомлений.",
      emptyTitle: "Активности пока нет",
      routeSection: "Сохранённые прогулки",
      subtitle: "Недавняя активность на основе уведомлений и сохранённых маршрутов.",
      title: "История прогулок",
    },
    notifications: {
      emptyText: "Новые идеи маршрутов, избранное и события аккаунта появятся здесь.",
      emptyTitle: "Уведомлений пока нет",
      subtitle: "Обновления, важные для ваших маршрутов, мест и аккаунта.",
      title: "Уведомления",
      types: {
        achievement: "Достижение",
        favorite: "Избранное",
        place: "Место",
        route: "Маршрут",
        system: "Система",
        unknown: "Обновление",
      },
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const buddyCopy = {
  en: {
    actions: {
      collections: "Open collections",
      createRoute: "Create route",
      login: "Sign in",
      places: "Explore places",
    },
    availability: {
      profileReady: "Profile ready",
      signInNeeded: "Sign-in will be required",
      status: "Planned",
      verification: "Safety layer required",
    },
    current: {
      cards: {
        collections: "Browse shared public routes and save the ones that fit your plans.",
        places: "Build a list of favorite places before shared walks become available.",
        routes: "Create a route now and use it later as the basis for a shared walk.",
      },
      title: "Available now",
    },
    hero: {
      note:
        "Shared walks will appear later. This feature requires identity confirmation and additional safety measures.",
      subtitle:
        "CityQuest is preparing this section carefully and does not enable people search, chat or walk requests yet.",
      title: "Shared walks",
    },
    roadmap: {
      items: {
        moderation: {
          text: "Reports, blocking and moderation queues must exist before opening social flows.",
          title: "Moderation",
        },
        profile: {
          text: "Profiles, avatars and city preferences are already being prepared in the account layer.",
          title: "Trusted profile",
        },
        safety: {
          text: "Phone or identity verification, age checks and guardian consent rules belong in a later safety layer.",
          title: "Safety first",
        },
      },
      title: "Before launch",
    },
    unavailable: {
      items: [
        "People search",
        "Private chat",
        "Walk requests",
        "Passport or phone verification",
      ],
      title: "Planned for later",
    },
  },
  ro: {
    actions: {
      collections: "Deschide colectii",
      createRoute: "Creeaza traseu",
      login: "Intra in cont",
      places: "Exploreaza locuri",
    },
    availability: {
      profileReady: "Profil pregatit",
      signInNeeded: "Autentificarea va fi necesara",
      status: "Planificat",
      verification: "Necesita strat de siguranta",
    },
    current: {
      cards: {
        collections: "Vezi trasee publice si salveaza variantele potrivite.",
        places: "Pregateste o lista de locuri favorite pentru plimbari viitoare.",
        routes: "Creeaza un traseu acum si foloseste-l mai tarziu ca baza.",
      },
      title: "Disponibil acum",
    },
    hero: {
      note:
        "Plimbarile impreuna vor aparea mai tarziu. Functia necesita confirmarea identitatii si masuri suplimentare de siguranta.",
      subtitle:
        "CityQuest pregateste aceasta sectiune cu atentie si nu activeaza inca cautarea de persoane, chatul sau cererile de plimbare.",
      title: "Plimbari impreuna",
    },
    roadmap: {
      items: {
        moderation: {
          text: "Raportarile, blocarea si cozile de moderare trebuie sa existe inainte de fluxuri sociale.",
          title: "Moderare",
        },
        profile: {
          text: "Profilurile, avatarurile si preferintele de oras sunt deja pregatite in zona de cont.",
          title: "Profil de incredere",
        },
        safety: {
          text: "Verificarea telefonului sau identitatii, varsta si acordul tutorelui tin de un strat ulterior.",
          title: "Siguranta intai",
        },
      },
      title: "Inainte de lansare",
    },
    unavailable: {
      items: [
        "Cautare persoane",
        "Chat privat",
        "Cereri de plimbare",
        "Verificare pasaport sau telefon",
      ],
      title: "Planificat pentru mai tarziu",
    },
  },
  ru: {
    actions: {
      collections: "Открыть подборки",
      createRoute: "Создать маршрут",
      login: "Войти",
      places: "Открыть места",
    },
    availability: {
      profileReady: "Профиль готов",
      signInNeeded: "Для запуска потребуется вход",
      status: "Готовится",
      verification: "Нужен слой безопасности",
    },
    current: {
      cards: {
        collections: "Смотрите публичные маршруты и сохраняйте подходящие идеи.",
        places: "Соберите избранные места, которые позже можно будет брать в совместные прогулки.",
        routes: "Создайте маршрут сейчас, чтобы позже использовать его как основу совместной прогулки.",
      },
      title: "Что доступно сейчас",
    },
    hero: {
      note:
        "Совместные прогулки появятся позже. Эта функция потребует подтверждения личности и дополнительных мер безопасности.",
      subtitle:
        "CityQuest готовит этот раздел аккуратно и пока не включает поиск людей, чат или заявки на прогулки.",
      title: "Совместные прогулки",
    },
    roadmap: {
      items: {
        moderation: {
          text: "Жалобы, блокировки и модерация должны быть готовы до открытия социальных сценариев.",
          title: "Модерация",
        },
        profile: {
          text: "Профили, аватары и городские предпочтения уже готовятся в аккаунт-слое.",
          title: "Доверенный профиль",
        },
        safety: {
          text: "Проверка телефона или личности, возрастные правила и согласие опекуна относятся к будущему safety-слою.",
          title: "Сначала безопасность",
        },
      },
      title: "Что нужно до запуска",
    },
    unavailable: {
      items: [
        "Поиск людей",
        "Личный чат",
        "Заявки на прогулки",
        "Паспортная или телефонная проверка",
      ],
      title: "Запланировано на следующий этап",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export type PlannedFeature = "deals" | "events";

export const plannedFeatureCopy = {
  en: {
    common: {
      actionsTitle: "Available now",
      createRoute: "Create route",
      collections: "Open collections",
      places: "Explore places",
      roadmapTitle: "Before launch",
      unavailableTitle: "Planned for later",
    },
    features: {
      deals: {
        badges: ["Planned", "Deals and offers", "No payments yet"],
        heroNote:
          "Deals will appear after verified offer sources are connected. CityQuest does not enable payments, promo codes or affiliate bookings yet.",
        heroSubtitle:
          "This section is being prepared as a sourced city layer. Current actions lead to routes, collections and places.",
        title: "Deals",
        unavailable: [
          "Payments",
          "Promo codes",
          "Partner bookings",
          "Personal discounts",
        ],
        actions: {
          collections: "Use public routes to save ideas before deal filters exist.",
          places: "Browse places that could later connect to verified offers.",
          routes: "Build a route now and keep it ready for future deal planning.",
        },
        roadmap: [
          {
            text: "Offers should come from clear sources or partner data, not from invented prices.",
            title: "Verified offers",
          },
          {
            text: "Deals should connect to places, route mood and budget without turning CityQuest into a checkout flow.",
            title: "Route-aware filters",
          },
          {
            text: "Booking and affiliate layers can arrive later, after product and legal requirements are clear.",
            title: "Partner layer later",
          },
        ],
      },
      events: {
        badges: ["Planned", "City events", "No tickets yet"],
        heroNote:
          "City events will appear later as a separate discovery layer. Today, CityQuest focuses on routes, places and saved ideas.",
        heroSubtitle:
          "This page intentionally does not show fake dates, schedules or ticket flows while the event data source is not connected.",
        title: "Events",
        unavailable: [
          "Ticket purchase",
          "Booking",
          "Live schedules without sources",
          "Organizer admin tools",
        ],
        actions: {
          collections: "Open public route collections and save ideas for future event days.",
          places: "Explore places that could later become event stops.",
          routes: "Create a route now and reuse it when event planning is available.",
        },
        roadmap: [
          {
            text: "Events need reliable source data before they can appear as real cards with dates and venues.",
            title: "City calendar",
          },
          {
            text: "Date, district and category filters should stay simple and useful for mobile users.",
            title: "Useful filters",
          },
          {
            text: "Events should connect to nearby places and generated routes instead of becoming a separate feed.",
            title: "Route connection",
          },
        ],
      },
    },
  },
  ro: {
    common: {
      actionsTitle: "Disponibil acum",
      createRoute: "Creeaza traseu",
      collections: "Deschide colectii",
      places: "Exploreaza locuri",
      roadmapTitle: "Inainte de lansare",
      unavailableTitle: "Planificat pentru mai tarziu",
    },
    features: {
      deals: {
        badges: ["Planificat", "Promotii si oferte", "Fara plati inca"],
        heroNote:
          "Promotiile vor aparea dupa conectarea surselor verificate. CityQuest nu activeaza inca plati, coduri promo sau rezervari affiliate.",
        heroSubtitle:
          "Sectiunea este pregatita ca strat urban cu surse. Actiunile actuale duc spre trasee, colectii si locuri.",
        title: "Promotii",
        unavailable: [
          "Plati",
          "Coduri promo",
          "Rezervari prin parteneri",
          "Reduceri personale",
        ],
        actions: {
          collections: "Foloseste traseele publice pentru idei pana apar filtrele de promotii.",
          places: "Exploreaza locuri care pot fi legate mai tarziu de oferte verificate.",
          routes: "Construieste un traseu acum si pastreaza-l pentru planificare viitoare.",
        },
        roadmap: [
          {
            text: "Ofertele trebuie sa vina din surse clare sau date de parteneri, nu din preturi inventate.",
            title: "Oferte verificate",
          },
          {
            text: "Promotiile trebuie sa tina cont de locuri, atmosfera traseului si buget.",
            title: "Filtre legate de traseu",
          },
          {
            text: "Rezervarile si straturile affiliate pot veni mai tarziu, dupa cerinte clare de produs si legal.",
            title: "Parteneri mai tarziu",
          },
        ],
      },
      events: {
        badges: ["Planificat", "Evenimente in oras", "Fara bilete inca"],
        heroNote:
          "Evenimentele vor aparea mai tarziu ca strat separat de descoperire. Acum CityQuest se concentreaza pe trasee, locuri si idei salvate.",
        heroSubtitle:
          "Pagina nu afiseaza date, programe sau fluxuri de bilete false cat timp sursa de evenimente nu este conectata.",
        title: "Evenimente",
        unavailable: [
          "Cumparare bilete",
          "Rezervare",
          "Program live fara surse",
          "Instrumente pentru organizatori",
        ],
        actions: {
          collections: "Deschide colectii publice si salveaza idei pentru zile cu evenimente.",
          places: "Exploreaza locuri care pot deveni opriri langa evenimente.",
          routes: "Creeaza un traseu acum si refoloseste-l cand planificarea de evenimente va fi disponibila.",
        },
        roadmap: [
          {
            text: "Evenimentele au nevoie de surse sigure inainte sa apara ca articole reale cu date si locatii.",
            title: "Calendar urban",
          },
          {
            text: "Filtrele dupa data, zona si categorie trebuie sa ramana simple si utile pe mobil.",
            title: "Filtre utile",
          },
          {
            text: "Evenimentele trebuie sa se lege de locuri apropiate si trasee generate.",
            title: "Legatura cu traseele",
          },
        ],
      },
    },
  },
  ru: {
    common: {
      actionsTitle: "Что доступно сейчас",
      createRoute: "Создать маршрут",
      collections: "Открыть подборки",
      places: "Открыть места",
      roadmapTitle: "Что нужно до запуска",
      unavailableTitle: "Запланировано на следующий этап",
    },
    features: {
      deals: {
        badges: ["Готовится", "Акции и предложения", "Без оплат сейчас"],
        heroNote:
          "Акции появятся после подключения проверенных источников предложений. CityQuest пока не подключает платежи, промокоды или партнерские бронирования.",
        heroSubtitle:
          "Этот раздел готовится как городской слой с источниками. Текущие действия ведут к маршрутам, подборкам и местам.",
        title: "Акции",
        unavailable: [
          "Платежи",
          "Промокоды",
          "Партнерские бронирования",
          "Персональные скидки",
        ],
        actions: {
          collections: "Используйте публичные маршруты, чтобы сохранять идеи до появления фильтров по акциям.",
          places: "Изучайте места, которые позже можно будет связать с проверенными предложениями.",
          routes: "Соберите маршрут сейчас и оставьте его основой для будущего планирования с акциями.",
        },
        roadmap: [
          {
            text: "Предложения должны приходить из понятных источников или партнерских данных, а не из выдуманных цен.",
            title: "Проверенные предложения",
          },
          {
            text: "Акции должны учитывать места, настроение маршрута и бюджет, но не превращать CityQuest в checkout.",
            title: "Фильтры по маршруту",
          },
          {
            text: "Бронирования и affiliate-слой можно добавлять позже, когда будут ясны продуктовые и юридические требования.",
            title: "Партнерский слой позже",
          },
        ],
      },
      events: {
        badges: ["Готовится", "Городские события", "Без билетов сейчас"],
        heroNote:
          "События появятся позже как отдельный слой подбора. Сейчас CityQuest фокусируется на маршрутах, местах и сохраненных идеях.",
        heroSubtitle:
          "Этот раздел специально не показывает фейковые даты, расписания или покупку билетов, пока не подключен источник событий.",
        title: "События",
        unavailable: [
          "Покупка билетов",
          "Бронирование",
          "Живое расписание без источников",
          "Инструменты организаторов",
        ],
        actions: {
          collections: "Откройте публичные подборки и сохраните идеи для будущих дней с событиями.",
          places: "Изучайте места, которые позже могут стать точками рядом с событиями.",
          routes: "Создайте маршрут сейчас и используйте его позже, когда появится планирование событий.",
        },
        roadmap: [
          {
            text: "Событиям нужен надежный источник данных, прежде чем они появятся как реальные карточки с датами и площадками.",
            title: "Городская афиша",
          },
          {
            text: "Фильтры по дате, району и категории должны оставаться простыми и удобными для мобильного сценария.",
            title: "Полезные фильтры",
          },
          {
            text: "События должны связываться с ближайшими местами и сгенерированными маршрутами, а не жить отдельной лентой.",
            title: "Связь с маршрутами",
          },
        ],
      },
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const advancedCopy = {
  en: {
    actions: {
      collections: "Open collections",
      createRoute: "Create route",
      notifications: "Open notifications",
      places: "Explore places",
      profile: "Open profile",
    },
    availability: {
      apiFirst: "API-first foundation",
      future: "Planned layers",
      noPayments: "No payments yet",
    },
    hero: {
      note:
        "Advanced functionality is being prepared as a set of product layers, not as a paid feature.",
      subtitle:
        "CityQuest first strengthens routes, places, profiles and saved ideas before adding complex commercial or personalization flows.",
      title: "Advanced functionality",
    },
    now: {
      items: [
        {
          text: "Create and save routes that later can become the base for deeper personalization.",
          title: "Routes first",
        },
        {
          text: "Use place details, sources and favorites before adding richer city data layers.",
          title: "Trusted places",
        },
        {
          text: "Profile, notifications and saved libraries already prepare the account layer for mobile.",
          title: "Account base",
        },
      ],
      title: "What exists now",
    },
    roadmap: {
      items: [
        {
          key: "events",
          text: "A sourced city calendar can later connect events to places and generated routes.",
          title: "Fresh events",
        },
        {
          key: "deals",
          text: "Verified offers can arrive later without turning CityQuest into a checkout flow.",
          title: "Deals",
        },
        {
          key: "personal",
          text: "Route suggestions can use saved places, mood and history after enough real account data exists.",
          title: "Personal routes",
        },
        {
          key: "notifications",
          text: "Smarter notifications can summarize route ideas, saved updates and nearby opportunities.",
          title: "Notifications",
        },
        {
          key: "places",
          text: "Places can grow with richer facts, seasonal notes, accessibility and source confidence.",
          title: "Extended place data",
        },
        {
          key: "packs",
          text: "City packs can prepare curated bundles for districts, themes and short trips.",
          title: "City packs",
        },
        {
          key: "travel",
          text: "Travel mode can adapt recommendations for visitors, time limits and offline planning.",
          title: "Travel mode",
        },
        {
          key: "buddy",
          text: "Shared walks need identity, moderation and safety layers before opening social flows.",
          title: "Shared walks",
        },
      ],
      title: "Future layers",
    },
    unavailable: {
      items: [
        "Real payments",
        "Subscription checkout",
        "Partner payouts",
        "Billing admin tools",
      ],
      title: "Planned for later",
    },
  },
  ro: {
    actions: {
      collections: "Deschide colectii",
      createRoute: "Creeaza traseu",
      notifications: "Deschide notificari",
      places: "Exploreaza locuri",
      profile: "Deschide profilul",
    },
    availability: {
      apiFirst: "Baza API-first",
      future: "Straturi planificate",
      noPayments: "Fara plati inca",
    },
    hero: {
      note:
        "Functionalitatea avansata este pregatita ca set de straturi de produs, nu ca functie platita activa.",
      subtitle:
        "CityQuest intareste mai intai traseele, locurile, profilurile si ideile salvate inainte de fluxuri comerciale sau personalizare complexa.",
      title: "Functii avansate",
    },
    now: {
      items: [
        {
          text: "Creeaza si salveaza trasee care pot deveni baza pentru personalizare mai profunda.",
          title: "Traseele primele",
        },
        {
          text: "Foloseste detaliile locurilor, sursele si favoritele inainte de straturi urbane mai bogate.",
          title: "Locuri de incredere",
        },
        {
          text: "Profilul, notificarile si bibliotecile salvate pregatesc deja stratul de cont pentru mobil.",
          title: "Baza de cont",
        },
      ],
      title: "Ce exista acum",
    },
    roadmap: {
      items: [
        {
          key: "events",
          text: "Un calendar urban cu surse poate lega mai tarziu evenimentele de locuri si trasee generate.",
          title: "Evenimente proaspete",
        },
        {
          key: "deals",
          text: "Ofertele verificate pot aparea mai tarziu fara sa transforme CityQuest intr-un checkout.",
          title: "Promotii",
        },
        {
          key: "personal",
          text: "Sugestiile pot folosi locuri salvate, stare si istoric dupa ce exista date reale de cont.",
          title: "Trasee personale",
        },
        {
          key: "notifications",
          text: "Notificarile mai inteligente pot rezuma idei de trasee, actualizari salvate si ocazii apropiate.",
          title: "Notificari",
        },
        {
          key: "places",
          text: "Locurile pot creste cu date mai bogate, note sezoniere, accesibilitate si incredere in surse.",
          title: "Date extinse despre locuri",
        },
        {
          key: "packs",
          text: "City packs pot pregati pachete curate pentru zone, teme si calatorii scurte.",
          title: "City packs",
        },
        {
          key: "travel",
          text: "Travel mode poate adapta recomandarile pentru vizitatori, timp limitat si planificare offline.",
          title: "Travel mode",
        },
        {
          key: "buddy",
          text: "Plimbarile impreuna au nevoie de identitate, moderare si siguranta inainte de fluxuri sociale.",
          title: "Plimbari impreuna",
        },
      ],
      title: "Straturi viitoare",
    },
    unavailable: {
      items: [
        "Plati reale",
        "Checkout pentru abonamente",
        "Plati catre parteneri",
        "Instrumente de facturare",
      ],
      title: "Planificat pentru mai tarziu",
    },
  },
  ru: {
    actions: {
      collections: "Открыть подборки",
      createRoute: "Создать маршрут",
      notifications: "Открыть уведомления",
      places: "Открыть места",
      profile: "Открыть профиль",
    },
    availability: {
      apiFirst: "API-first основа",
      future: "Запланированные слои",
      noPayments: "Без оплат сейчас",
    },
    hero: {
      note:
        "Расширенный функционал готовится как набор продуктовых слоёв, а не как активная платная функция.",
      subtitle:
        "CityQuest сначала усиливает маршруты, места, профиль и сохранённые идеи, а сложные коммерческие и персональные сценарии добавляет позже.",
      title: "Расширенный функционал",
    },
    now: {
      items: [
        {
          text: "Создавайте и сохраняйте маршруты, которые позже смогут стать основой для глубокой персонализации.",
          title: "Сначала маршруты",
        },
        {
          text: "Используйте детали мест, источники и избранное до добавления более насыщенных городских данных.",
          title: "Проверенные места",
        },
        {
          text: "Профиль, уведомления и сохранённые библиотеки уже готовят аккаунт-слой для мобильной версии.",
          title: "Основа аккаунта",
        },
      ],
      title: "Что уже есть",
    },
    roadmap: {
      items: [
        {
          key: "events",
          text: "Городская афиша с источниками позже сможет связывать события с местами и сгенерированными маршрутами.",
          title: "Свежие события",
        },
        {
          key: "deals",
          text: "Проверенные предложения можно добавить позже, не превращая CityQuest в checkout.",
          title: "Акции",
        },
        {
          key: "personal",
          text: "Подсказки маршрутов смогут учитывать сохранённые места, настроение и историю после появления реальных аккаунт-данных.",
          title: "Персональные маршруты",
        },
        {
          key: "notifications",
          text: "Более умные уведомления смогут собирать идеи маршрутов, обновления сохранённого и возможности рядом.",
          title: "Уведомления",
        },
        {
          key: "places",
          text: "Места можно расширить фактами, сезонными заметками, доступностью и уровнем доверия к источникам.",
          title: "Расширенные данные о местах",
        },
        {
          key: "packs",
          text: "City packs смогут собирать готовые наборы по районам, темам и коротким поездкам.",
          title: "City packs",
        },
        {
          key: "travel",
          text: "Travel mode сможет адаптировать рекомендации для гостей города, лимита времени и офлайн-планирования.",
          title: "Travel mode",
        },
        {
          key: "buddy",
          text: "Совместные прогулки требуют личности, модерации и safety-слоя до открытия социальных сценариев.",
          title: "Совместные прогулки",
        },
      ],
      title: "Будущие слои",
    },
    unavailable: {
      items: [
        "Реальные платежи",
        "Checkout подписок",
        "Партнёрские выплаты",
        "Инструменты биллинга",
      ],
      title: "Запланировано на следующий этап",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const cityMapCopy = {
  en: {
    actions: {
      allCategories: "All",
      createRoute: "Create route",
      loadMore: "Load more",
      openPlace: "Open place",
      places: "Places",
      reset: "Show all",
    },
    filters: {
      all: "All active",
      community: "Verified + community",
      statusLabel: "Map status",
      verified: "Verified only",
    },
    hero: {
      eyebrow: "City map",
      subtitle:
        "A simple map of Chisinau places from the CityQuest seed data. Route detail screens remain the main navigation experience.",
      title: "Map",
    },
    markers: {
      markerLabel: "Place marker",
      selected: "Selected",
    },
    meta: {
      categories: "Categories",
      countHint: "{visible} on map of {total} total",
      hiddenByPagination: "{count} more match this filter. Load more to show them on the map.",
      hiddenByStatus: "{count} hidden by the current status filter.",
      missingCoordinates: "{count} places are not shown because coordinates are missing.",
      places: "places on map",
      selected: "Selected place",
      showing: "Showing {visible} of {filtered} places for this map filter",
    },
    states: {
      emptyText: "Try another category or open the full places catalog.",
      emptyTitle: "No places for this filter",
      errorText: "The places API did not respond. The map will be available after data loads.",
      errorTitle: "Could not load map places",
      loading: "Loading city map",
      mapUnavailableText: "Places with coordinates will appear here after the API responds.",
      mapUnavailableTitle: "Map data is not ready yet",
    },
  },
  ro: {
    actions: {
      allCategories: "Toate",
      createRoute: "Creeaza traseu",
      loadMore: "Incarca mai multe",
      openPlace: "Deschide locul",
      places: "Locuri",
      reset: "Arata tot",
    },
    filters: {
      all: "Toate active",
      community: "Verificate + comunitate",
      statusLabel: "Status harta",
      verified: "Doar verificate",
    },
    hero: {
      eyebrow: "Harta orasului",
      subtitle:
        "O harta simpla cu locuri din Chisinau din datele seed CityQuest. Ecranele de traseu raman experienta principala de navigare.",
      title: "Harta",
    },
    markers: {
      markerLabel: "Marker loc",
      selected: "Selectat",
    },
    meta: {
      categories: "Categorii",
      countHint: "{visible} pe harta din {total} total",
      hiddenByPagination: "{count} mai multe corespund filtrului. Incarca mai multe pentru a le afisa pe harta.",
      hiddenByStatus: "{count} ascunse de filtrul de status curent.",
      missingCoordinates: "{count} locuri nu sunt afisate deoarece lipsesc coordonatele.",
      places: "locuri pe harta",
      selected: "Loc selectat",
      showing: "Afisam {visible} din {filtered} locuri pentru acest filtru de harta",
    },
    states: {
      emptyText: "Incearca alta categorie sau deschide catalogul complet de locuri.",
      emptyTitle: "Nu sunt locuri pentru filtrul ales",
      errorText: "API-ul de locuri nu a raspuns. Harta va fi disponibila dupa incarcarea datelor.",
      errorTitle: "Nu am putut incarca locurile pe harta",
      loading: "Incarcam harta orasului",
      mapUnavailableText: "Locurile cu coordonate vor aparea aici dupa raspunsul API-ului.",
      mapUnavailableTitle: "Datele hartii nu sunt gata",
    },
  },
  ru: {
    actions: {
      allCategories: "Все",
      createRoute: "Создать маршрут",
      loadMore: "Загрузить ещё",
      openPlace: "Открыть место",
      places: "Места",
      reset: "Показать все",
    },
    filters: {
      all: "Все активные",
      community: "Проверенные + сообщество",
      statusLabel: "Статус на карте",
      verified: "Только проверенные",
    },
    hero: {
      eyebrow: "Карта города",
      subtitle:
        "Простая карта мест Кишинёва из seed-данных CityQuest. Основной сценарий навигации по-прежнему остаётся в деталях маршрута.",
      title: "Карта",
    },
    markers: {
      markerLabel: "Маркер места",
      selected: "Выбрано",
    },
    meta: {
      categories: "Категории",
      countHint: "{visible} на карте из {total} всего",
      hiddenByPagination: "Ещё {count} подходят под фильтр. Загрузите больше, чтобы показать их на карте.",
      hiddenByStatus: "{count} скрыто текущим фильтром статуса.",
      missingCoordinates: "{count} мест не показаны, потому что нет координат.",
      places: "мест на карте",
      selected: "Выбранное место",
      showing: "Показано {visible} из {filtered} мест для этого фильтра карты",
    },
    states: {
      emptyText: "Попробуйте другую категорию или откройте полный каталог мест.",
      emptyTitle: "Для этого фильтра мест нет",
      errorText: "API мест не ответил. Карта будет доступна после загрузки данных.",
      errorTitle: "Не удалось загрузить места на карте",
      loading: "Загружаем карту города",
      mapUnavailableText: "Места с координатами появятся здесь после ответа API.",
      mapUnavailableTitle: "Данные карты ещё не готовы",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const randomRouteCopy = {
  en: {
    actions: {
      createCustom: "Choose myself",
      generating: "Picking a route",
      lucky: "Surprise me",
      openRoute: "Open route",
      tryAnother: "Try another",
    },
    hero: {
      eyebrow: "Random route",
      subtitle:
        "Tap once and CityQuest will pick a balanced route from verified places around the city.",
      title: "Let CityQuest pick today",
    },
    preset: {
      budget: "Budget",
      categories: "Interests",
      duration: "Duration",
      fallbackCategories: "different places",
      placeMode: "Verified places",
      routeType: "Route type",
      title: "What CityQuest picked",
      vibe: "Mood",
      why: "Why this route",
    },
    result: {
      eyebrow: "Route preview",
      included: "Included stops",
      notSaved: "Nothing is saved until you open the route.",
      places: "places",
      title: "CityQuest picked this plan",
    },
    states: {
      cityError: "Could not load the city list.",
      emptyText:
        "Try again or configure the route manually with the same preferences.",
      emptyTitle: "No good random plan yet",
      errorTitle: "Could not create a random route",
      loadingMessages: [
        "Finding cozy places...",
        "Building the route...",
        "Checking distances...",
        "Preparing the plan...",
      ],
      loading: "Preparing city data",
      noCity: "City data is not ready yet.",
    },
    steps: {
      items: [
        {
          text: "CityQuest chooses the mood, activity style and categories for this walk.",
          title: "Quick choice",
        },
        {
          text: "The route keeps verified places first and balances time, budget and interests.",
          title: "Useful route",
        },
        {
          text: "Open the route only when the preview feels right. Nothing is saved before that.",
          title: "Choose the plan",
        },
      ],
      title: "How it works",
    },
  },
  ro: {
    actions: {
      createCustom: "Aleg singur",
      generating: "Alegem traseul",
      lucky: "Am noroc",
      openRoute: "Deschide traseul",
      tryAnother: "Incearca altul",
    },
    hero: {
      eyebrow: "Traseu aleatoriu",
      subtitle:
        "Un click si CityQuest alege un traseu echilibrat din locuri verificate din oras.",
      title: "Lasa CityQuest sa aleaga azi",
    },
    preset: {
      budget: "Buget",
      categories: "Interese",
      duration: "Durata",
      fallbackCategories: "locuri diferite",
      placeMode: "Locuri verificate",
      routeType: "Tip traseu",
      title: "Ce a ales CityQuest",
      vibe: "Stare",
      why: "De ce acest traseu",
    },
    result: {
      eyebrow: "Previzualizare traseu",
      included: "Opriri incluse",
      notSaved: "Nu salvam nimic pana nu deschizi traseul.",
      places: "locuri",
      title: "CityQuest a ales acest plan",
    },
    states: {
      cityError: "Nu am putut incarca lista oraselor.",
      emptyText:
        "Incearca din nou sau configureaza traseul manual cu aceleasi preferinte.",
      emptyTitle: "Nu avem inca un plan aleatoriu bun",
      errorTitle: "Nu am putut crea traseul aleatoriu",
      loadingMessages: [
        "Cautam locuri placute...",
        "Construim traseul...",
        "Verificam distantele...",
        "Pregatim planul...",
      ],
      loading: "Pregatim datele orasului",
      noCity: "Datele orasului nu sunt gata.",
    },
    steps: {
      items: [
        {
          text: "CityQuest alege atmosfera, formatul activitatii si categoriile pentru plimbare.",
          title: "Alegere rapida",
        },
        {
          text: "Traseul pastreaza locuri verificate si echilibreaza timpul, bugetul si interesele.",
          title: "Traseu util",
        },
        {
          text: "Deschide traseul doar cand previzualizarea ti se potriveste. Nu salvam nimic inainte.",
          title: "Alege planul",
        },
      ],
      title: "Cum functioneaza",
    },
  },
  ru: {
    actions: {
      createCustom: "Выбрать самому",
      generating: "Подбираем маршрут",
      lucky: "Мне повезёт",
      openRoute: "Открыть маршрут",
      tryAnother: "Попробовать другой",
    },
    hero: {
      eyebrow: "Случайный маршрут",
      subtitle:
        "Один клик — и CityQuest подберёт сбалансированный маршрут из проверенных городских мест.",
      title: "Пусть CityQuest выберет сегодня",
    },
    preset: {
      budget: "Бюджет",
      categories: "Интересы",
      duration: "Длительность",
      fallbackCategories: "разные места",
      placeMode: "Проверенные места",
      routeType: "Тип маршрута",
      title: "Что выбрал CityQuest",
      vibe: "Настроение",
      why: "Почему этот маршрут",
    },
    result: {
      eyebrow: "Предпросмотр маршрута",
      included: "Внутри маршрута",
      notSaved: "Маршрут не сохранится, пока ты его не откроешь.",
      places: "мест",
      title: "CityQuest выбрал такой план",
    },
    states: {
      cityError: "Не удалось загрузить список городов.",
      emptyText:
        "Попробуй ещё раз или настрой маршрут вручную с теми же предпочтениями.",
      emptyTitle: "Хороший случайный план пока не найден",
      errorTitle: "Не удалось создать случайный маршрут",
      loadingMessages: [
        "Ищем уютные места…",
        "Собираем маршрут…",
        "Проверяем расстояния…",
        "Готовим план…",
      ],
      loading: "Готовим данные города",
      noCity: "Данные города ещё не готовы.",
    },
    steps: {
      items: [
        {
          text: "CityQuest выбирает настроение, формат активности и подходящие категории для прогулки.",
          title: "Быстрый выбор",
        },
        {
          text: "Маршрут держится на проверенных местах и балансирует время, бюджет и интересы.",
          title: "Полезный маршрут",
        },
        {
          text: "Открывай маршрут только когда предпросмотр подходит. До этого мы ничего не сохраняем.",
          title: "Выбери план",
        },
      ],
      title: "Как это работает",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;

export const routeDetailCopy = {
  en: {
    actions: {
      copied: "Link copied",
      saveRoute: "Save route",
      savedRoute: "Saved",
      signInToSave: "Sign in to save",
      startRoute: "Start route",
    },
    insight: {
      items: [
        "{count} ordered stops are connected into one walkable plan.",
        "Time, distance and budget are visible before you start.",
        "Each stop keeps place details, source context and map links close.",
      ],
      title: "Why this route works",
    },
    modify: {
      options: {
        cafe: "Add cafe",
        free: "More free places",
        nature: "More nature",
        romantic: "More romantic",
        shorter: "Make shorter",
      },
      title: "Tune the plan",
    },
    stages: {
      price: "Price",
      source: "Source",
      visit: "Visit",
    },
  },
  ro: {
    actions: {
      copied: "Link copiat",
      saveRoute: "Salveaza traseul",
      savedRoute: "Salvat",
      signInToSave: "Intra ca sa salvezi",
      startRoute: "Porneste traseul",
    },
    insight: {
      items: [
        "{count} opriri ordonate sunt legate intr-un plan usor de urmat.",
        "Timpul, distanta si bugetul sunt clare inainte de plecare.",
        "Fiecare oprire pastreaza detalii, sursa si linkuri catre harta.",
      ],
      title: "De ce functioneaza traseul",
    },
    modify: {
      options: {
        cafe: "Adauga cafea",
        free: "Mai multe locuri gratis",
        nature: "Mai multa natura",
        romantic: "Mai romantic",
        shorter: "Mai scurt",
      },
      title: "Ajusteaza planul",
    },
    stages: {
      price: "Pret",
      source: "Sursa",
      visit: "Vizita",
    },
  },
  ru: {
    actions: {
      copied: "Ссылка скопирована",
      saveRoute: "Сохранить маршрут",
      savedRoute: "Сохранено",
      signInToSave: "Войти и сохранить",
      startRoute: "Начать маршрут",
    },
    insight: {
      items: [
        "{count} точки собраны в понятный порядок для прогулки.",
        "Время, расстояние и бюджет видны до старта.",
        "У каждой остановки рядом есть детали, источник и ссылка на карту.",
      ],
      title: "Почему маршрут работает",
    },
    modify: {
      options: {
        cafe: "Добавить кафе",
        free: "Больше бесплатного",
        nature: "Больше природы",
        romantic: "Романтичнее",
        shorter: "Сделать короче",
      },
      title: "Настроить план",
    },
    stages: {
      price: "Цена",
      source: "Источник",
      visit: "Визит",
    },
  },
} as const satisfies Record<LanguageCode, unknown>;
