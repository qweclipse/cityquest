import type { LanguageCode } from "@/lib/api/types";

export type HomeActionId = "random" | "create" | "profile";

export interface Dictionary {
  common: {
    appDescription: string;
    appName: string;
    apiOffline: string;
    defaultCity: string;
    loading: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    themeSystem: string;
  };
  home: {
    actions: Array<{
      cta: string;
      id: HomeActionId;
      text: string;
      title: string;
    }>;
    cityError: string;
    cityPrefix: string;
    cityReady: string;
    eyebrow: string;
    subtitle: string;
    title: string;
  };
  collections: {
    actions: {
      create: string;
      open: string;
    };
    cards: {
      cityquestAuthor: string;
      startsAt: string;
      stops: string;
    };
    eyebrow: string;
    filters: {
      all: string;
      ariaLabel: string;
    };
    meta: {
      routes: string;
    };
    states: {
      emptyText: string;
      emptyTitle: string;
      errorText: string;
      errorTitle: string;
    };
    subtitle: string;
    tabs: {
      ariaLabel: string;
      following: string;
      nearby: string;
      new: string;
      popular: string;
    };
    title: string;
  };
  places: {
    actions: {
      add: string;
      clearFilters: string;
      createRoute: string;
      favorite: string;
      favoriteLocked: string;
      open: string;
      removeFavorite: string;
      search: string;
      showAll: string;
    };
    cards: {
      address: string;
      durationUnknown: string;
      free: string;
      from: string;
      noAddress: string;
      noPrice: string;
      upTo: string;
    };
    categories: {
      all: string;
      architecture: string;
      cafes: string;
      culture: string;
      family: string;
      food: string;
      freePlaces: string;
      hiddenPlaces: string;
      history: string;
      museums: string;
      parks: string;
      photoSpots: string;
      place: string;
      romance: string;
    };
    detail: {
      about: string;
      addedBy: string;
      back: string;
      category: string;
      coordinates: string;
      details: string;
      errorTitle: string;
      gallery: string;
      googleMaps: string;
      invalidText: string;
      invalidTitle: string;
      mapMarker: string;
      mapTitle: string;
      mapUnavailableText: string;
      mapUnavailableTitle: string;
      noSourceLinks: string;
      officialLink: string;
      openMap: string;
      priceRange: string;
      sourceLink: string;
      sourceLinks: string;
      sourceLinksText: string;
      sourceType: string;
      verification: string;
      visitDuration: string;
      yandexMaps: string;
    };
    eyebrow: string;
    filters: {
      categoryAriaLabel: string;
      searchLabel: string;
      searchPlaceholder: string;
      statusAll: string;
      statusAriaLabel: string;
    };
    meta: {
      places: string;
    };
    sources: {
      aggregated: string;
      aggregatedShort: string;
      community: string;
      communityShort: string;
      official: string;
      officialShort: string;
    };
    states: {
      emptyText: string;
      emptyTitle: string;
      errorText: string;
      errorTitle: string;
    };
    submit: {
      moderationNote: string;
      nextStepText: string;
      nextStepTitle: string;
      subtitle: string;
      title: string;
    };
    subtitle: string;
    title: string;
    verification: {
      closed: string;
      communityConfirmed: string;
      needsImageReview: string;
      needsLocationReview: string;
      needsReview: string;
      needsSourceReview: string;
      rejected: string;
      userAdded: string;
      verified: string;
    };
  };
  shell: {
    account: {
      level: string;
      name: string;
      openProfile: string;
    };
    city: {
      ariaLabel: string;
      loaded: string;
      loading: string;
      unavailable: string;
    };
    language: {
      ariaLabel: string;
      title: string;
    };
    menu: {
      close: string;
      open: string;
    };
    nav: {
      active: string;
      achievements: string;
      advanced: string;
      buddy: string;
      collections: string;
      createRoute: string;
      deals: string;
      events: string;
      favorites: string;
      groups: {
        community: string;
        main: string;
        more: string;
        my: string;
      };
      history: string;
      home: string;
      map: string;
      newPlaces: string;
      places: string;
      profile: string;
      randomRoute: string;
      savedRoutes: string;
      submitPlace: string;
    };
    notifications: {
      ariaLabel: string;
    };
    theme: {
      ariaLabel: string;
      current: string;
      dark: string;
      light: string;
      system: string;
      title: string;
    };
  };
  routes: {
    labels: {
      routeTypes: {
        budget: string;
        cafe: string;
        cafeWalk: string;
        culture: string;
        date: string;
        family: string;
        friends: string;
        other: string;
        photo: string;
        walk: string;
      };
      vibes: {
        balanced: string;
        calm: string;
        classic: string;
        creative: string;
        easy: string;
        history: string;
        inspiring: string;
        local: string;
        other: string;
        romantic: string;
      };
    };
    create: {
      actions: {
        generate: string;
        generating: string;
      };
      budget: {
        any: string;
        free: string;
        low: string;
        medium: string;
      };
      durationHint: string;
      fields: {
        budget: string;
        categories: string;
        city: string;
        duration: string;
        placeMode: string;
        routeType: string;
        vibe: string;
      };
      placeMode: {
        includeCommunity: string;
        verifiedOnly: string;
      };
      routeType: {
        cafe: string;
        culture: string;
        date: string;
        family: string;
        friends: string;
        walk: string;
      };
      sections: {
        basics: string;
        interests: string;
        settings: string;
      };
      subtitle: string;
      title: string;
      vibe: {
        balanced: string;
        calm: string;
        culture: string;
        fun: string;
        nature: string;
        romantic: string;
      };
    };
    results: {
      budget: string;
      createAgain: string;
      emptyText: string;
      emptyTitle: string;
      errorTitle: string;
      generatedBadge: string;
      loading: string;
      minutes: string;
      openDetails: string;
      pointsTitle: string;
      save: string;
      share: string;
      subtitle: string;
      title: string;
    };
    detail: {
      back: string;
      collapseSheet: string;
      expandSheet: string;
      mapUnavailableText: string;
      mapUnavailableTitle: string;
      markerLabel: string;
      openDirections: string;
      openPointMap: string;
      routeOverview: string;
      routeSteps: string;
    };
  };
}

export const languageOptions: Array<{
  code: LanguageCode;
  label: string;
  name: string;
}> = [
  { code: "ru", label: "RU", name: "Русский" },
  { code: "en", label: "EN", name: "English" },
  { code: "ro", label: "RO", name: "Română" },
];

export const dictionaries: Record<LanguageCode, Dictionary> = {
  ru: {
    common: {
      appDescription: "Планировщик городского досуга и маршрутов.",
      appName: "CityQuest",
      apiOffline: "API недоступен",
      defaultCity: "Кишинёв",
      loading: "Загрузка",
      theme: "Тема",
      themeDark: "Тёмная тема",
      themeLight: "Светлая тема",
      themeSystem: "Системная тема",
    },
    home: {
      actions: [
        {
          cta: "Мне повезёт",
          id: "random",
          text: "Маршрут на сегодня в один клик.",
          title: "Случайный маршрут",
        },
        {
          cta: "Создать маршрут",
          id: "create",
          text: "Настрой пожелания и формат прогулки.",
          title: "Выбрать самому",
        },
        {
          cta: "Войти / Зарегистрироваться",
          id: "profile",
          text: "Сохраняй маршруты и рекомендации.",
          title: "Мой профиль",
        },
      ],
      cityError: "Город не загрузился",
      cityPrefix: "Город",
      cityReady: "Город выбран",
      eyebrow: "Твой план на сегодня",
      subtitle:
        "Подбери маршрут для прогулки, свидания, отдыха с друзьями или семейного дня.",
      title: "Чем займёшься сегодня?",
    },
    collections: {
      actions: {
        create: "Создать маршрут",
        open: "Открыть",
      },
      cards: {
        cityquestAuthor: "CityQuest",
        startsAt: "Старт",
        stops: "точек",
      },
      eyebrow: "Подборка маршрутов",
      filters: {
        all: "Все типы",
        ariaLabel: "Фильтр типа маршрута",
      },
      meta: {
        routes: "маршрутов",
      },
      states: {
        emptyText: "Для этого фильтра пока нет маршрутов. Попробуй другой тип или создай новый маршрут.",
        emptyTitle: "Маршруты не найдены",
        errorText: "Не удалось загрузить подборку. Проверь API и попробуй ещё раз.",
        errorTitle: "Подборка недоступна",
      },
      subtitle:
        "Готовые городские маршруты по Кишинёву: популярные прогулки, новые идеи, короткие варианты рядом и маршруты, которые чаще сохраняют.",
      tabs: {
        ariaLabel: "Разделы подборки",
        following: "Сохраняют",
        nearby: "Рядом",
        new: "Новые",
        popular: "Популярные",
      },
      title: "Подборка маршрутов",
    },
    places: {
      actions: {
        add: "Добавить место",
        clearFilters: "Сбросить",
        createRoute: "Создать маршрут",
        favorite: "Добавить в избранное",
        favoriteLocked: "Войдите, чтобы добавить в избранное",
        open: "Открыть место",
        removeFavorite: "Убрать из избранного",
        search: "Найти",
        showAll: "Показать все места",
      },
      cards: {
        address: "Адрес",
        durationUnknown: "Время не указано",
        free: "Бесплатно",
        from: "от",
        noAddress: "Адрес пока не указан",
        noPrice: "Цена не указана",
        upTo: "до",
      },
      categories: {
        all: "Все категории",
        architecture: "Архитектура",
        cafes: "Кафе",
        culture: "Культура",
        family: "Семья",
        food: "Еда",
        freePlaces: "Бесплатные места",
        hiddenPlaces: "Скрытые места",
        history: "История",
        museums: "Музеи",
        parks: "Парки",
        photoSpots: "Фото-места",
        place: "Место",
        romance: "Романтика",
      },
      detail: {
        about: "О месте",
        addedBy: "Добавил",
        back: "Назад",
        category: "Категория",
        coordinates: "Координаты",
        details: "Детали",
        errorTitle: "Не удалось загрузить место",
        gallery: "Фото",
        googleMaps: "Google Maps",
        invalidText: "Проверь ссылку на место и попробуй открыть каталог снова.",
        invalidTitle: "Место не найдено",
        mapMarker: "Место на карте",
        mapTitle: "Карта и адрес",
        mapUnavailableText: "У этого места пока нет корректных координат.",
        mapUnavailableTitle: "Карта пока недоступна",
        noSourceLinks: "Источник пока не указан",
        officialLink: "Официальный сайт",
        openMap: "Открыть на карте",
        priceRange: "Средняя цена",
        sourceLink: "Источник",
        sourceLinks: "Источники",
        sourceLinksText: "Ссылки помогают быстро проверить адрес, сайт и исходные данные места.",
        sourceType: "Тип источника",
        verification: "Проверка",
        visitDuration: "Время визита",
        yandexMaps: "Yandex Maps",
      },
      eyebrow: "Каталог мест",
      filters: {
        categoryAriaLabel: "Фильтр категорий мест",
        searchLabel: "Поиск мест",
        searchPlaceholder: "Найти парк, кафе, музей или адрес",
        statusAll: "Любой статус",
        statusAriaLabel: "Фильтр статуса проверки",
      },
      meta: {
        places: "мест",
      },
      sources: {
        aggregated: "Собрано",
        aggregatedShort: "Собрано",
        community: "Сообщество",
        communityShort: "Комьюнити",
        official: "Официально",
        officialShort: "Офиц.",
      },
      states: {
        emptyText: "Для этих фильтров пока нет мест. Попробуй другой запрос или категорию.",
        emptyTitle: "Места не найдены",
        errorText: "Не удалось загрузить места. Проверь API и попробуй ещё раз.",
        errorTitle: "Каталог мест недоступен",
      },
      submit: {
        moderationNote:
          "Добавленные места будут проходить проверку перед тем, как попадут в рекомендации и маршруты.",
        nextStepText:
          "API и валидация уже готовы. Саму форму добавления подключим отдельным этапом вместе с login/profile flow, чтобы не делать сырой UX.",
        nextStepTitle: "Форма добавления — следующий этап",
        subtitle:
          "Здесь будет вход для community-мест: название, категория, координаты, описание, ссылки и фото.",
        title: "Добавить место",
      },
      subtitle:
        "Проверенные городские места Кишинёва: парки, кафе, музеи, фототочки и локальные идеи для прогулок.",
      title: "Места для прогулок и маршрутов",
      verification: {
        closed: "Закрыто",
        communityConfirmed: "Подтверждено",
        needsImageReview: "Нужно проверить фото",
        needsLocationReview: "Нужно проверить локацию",
        needsReview: "На проверке",
        needsSourceReview: "Нужно проверить источник",
        rejected: "Отклонено",
        userAdded: "От пользователя",
        verified: "Проверено",
      },
    },
    shell: {
      account: {
        level: "Уровень 12",
        name: "Александр",
        openProfile: "Открыть профиль",
      },
      city: {
        ariaLabel: "Выбор города",
        loaded: "Город выбран",
        loading: "Загрузка города",
        unavailable: "Город недоступен",
      },
      language: {
        ariaLabel: "Сменить язык",
        title: "Язык",
      },
      menu: {
        close: "Закрыть меню",
        open: "Открыть меню",
      },
      nav: {
        active: "Текущий раздел",
        achievements: "Достижения",
        advanced: "Расширенный функционал",
        buddy: "Совместные прогулки",
        collections: "Подборка",
        createRoute: "Создать маршрут",
        deals: "Акции",
        events: "События",
        favorites: "Избранные места",
        groups: {
          community: "Сообщество",
          main: "Основное",
          more: "Ещё",
          my: "Моё",
        },
        history: "История прогулок",
        home: "Главная",
        map: "Карта",
        newPlaces: "Новые места",
        places: "Места",
        profile: "Профиль",
        randomRoute: "Случайный маршрут",
        savedRoutes: "Сохранённые маршруты",
        submitPlace: "Добавить место",
      },
      notifications: {
        ariaLabel: "Уведомления",
      },
      theme: {
        ariaLabel: "Сменить тему",
        current: "Текущая тема",
        dark: "Тёмная",
        light: "Светлая",
        system: "Системная",
        title: "Тема",
      },
    },
    routes: {
      labels: {
        routeTypes: {
          budget: "Бюджетный",
          cafe: "Кафе",
          cafeWalk: "Кафе + прогулка",
          culture: "Культура",
          date: "Свидание",
          family: "Семейный",
          friends: "С друзьями",
          other: "Маршрут",
          photo: "Фото-прогулка",
          walk: "Прогулка",
        },
        vibes: {
          balanced: "Сбалансированно",
          calm: "Спокойно",
          classic: "Классика",
          creative: "Вдохновение",
          easy: "Легко",
          history: "История",
          inspiring: "Вдохновляюще",
          local: "Локально",
          other: "Город",
          romantic: "Романтично",
        },
      },
      create: {
        actions: {
          generate: "Подобрать маршрут",
          generating: "Подбираем маршрут",
        },
        budget: {
          any: "Любой",
          free: "Бесплатно",
          low: "До 150 MDL",
          medium: "До 400 MDL",
        },
        durationHint: "От 60 до 480 минут",
        fields: {
          budget: "Бюджет",
          categories: "Интересы",
          city: "Город",
          duration: "Длительность",
          placeMode: "Места",
          routeType: "Тип маршрута",
          vibe: "Настроение",
        },
        placeMode: {
          includeCommunity: "Проверенные + community",
          verifiedOnly: "Только проверенные",
        },
        routeType: {
          cafe: "Кафе + прогулка",
          culture: "Культура",
          date: "Свидание",
          family: "Семейный день",
          friends: "С друзьями",
          walk: "Прогулка",
        },
        sections: {
          basics: "Основа",
          interests: "Что хочется",
          settings: "Настройки",
        },
        subtitle:
          "Выбери город, настроение и интересы. CityQuest соберёт маршрут из реальных мест.",
        title: "Создать маршрут",
        vibe: {
          balanced: "Сбалансированно",
          calm: "Спокойно",
          culture: "Культурно",
          fun: "Весело",
          nature: "Природа",
          romantic: "Романтично",
        },
      },
      results: {
        budget: "Бюджет",
        createAgain: "Создать другой",
        emptyText: "Сначала выбери предпочтения, и мы соберём маршрут.",
        emptyTitle: "Маршрут ещё не создан",
        errorTitle: "Не удалось загрузить маршрут",
        generatedBadge: "Сгенерировано CityQuest",
        loading: "Загружаем маршрут",
        minutes: "мин",
        openDetails: "Открыть маршрут",
        pointsTitle: "Этапы маршрута",
        save: "Сохранить",
        share: "Поделиться",
        subtitle: "Проверь маршрут, точки и примерное время прогулки.",
        title: "Готовый маршрут",
      },
      detail: {
        back: "Назад",
        collapseSheet: "Свернуть точки маршрута",
        expandSheet: "Развернуть точки маршрута",
        mapUnavailableText:
          "У этого маршрута пока недостаточно координат. Список точек остаётся доступен.",
        mapUnavailableTitle: "Карта пока недоступна",
        markerLabel: "Точка маршрута",
        openDirections: "Открыть в Google Maps",
        openPointMap: "Открыть на карте",
        routeOverview: "Маршрут на карте",
        routeSteps: "Точки маршрута",
      },
    },
  },
  en: {
    common: {
      appDescription: "A planner for city leisure and routes.",
      appName: "CityQuest",
      apiOffline: "API is unavailable",
      defaultCity: "Chisinau",
      loading: "Loading",
      theme: "Theme",
      themeDark: "Dark theme",
      themeLight: "Light theme",
      themeSystem: "System theme",
    },
    home: {
      actions: [
        {
          cta: "Surprise me",
          id: "random",
          text: "A route for today in one tap.",
          title: "Random route",
        },
        {
          cta: "Create route",
          id: "create",
          text: "Set preferences and walk format.",
          title: "Choose myself",
        },
        {
          cta: "Log in / Register",
          id: "profile",
          text: "Save routes and recommendations.",
          title: "My profile",
        },
      ],
      cityError: "City did not load",
      cityPrefix: "City",
      cityReady: "City selected",
      eyebrow: "Your plan for today",
      subtitle: "Pick a route for a walk, date, friends meetup or family day.",
      title: "What will you do today?",
    },
    collections: {
      actions: {
        create: "Create route",
        open: "Open",
      },
      cards: {
        cityquestAuthor: "CityQuest",
        startsAt: "Starts at",
        stops: "stops",
      },
      eyebrow: "Route collection",
      filters: {
        all: "All types",
        ariaLabel: "Route type filter",
      },
      meta: {
        routes: "routes",
      },
      states: {
        emptyText: "There are no routes for this filter yet. Try another type or create a new route.",
        emptyTitle: "No routes found",
        errorText: "Could not load the collection. Check the API and try again.",
        errorTitle: "Collection unavailable",
      },
      subtitle:
        "Ready-made Chisinau routes: popular walks, fresh ideas, nearby short options and routes people save often.",
      tabs: {
        ariaLabel: "Collection sections",
        following: "Saved often",
        nearby: "Nearby",
        new: "New",
        popular: "Popular",
      },
      title: "Route collection",
    },
    places: {
      actions: {
        add: "Add place",
        clearFilters: "Clear",
        createRoute: "Create route",
        favorite: "Add to favorites",
        favoriteLocked: "Log in to add favorites",
        open: "Open place",
        removeFavorite: "Remove from favorites",
        search: "Search",
        showAll: "Show all places",
      },
      cards: {
        address: "Address",
        durationUnknown: "Time not set",
        free: "Free",
        from: "from",
        noAddress: "Address is not set yet",
        noPrice: "Price not set",
        upTo: "up to",
      },
      categories: {
        all: "All categories",
        architecture: "Architecture",
        cafes: "Cafes",
        culture: "Culture",
        family: "Family",
        food: "Food",
        freePlaces: "Free places",
        hiddenPlaces: "Hidden places",
        history: "History",
        museums: "Museums",
        parks: "Parks",
        photoSpots: "Photo spots",
        place: "Place",
        romance: "Romance",
      },
      detail: {
        about: "About",
        addedBy: "Added by",
        back: "Back",
        category: "Category",
        coordinates: "Coordinates",
        details: "Details",
        errorTitle: "Could not load place",
        gallery: "Photos",
        googleMaps: "Google Maps",
        invalidText: "Check the place link and try opening the catalog again.",
        invalidTitle: "Place not found",
        mapMarker: "Place on map",
        mapTitle: "Map and address",
        mapUnavailableText: "This place does not have valid coordinates yet.",
        mapUnavailableTitle: "Map is not available yet",
        noSourceLinks: "No source is available yet",
        officialLink: "Official website",
        openMap: "Open on map",
        priceRange: "Average price",
        sourceLink: "Source",
        sourceLinks: "Sources",
        sourceLinksText: "Links help verify the address, website and source data quickly.",
        sourceType: "Source type",
        verification: "Verification",
        visitDuration: "Visit time",
        yandexMaps: "Yandex Maps",
      },
      eyebrow: "Places catalog",
      filters: {
        categoryAriaLabel: "Place category filter",
        searchLabel: "Search places",
        searchPlaceholder: "Find a park, cafe, museum or address",
        statusAll: "Any status",
        statusAriaLabel: "Verification status filter",
      },
      meta: {
        places: "places",
      },
      sources: {
        aggregated: "Aggregated",
        aggregatedShort: "Aggregated",
        community: "Community",
        communityShort: "Community",
        official: "Official",
        officialShort: "Official",
      },
      states: {
        emptyText: "There are no places for these filters yet. Try another query or category.",
        emptyTitle: "No places found",
        errorText: "Could not load places. Check the API and try again.",
        errorTitle: "Places catalog unavailable",
      },
      submit: {
        moderationNote:
          "Submitted places will be reviewed before they appear in recommendations and routes.",
        nextStepText:
          "The API and validation are already ready. The submission form will be connected as a separate stage together with login/profile flow so the UX does not ship half-baked.",
        nextStepTitle: "Submission form is the next stage",
        subtitle:
          "This will be the entry point for community places: name, category, coordinates, description, links and photos.",
        title: "Add place",
      },
      subtitle:
        "Verified Chisinau places: parks, cafes, museums, photo spots and local ideas for walks.",
      title: "Places for walks and routes",
      verification: {
        closed: "Closed",
        communityConfirmed: "Confirmed",
        needsImageReview: "Needs image review",
        needsLocationReview: "Needs location review",
        needsReview: "Needs review",
        needsSourceReview: "Needs source review",
        rejected: "Rejected",
        userAdded: "User added",
        verified: "Verified",
      },
    },
    shell: {
      account: {
        level: "Level 12",
        name: "Alexander",
        openProfile: "Open profile",
      },
      city: {
        ariaLabel: "City selector",
        loaded: "City selected",
        loading: "Loading city",
        unavailable: "City unavailable",
      },
      language: {
        ariaLabel: "Change language",
        title: "Language",
      },
      menu: {
        close: "Close menu",
        open: "Open menu",
      },
      nav: {
        active: "Current section",
        achievements: "Achievements",
        advanced: "Advanced",
        buddy: "Shared walks",
        collections: "Collections",
        createRoute: "Create route",
        deals: "Deals",
        events: "Events",
        favorites: "Favorite places",
        groups: {
          community: "Community",
          main: "Main",
          more: "More",
          my: "My",
        },
        history: "Walk history",
        home: "Home",
        map: "Map",
        newPlaces: "New places",
        places: "Places",
        profile: "Profile",
        randomRoute: "Random route",
        savedRoutes: "Saved routes",
        submitPlace: "Add place",
      },
      notifications: {
        ariaLabel: "Notifications",
      },
      theme: {
        ariaLabel: "Change theme",
        current: "Current theme",
        dark: "Dark",
        light: "Light",
        system: "System",
        title: "Theme",
      },
    },
    routes: {
      labels: {
        routeTypes: {
          budget: "Budget",
          cafe: "Cafe",
          cafeWalk: "Cafe + walk",
          culture: "Culture",
          date: "Date",
          family: "Family",
          friends: "With friends",
          other: "Route",
          photo: "Photo walk",
          walk: "Walk",
        },
        vibes: {
          balanced: "Balanced",
          calm: "Calm",
          classic: "Classic",
          creative: "Creative",
          easy: "Easy",
          history: "History",
          inspiring: "Inspiring",
          local: "Local",
          other: "City",
          romantic: "Romantic",
        },
      },
      create: {
        actions: {
          generate: "Generate route",
          generating: "Generating route",
        },
        budget: {
          any: "Any",
          free: "Free",
          low: "Up to 150 MDL",
          medium: "Up to 400 MDL",
        },
        durationHint: "From 60 to 480 minutes",
        fields: {
          budget: "Budget",
          categories: "Interests",
          city: "City",
          duration: "Duration",
          placeMode: "Places",
          routeType: "Route type",
          vibe: "Vibe",
        },
        placeMode: {
          includeCommunity: "Verified + community",
          verifiedOnly: "Verified only",
        },
        routeType: {
          cafe: "Cafe + walk",
          culture: "Culture",
          date: "Date",
          family: "Family day",
          friends: "With friends",
          walk: "Walk",
        },
        sections: {
          basics: "Basics",
          interests: "What you want",
          settings: "Settings",
        },
        subtitle:
          "Choose a city, vibe and interests. CityQuest will build a route from real places.",
        title: "Create route",
        vibe: {
          balanced: "Balanced",
          calm: "Calm",
          culture: "Cultural",
          fun: "Fun",
          nature: "Nature",
          romantic: "Romantic",
        },
      },
      results: {
        budget: "Budget",
        createAgain: "Create another",
        emptyText: "Choose your preferences first, and CityQuest will build a route.",
        emptyTitle: "No route yet",
        errorTitle: "Could not load route",
        generatedBadge: "Generated by CityQuest",
        loading: "Loading route",
        minutes: "min",
        openDetails: "Open route",
        pointsTitle: "Route steps",
        save: "Save",
        share: "Share",
        subtitle: "Review the route, stops and estimated walking time.",
        title: "Ready route",
      },
      detail: {
        back: "Back",
        collapseSheet: "Collapse route stops",
        expandSheet: "Expand route stops",
        mapUnavailableText:
          "This route does not have enough coordinates yet. The stop list is still available.",
        mapUnavailableTitle: "Map is not available yet",
        markerLabel: "Route stop",
        openDirections: "Open in Google Maps",
        openPointMap: "Open on map",
        routeOverview: "Route on map",
        routeSteps: "Route stops",
      },
    },
  },
  ro: {
    common: {
      appDescription: "Planificator pentru timp liber urban și trasee.",
      appName: "CityQuest",
      apiOffline: "API-ul nu este disponibil",
      defaultCity: "Chișinău",
      loading: "Se încarcă",
      theme: "Temă",
      themeDark: "Temă întunecată",
      themeLight: "Temă luminoasă",
      themeSystem: "Tema sistemului",
    },
    home: {
      actions: [
        {
          cta: "Am noroc",
          id: "random",
          text: "Un traseu pentru azi dintr-un click.",
          title: "Traseu aleatoriu",
        },
        {
          cta: "Creează traseu",
          id: "create",
          text: "Alege preferințele și formatul plimbării.",
          title: "Aleg singur",
        },
        {
          cta: "Intră / Înregistrează-te",
          id: "profile",
          text: "Salvează trasee și recomandări.",
          title: "Profilul meu",
        },
      ],
      cityError: "Orașul nu s-a încărcat",
      cityPrefix: "Oraș",
      cityReady: "Oras selectat",
      eyebrow: "Planul tău pentru azi",
      subtitle:
        "Alege un traseu pentru plimbare, întâlnire, prieteni sau o zi în familie.",
      title: "Ce faci astăzi?",
    },
    collections: {
      actions: {
        create: "Creează traseu",
        open: "Deschide",
      },
      cards: {
        cityquestAuthor: "CityQuest",
        startsAt: "Start",
        stops: "opriri",
      },
      eyebrow: "Colecție de trasee",
      filters: {
        all: "Toate tipurile",
        ariaLabel: "Filtru tip traseu",
      },
      meta: {
        routes: "trasee",
      },
      states: {
        emptyText: "Nu există încă trasee pentru acest filtru. Încearcă alt tip sau creează un traseu nou.",
        emptyTitle: "Nu am găsit trasee",
        errorText: "Colecția nu a putut fi încărcată. Verifică API-ul și încearcă din nou.",
        errorTitle: "Colecția nu este disponibilă",
      },
      subtitle:
        "Trasee gata pentru Chișinău: plimbări populare, idei noi, variante scurte din apropiere și trasee salvate des.",
      tabs: {
        ariaLabel: "Secțiuni colecție",
        following: "Salvate des",
        nearby: "Aproape",
        new: "Noi",
        popular: "Populare",
      },
      title: "Colecție de trasee",
    },
    places: {
      actions: {
        add: "Adaugă loc",
        clearFilters: "Resetează",
        createRoute: "Creează traseu",
        favorite: "Adaugă la favorite",
        favoriteLocked: "Intră în cont pentru favorite",
        open: "Deschide locul",
        removeFavorite: "Elimină din favorite",
        search: "Caută",
        showAll: "Arată toate locurile",
      },
      cards: {
        address: "Adresă",
        durationUnknown: "Timp nesetat",
        free: "Gratuit",
        from: "de la",
        noAddress: "Adresa nu este setată încă",
        noPrice: "Preț nesetat",
        upTo: "până la",
      },
      categories: {
        all: "Toate categoriile",
        architecture: "Arhitectură",
        cafes: "Cafenele",
        culture: "Cultură",
        family: "Familie",
        food: "Mâncare",
        freePlaces: "Locuri gratuite",
        hiddenPlaces: "Locuri ascunse",
        history: "Istorie",
        museums: "Muzee",
        parks: "Parcuri",
        photoSpots: "Locuri foto",
        place: "Loc",
        romance: "Romantic",
      },
      detail: {
        about: "Despre loc",
        addedBy: "Adăugat de",
        back: "Înapoi",
        category: "Categorie",
        coordinates: "Coordonate",
        details: "Detalii",
        errorTitle: "Locul nu a putut fi încărcat",
        gallery: "Fotografii",
        googleMaps: "Google Maps",
        invalidText: "Verifică linkul locului și încearcă să deschizi catalogul din nou.",
        invalidTitle: "Locul nu a fost găsit",
        mapMarker: "Loc pe hartă",
        mapTitle: "Hartă și adresă",
        mapUnavailableText: "Acest loc nu are încă coordonate valide.",
        mapUnavailableTitle: "Harta nu este disponibilă încă",
        noSourceLinks: "Nu există încă surse",
        officialLink: "Site oficial",
        openMap: "Deschide pe hartă",
        priceRange: "Preț mediu",
        sourceLink: "Sursă",
        sourceLinks: "Surse",
        sourceLinksText: "Linkurile ajută la verificarea rapidă a adresei, site-ului și datelor sursă.",
        sourceType: "Tip sursă",
        verification: "Verificare",
        visitDuration: "Timp vizită",
        yandexMaps: "Yandex Maps",
      },
      eyebrow: "Catalog de locuri",
      filters: {
        categoryAriaLabel: "Filtru categorii locuri",
        searchLabel: "Caută locuri",
        searchPlaceholder: "Găsește un parc, o cafenea, un muzeu sau o adresă",
        statusAll: "Orice statut",
        statusAriaLabel: "Filtru statut verificare",
      },
      meta: {
        places: "locuri",
      },
      sources: {
        aggregated: "Agregat",
        aggregatedShort: "Agregat",
        community: "Comunitate",
        communityShort: "Comunitate",
        official: "Oficial",
        officialShort: "Oficial",
      },
      states: {
        emptyText: "Nu există încă locuri pentru aceste filtre. Încearcă altă căutare sau categorie.",
        emptyTitle: "Nu am găsit locuri",
        errorText: "Locurile nu au putut fi încărcate. Verifică API-ul și încearcă din nou.",
        errorTitle: "Catalogul de locuri nu este disponibil",
      },
      submit: {
        moderationNote:
          "Locurile trimise vor fi verificate înainte să apară în recomandări și trasee.",
        nextStepText:
          "API-ul și validarea sunt deja pregătite. Formularul va fi conectat într-o etapă separată împreună cu login/profile flow, ca UX-ul să nu fie livrat incomplet.",
        nextStepTitle: "Formularul de adăugare este etapa următoare",
        subtitle:
          "Aici va fi intrarea pentru locuri din comunitate: nume, categorie, coordonate, descriere, linkuri și fotografii.",
        title: "Adaugă loc",
      },
      subtitle:
        "Locuri verificate din Chișinău: parcuri, cafenele, muzee, puncte foto și idei locale pentru plimbări.",
      title: "Locuri pentru plimbări și trasee",
      verification: {
        closed: "Inchis",
        communityConfirmed: "Confirmat",
        needsImageReview: "Necesita verificarea imaginii",
        needsLocationReview: "Necesita verificarea locatiei",
        needsReview: "In verificare",
        needsSourceReview: "Necesita verificarea sursei",
        rejected: "Respins",
        userAdded: "Adăugat de utilizator",
        verified: "Verificat",
      },
    },
    shell: {
      account: {
        level: "Nivel 12",
        name: "Alexandru",
        openProfile: "Deschide profilul",
      },
      city: {
        ariaLabel: "Selector oraș",
        loaded: "Oras selectat",
        loading: "Se încarcă orașul",
        unavailable: "Oraș indisponibil",
      },
      language: {
        ariaLabel: "Schimbă limba",
        title: "Limbă",
      },
      menu: {
        close: "Închide meniul",
        open: "Deschide meniul",
      },
      nav: {
        active: "Secțiune curentă",
        achievements: "Realizări",
        advanced: "Funcții avansate",
        buddy: "Plimbări împreună",
        collections: "Colecții",
        createRoute: "Creează traseu",
        deals: "Promoții",
        events: "Evenimente",
        favorites: "Locuri favorite",
        groups: {
          community: "Comunitate",
          main: "Principal",
          more: "Mai mult",
          my: "Ale mele",
        },
        history: "Istoricul plimbărilor",
        home: "Acasă",
        map: "Hartă",
        newPlaces: "Locuri noi",
        places: "Locuri",
        profile: "Profil",
        randomRoute: "Traseu aleatoriu",
        savedRoutes: "Trasee salvate",
        submitPlace: "Adaugă loc",
      },
      notifications: {
        ariaLabel: "Notificări",
      },
      theme: {
        ariaLabel: "Schimbă tema",
        current: "Tema curentă",
        dark: "Întunecată",
        light: "Luminoasă",
        system: "Sistem",
        title: "Temă",
      },
    },
    routes: {
      labels: {
        routeTypes: {
          budget: "Buget",
          cafe: "Cafea",
          cafeWalk: "Cafea + plimbare",
          culture: "Cultură",
          date: "Întâlnire",
          family: "Familie",
          friends: "Cu prietenii",
          other: "Traseu",
          photo: "Foto-plimbare",
          walk: "Plimbare",
        },
        vibes: {
          balanced: "Echilibrat",
          calm: "Liniștit",
          classic: "Clasic",
          creative: "Creativ",
          easy: "Ușor",
          history: "Istorie",
          inspiring: "Inspirație",
          local: "Local",
          other: "Oraș",
          romantic: "Romantic",
        },
      },
      create: {
        actions: {
          generate: "Generează traseu",
          generating: "Generăm traseul",
        },
        budget: {
          any: "Oricare",
          free: "Gratuit",
          low: "Până la 150 MDL",
          medium: "Până la 400 MDL",
        },
        durationHint: "De la 60 la 480 de minute",
        fields: {
          budget: "Buget",
          categories: "Interese",
          city: "Oraș",
          duration: "Durată",
          placeMode: "Locuri",
          routeType: "Tip traseu",
          vibe: "Atmosferă",
        },
        placeMode: {
          includeCommunity: "Verificate + community",
          verifiedOnly: "Doar verificate",
        },
        routeType: {
          cafe: "Cafea + plimbare",
          culture: "Cultură",
          date: "Întâlnire",
          family: "Zi în familie",
          friends: "Cu prietenii",
          walk: "Plimbare",
        },
        sections: {
          basics: "Baza",
          interests: "Ce îți dorești",
          settings: "Setări",
        },
        subtitle:
          "Alege orașul, atmosfera și interesele. CityQuest va construi un traseu din locuri reale.",
        title: "Creează traseu",
        vibe: {
          balanced: "Echilibrat",
          calm: "Liniștit",
          culture: "Cultural",
          fun: "Distractiv",
          nature: "Natură",
          romantic: "Romantic",
        },
      },
      results: {
        budget: "Buget",
        createAgain: "Creează altul",
        emptyText: "Alege mai întâi preferințele, iar CityQuest va crea un traseu.",
        emptyTitle: "Nu există încă traseu",
        errorTitle: "Traseul nu a putut fi încărcat",
        generatedBadge: "Generat de CityQuest",
        loading: "Se încarcă traseul",
        minutes: "min",
        openDetails: "Deschide traseul",
        pointsTitle: "Etapele traseului",
        save: "Salvează",
        share: "Distribuie",
        subtitle: "Verifică traseul, opririle și timpul estimat de plimbare.",
        title: "Traseu gata",
      },
      detail: {
        back: "Înapoi",
        collapseSheet: "Restrânge opririle traseului",
        expandSheet: "Extinde opririle traseului",
        mapUnavailableText:
          "Acest traseu nu are încă suficiente coordonate. Lista opririlor rămâne disponibilă.",
        mapUnavailableTitle: "Harta nu este disponibilă încă",
        markerLabel: "Oprire pe traseu",
        openDirections: "Deschide în Google Maps",
        openPointMap: "Deschide pe hartă",
        routeOverview: "Traseu pe hartă",
        routeSteps: "Opririle traseului",
      },
    },
  },
};
