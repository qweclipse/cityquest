"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  CalendarCheck2,
  Check,
  Compass,
  Footprints,
  Loader2,
  Lock,
  LogOut,
  MapPinned,
  Palette,
  PlusCircle,
  Route as RouteIcon,
  Settings,
  Sparkles,
  Star,
  Trophy,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";

import {
  FormField,
  inputClassName,
  selectClassName,
  textareaClassName,
} from "@/components/common/form-controls";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCities, useLogout, useProfile, useUpdateProfile } from "@/hooks/api";
import type {
  AvatarItem,
  AvatarRarity,
  AvatarSlot,
  CityRoute,
  EquippedAvatarItems,
  Place,
  UpdateProfilePayload,
  User,
  UserProgress,
} from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import {
  getLocalizedAchievementContent,
  getLocalizedPlaceContent,
  getLocalizedPlaceNameText,
  getLocalizedRouteContent,
} from "@/lib/i18n/content-localization";
import {
  localizedLanguageNames,
  localizedThemeNames,
  profileCopy,
} from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { categoryDisplayName } from "@/lib/places/place-format";
import {
  avatarItems,
  avatarRarityLabels,
  avatarSlotLabels,
  avatarSlots,
  defaultEquippedAvatarItems,
} from "@/lib/profile/avatar-items";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/lib/validation/cityquest-schemas";
import {
  questAccentClass,
  questAccentIconClassName,
  questAccentPanelClassName,
} from "@/lib/theme/quest-accents";
import { cn } from "@/lib/utils";

const languageCodes = ["ru", "en", "ro"] as const;
const themeCodes = ["system", "light", "dark"] as const;
const guestBenefitIcons = [RouteIcon, Star, Sparkles, Footprints, PlusCircle, Trophy] as const;

type ProfileTabId = "avatar" | "public" | "journal";
type InventorySlotFilter = AvatarSlot | "all";
type InventoryRarityFilter = AvatarRarity | "all";
type PublicVisibility = "private" | "community" | "routes";

const avatarEquipmentStorageKey = "cityquest.profile.equippedAvatarItems.v1";
const profileTabParamName = "tab";

const profileTabs: Array<{
  accentClassName: string;
  id: ProfileTabId;
  label: string;
}> = [
  {
    accentClassName: questAccentClass("teal"),
    id: "avatar",
    label: "Мой аватар",
  },
  {
    accentClassName: questAccentClass("plum"),
    id: "public",
    label: "Публичный профиль",
  },
  {
    accentClassName: questAccentClass("gold"),
    id: "journal",
    label: "Городской журнал",
  },
];

const avatarRarityBorderColors: Record<AvatarRarity, string> = {
  common: "#8a8f88",
  epic: "#b28adf",
  rare: "#5fa8d3",
  uncommon: "#8fcb6b",
};

const profileCategoryOptions = [
  { id: "walks", label: "Прогулки" },
  { id: "cafes", label: "Кафе" },
  { id: "parks", label: "Парки" },
  { id: "museums", label: "Музеи" },
  { id: "photo", label: "Фотопрогулки" },
  { id: "family", label: "Семейные маршруты" },
];

const lockedAchievementExamples = [
  {
    code: "first-route",
    description: "Заверши первый городской маршрут.",
    name: "First Route",
  },
  {
    code: "park-lover",
    description: "Добавь несколько зеленых точек в любимые.",
    name: "Park Lover",
  },
  {
    code: "coffee-walker",
    description: "Собери маршрут с уютной кофейной остановкой.",
    name: "Coffee Walker",
  },
  {
    code: "culture-day",
    description: "Проведи день с музеями и историей.",
    name: "Culture Day",
  },
  {
    code: "local-expert",
    description: "Помоги другим открыть город через места.",
    name: "Local Expert",
  },
];

const profileRetentionCopy = {
  en: {
    actions: {
      createRoute: "Create route",
      explorePlaces: "Explore places",
      openRoute: "Open route",
      startSuggested: "Continue plan",
    },
    activity: {
      completed: "Completed",
      empty: "Start or complete a route to build your city history.",
      started: "Started",
      title: "Recent route activity",
    },
    contributions: {
      approved: "Approved",
      empty: "Add a place and its moderation status will appear here.",
      last: "Latest",
      pending: "In review",
      rejected: "Rejected",
      title: "Community contribution status",
      total: "Submitted",
    },
    guestBenefits: [
      ["Save routes", "Keep plans for later walks and weekends."],
      ["Favorite places", "Build a personal map of places worth returning to."],
      ["Personal suggestions", "Use saves and favorites to tune future route ideas."],
      ["Track progress", "Start routes, complete walks and keep a history."],
      ["Contribute places", "Submit local places and follow review status."],
      ["Unlock achievements", "Turn exploration into visible progress."],
    ],
    sections: {
      nextRoute: "Next recommended route",
      vibe: "Your city vibe",
    },
    stats: {
      completed: "Completed",
    },
    vibeEmpty: "Save routes or favorite places to shape your city vibe.",
  },
  ro: {
    actions: {
      createRoute: "Creeaza traseu",
      explorePlaces: "Exploreaza locuri",
      openRoute: "Deschide traseul",
      startSuggested: "Continua planul",
    },
    activity: {
      completed: "Finalizat",
      empty: "Porneste sau finalizeaza un traseu ca sa construiesti istoricul.",
      started: "Pornit",
      title: "Activitate recenta pe trasee",
    },
    contributions: {
      approved: "Aprobat",
      empty: "Adauga un loc si statusul moderarii va aparea aici.",
      last: "Ultimul",
      pending: "In verificare",
      rejected: "Respins",
      title: "Status contributii comunitate",
      total: "Trimise",
    },
    guestBenefits: [
      ["Salveaza trasee", "Pastreaza planuri pentru plimbari si weekenduri."],
      ["Locuri favorite", "Construieste o harta personala cu locuri bune."],
      ["Sugestii personale", "Favoritele si salvarile vor ajuta recomandarile."],
      ["Urmareste progresul", "Porneste, finalizeaza si pastreaza istoricul."],
      ["Contribuie locuri", "Trimite locuri locale si urmareste verificarea."],
      ["Deblocheaza realizari", "Transforma explorarea in progres vizibil."],
    ],
    sections: {
      nextRoute: "Urmatorul traseu recomandat",
      vibe: "Vibe-ul tau urban",
    },
    stats: {
      completed: "Finalizate",
    },
    vibeEmpty: "Salveaza trasee sau locuri favorite ca sa-ti definesti vibe-ul.",
  },
  ru: {
    actions: {
      createRoute: "Создать маршрут",
      explorePlaces: "Открыть места",
      openRoute: "Открыть маршрут",
      startSuggested: "Продолжить план",
    },
    activity: {
      completed: "Завершён",
      empty: "Начните или завершите маршрут, чтобы собрать историю прогулок.",
      started: "Начат",
      title: "Недавняя активность маршрутов",
    },
    contributions: {
      approved: "Одобрено",
      empty: "Добавьте место, и статус модерации появится здесь.",
      last: "Последнее",
      pending: "На проверке",
      rejected: "Отклонено",
      title: "Статус вкладов в сообщество",
      total: "Отправлено",
    },
    guestBenefits: [
      ["Сохранять маршруты", "Держать планы для прогулок и выходных."],
      ["Избранные места", "Собирать личную карту мест, куда хочется вернуться."],
      ["Личные подсказки", "Сохранения и избранное будут улучшать рекомендации."],
      ["Отслеживать прогресс", "Начинать маршруты, завершать прогулки и видеть историю."],
      ["Добавлять места", "Предлагать локальные места и видеть статус проверки."],
      ["Открывать достижения", "Превращать прогулки в видимый прогресс."],
    ],
    sections: {
      nextRoute: "Следующий маршрут",
      vibe: "Твой city vibe",
    },
    stats: {
      completed: "Завершено",
    },
    vibeEmpty: "Сохраняйте маршруты и места, чтобы CityQuest понял ваш городской вкус.",
  },
} as const;

type ProfileRetentionCopy = (typeof profileRetentionCopy)[keyof typeof profileRetentionCopy];

export function ProfilePage() {
  const auth = useAuth();
  const { language } = useI18n();
  const copy = profileCopy[language];
  const retentionCopy = profileRetentionCopy[language];
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const citiesQuery = useCities();
  const setAuthUser = auth.setUser;
  const [activeTab, setActiveTab] = useState<ProfileTabId>("avatar");
  // TODO: Persist bio, visibility and favorite categories when the profile API supports them.
  const [bio, setBio] = useState("");
  const [avatarEquipmentHydrated, setAvatarEquipmentHydrated] = useState(false);
  const [equippedItems, setEquippedItems] = useState<EquippedAvatarItems>(
    defaultEquippedAvatarItems,
  );
  const [favoriteCategoryIds, setFavoriteCategoryIds] = useState<string[]>([
    "walks",
    "cafes",
    "parks",
  ]);
  const [publicVisibility, setPublicVisibility] =
    useState<PublicVisibility>("community");
  const [saved, setSaved] = useState(false);
  const profile = profileQuery.data ?? auth.user;
  const detailsLoaded = hasLoadedProfileDetails(profile);
  const detailsLoading = profileQuery.isFetching && !detailsLoaded;
  const savedRoutes = detailsLoaded ? (profile?.saved_routes ?? []) : [];
  const favoritePlaces = detailsLoaded ? (profile?.favorite_places ?? []) : [];
  const achievements = detailsLoaded ? (profile?.achievements ?? []) : [];
  const recentActivity = detailsLoaded ? (profile?.recent_route_activity ?? []) : [];
  const suggestedRoute = detailsLoaded ? (profile?.suggested_next_route ?? null) : null;
  const preferredCategories = detailsLoaded ? (profile?.preferred_categories ?? []) : [];
  const preferredVibes = detailsLoaded ? (profile?.preferred_vibes ?? []) : [];
  const contributionStatus = detailsLoaded ? (profile?.contribution_status ?? null) : null;
  const completedActivityCount = recentActivity.filter(
    (activity) => activity.status === "completed",
  ).length;
  const ownedItemsCount = avatarItems.filter((item) => item.owned).length;
  const stats = useMemo(
    () => ({
      achievements: profile?.stats?.achievements_count ?? achievements.length,
      completed: profile?.stats?.completed_routes_count ?? completedActivityCount,
      contributions: profile?.stats?.contributions_count ?? contributionStatus?.total ?? 0,
      discovered: Math.max(favoritePlaces.length, contributionStatus?.approved ?? 0),
      favorites: profile?.stats?.favorite_places_count ?? favoritePlaces.length,
      items: ownedItemsCount,
      routes: profile?.stats?.saved_routes_count ?? savedRoutes.length,
    }),
    [
      achievements.length,
      completedActivityCount,
      contributionStatus?.approved,
      contributionStatus?.total,
      favoritePlaces.length,
      ownedItemsCount,
      profile?.stats?.achievements_count,
      profile?.stats?.completed_routes_count,
      profile?.stats?.contributions_count,
      profile?.stats?.favorite_places_count,
      profile?.stats?.saved_routes_count,
      savedRoutes.length,
    ],
  );
  const progress = useMemo<UserProgress>(
    () => ({
      achievements_count: stats.achievements,
      items_owned_count: stats.items,
      level: Math.max(profile?.level ?? 1, 1),
      places_discovered: stats.discovered,
      routes_completed: stats.completed,
      xp: Math.min(900, 90 + stats.completed * 140 + stats.achievements * 80),
      xp_to_next_level: 1000,
    }),
    [
      profile?.level,
      stats.achievements,
      stats.completed,
      stats.discovered,
      stats.items,
    ],
  );
  const form = useForm<UpdateProfileFormValues>({
    defaultValues: {},
    resolver: zodResolver(updateProfileSchema),
  });
  const watchedProfileValues = useWatch({ control: form.control });
  const selectedCity =
    citiesQuery.data?.find((city) => city.id === watchedProfileValues.preferred_city_id) ??
    profile?.preferred_city ??
    null;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const requestedTab = getProfileTabFromLocation();
      const storedEquipment = readStoredEquippedAvatarItems();

      if (requestedTab) {
        setActiveTab(requestedTab);
      }

      if (storedEquipment) {
        setEquippedItems(storedEquipment);
      }

      setAvatarEquipmentHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!avatarEquipmentHydrated) {
      return;
    }

    window.localStorage.setItem(
      avatarEquipmentStorageKey,
      JSON.stringify(equippedItems),
    );
  }, [avatarEquipmentHydrated, equippedItems]);

  useEffect(() => {
    if (profileQuery.data) {
      setAuthUser(profileQuery.data);
    }
  }, [profileQuery.data, setAuthUser]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    form.reset({
      avatar_url: profile.avatar_url ?? "",
      name: profile.name,
      preferred_city_id: profile.preferred_city?.id ?? null,
      preferred_language: profile.preferred_language,
      preferred_theme: profile.preferred_theme,
    });
  }, [form, profile]);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSaved(false), 2500);

    return () => window.clearTimeout(timeoutId);
  }, [saved]);

  const onSubmit = form.handleSubmit((values) => {
    const payload: UpdateProfilePayload = {
      ...values,
      avatar_url: emptyToNull(values.avatar_url),
      name: values.name?.trim(),
      preferred_city_id: values.preferred_city_id ?? null,
    };

    updateProfile.mutate(payload, {
      onSuccess: () => setSaved(true),
    });
  });

  function equipAvatarItem(item: AvatarItem) {
    if (!item.owned) {
      return;
    }

    setEquippedItems((current) => ({
      ...current,
      [item.slot]: item.id,
    }));
  }

  function handleTabChange(nextTab: ProfileTabId) {
    setActiveTab(nextTab);
    updateProfileTabUrl(nextTab);
  }

  function toggleFavoriteCategory(categoryId: string) {
    setFavoriteCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  if (!auth.isHydrated) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          {copy.title}
        </div>
      </section>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={cn(
            "rounded-lg border p-6 shadow-sm sm:p-8",
            questAccentClass("plum"),
            questAccentPanelClassName,
          )}
        >
          <div className={cn("grid size-12 place-items-center rounded-lg", questAccentIconClassName)}>
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">{copy.guest.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {copy.guest.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className={buttonVariants()} href="/login">
              {copy.actions.login}
            </Link>
            <Link className={buttonVariants({ variant: "outline" })} href="/register">
              {copy.actions.register}
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {retentionCopy.guestBenefits.map(([title, text], index) => {
              const Icon = guestBenefitIcons[index] ?? Sparkles;

              return (
                <div
                  className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3"
                  key={title}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
                    {title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (profileQuery.isLoading && !profile) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline size-4 animate-spin" aria-hidden="true" />
          {copy.title}
        </div>
      </section>
    );
  }

  if (profileQuery.isError && !profile) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-destructive">
          {getApiErrorMessage(profileQuery.error, copy.errors.load)}
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ProfileHero
        logout={logout}
        profile={profile}
        progress={progress}
        stats={stats}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="mt-5">
        {activeTab === "avatar" ? (
          <AvatarTab
            detailsLoading={detailsLoading}
            equippedItems={equippedItems}
            onEquip={equipAvatarItem}
            progress={progress}
            stats={stats}
          />
        ) : null}

        {activeTab === "public" ? (
          <PublicProfileTab
            bio={bio}
            citiesLoading={citiesQuery.isLoading}
            cities={citiesQuery.data ?? []}
            copy={copy}
            favoriteCategoryIds={favoriteCategoryIds}
            form={form}
            formValues={watchedProfileValues}
            onBioChange={setBio}
            onSubmit={onSubmit}
            onToggleFavoriteCategory={toggleFavoriteCategory}
            onVisibilityChange={setPublicVisibility}
            profile={profile}
            publicVisibility={publicVisibility}
            saved={saved}
            selectedCityName={selectedCity?.name ?? null}
            stats={stats}
            updateProfileError={updateProfile.error}
            updateProfilePending={updateProfile.isPending}
          />
        ) : null}

        {activeTab === "journal" ? (
          <CityJournalTab
            achievements={achievements}
            contributionStatus={contributionStatus}
            detailsLoading={detailsLoading}
            favoritePlaces={favoritePlaces}
            preferredCategories={preferredCategories}
            preferredVibes={preferredVibes}
            recentActivity={recentActivity}
            retentionCopy={retentionCopy}
            savedRoutes={savedRoutes}
            stats={stats}
            suggestedRoute={suggestedRoute}
          />
        ) : null}
      </div>
    </section>
  );
}

function ProfileHero({
  logout,
  profile,
  progress,
  stats,
}: {
  logout: ReturnType<typeof useLogout>;
  profile: User;
  progress: UserProgress;
  stats: ProfileStats;
}) {
  const progressPercent = Math.min(
    100,
    Math.round((progress.xp / progress.xp_to_next_level) * 100),
  );

  return (
    <header
      className={cn(
        "overflow-hidden rounded-lg border p-5 shadow-sm sm:p-6",
        questAccentClass("copper"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] text-2xl font-bold text-[var(--quest-accent)] shadow-sm">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="size-full object-cover" src={profile.avatar_url} />
            ) : (
              getInitial(profile.name)
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>
              <span className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 px-2 py-1 text-xs font-semibold text-[var(--quest-accent)]">
                Городской исследователь
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Level {progress.level}</span>
                <span className="text-muted-foreground">
                  {progress.xp}/{progress.xp_to_next_level} XP
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/80">
                <div
                  className="h-full rounded-full bg-[var(--quest-accent)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:min-w-[34rem]">
            <HeroStat label="Сохранено" value={stats.routes} />
            <HeroStat label="Завершено" value={stats.completed} />
            <HeroStat label="Избранное" value={stats.favorites} />
            <HeroStat label="Предметы" value={stats.items} />
            <HeroStat label="Достижения" value={stats.achievements} />
          </div>
          <Button
            className="self-start lg:self-end"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            type="button"
            variant="outline"
          >
            {logout.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            <LogOut className="size-4" aria-hidden="true" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}

type ProfileStats = {
  achievements: number;
  completed: number;
  contributions: number;
  discovered: number;
  favorites: number;
  items: number;
  routes: number;
};

function HeroStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3">
      <div className="text-xl font-bold text-[var(--quest-accent)]">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
}) {
  return (
    <div
      aria-label="Profile sections"
      className="mt-5 overflow-x-auto rounded-lg border border-border bg-card p-1"
      role="tablist"
    >
      <div className="flex min-w-max gap-1">
        {profileTabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              aria-controls={`profile-panel-${tab.id}`}
              aria-selected={isActive}
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-semibold outline-none transition focus-visible:ring-3 focus-visible:ring-ring/40",
                tab.accentClassName,
                isActive
                  ? "bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)] shadow-sm"
                  : "text-muted-foreground hover:bg-[var(--quest-accent-soft)] hover:text-[var(--quest-accent)]",
              )}
              id={`profile-tab-${tab.id}`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvatarTab({
  detailsLoading,
  equippedItems,
  onEquip,
  progress,
  stats,
}: {
  detailsLoading: boolean;
  equippedItems: EquippedAvatarItems;
  onEquip: (item: AvatarItem) => void;
  progress: UserProgress;
  stats: ProfileStats;
}) {
  const [slotFilter, setSlotFilter] = useState<InventorySlotFilter>("all");
  const [rarityFilter, setRarityFilter] = useState<InventoryRarityFilter>("all");
  const equippedIds = useMemo(() => new Set(Object.values(equippedItems)), [equippedItems]);
  const visibleItems = avatarItems.filter(
    (item) =>
      (slotFilter === "all" || item.slot === slotFilter) &&
      (rarityFilter === "all" || item.rarity === rarityFilter),
  );

  return (
    <section
      aria-labelledby="profile-tab-avatar"
      className="space-y-5"
      id="profile-panel-avatar"
      role="tabpanel"
    >
      <div
        className={cn(
          "grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]",
          questAccentClass("teal"),
        )}
      >
        <AvatarPreview equippedItems={equippedItems} />
        <EquipmentPanel equippedItems={equippedItems} />
      </div>

      <div
        className={cn(
          "rounded-lg border p-5 shadow-sm",
          questAccentClass("sage"),
          questAccentPanelClassName,
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Инвентарь</h2>
            </div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Собирай предметы за прогулки, достижения и активность в городе.
            </p>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <MiniProgressStat label="Предметы" value={stats.items} />
            <MiniProgressStat
              label="Маршруты"
              value={detailsLoading ? "..." : progress.routes_completed}
            />
            <MiniProgressStat
              label="Места"
              value={detailsLoading ? "..." : progress.places_discovered}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-3">
            <InventoryFilters
              rarityFilter={rarityFilter}
              setRarityFilter={setRarityFilter}
              setSlotFilter={setSlotFilter}
              slotFilter={slotFilter}
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <InventoryItemButton
                  equipped={equippedIds.has(item.id)}
                  item={item}
                  key={item.id}
                  onEquip={onEquip}
                />
              ))}
            </div>
          </div>
          <NextRewardCard progress={progress} />
        </div>
      </div>
    </section>
  );
}

function AvatarItemArtwork({
  className,
  imageClassName,
  item,
  muted = false,
}: {
  className?: string;
  imageClassName?: string;
  item: AvatarItem | null | undefined;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-lg bg-[var(--quest-accent-soft)]",
        className,
      )}
      data-avatar-item-image={item?.id ?? "empty"}
    >
      {item?.imageSrc ? (
        <Image
          alt={item.name}
          className={cn(
            "object-contain p-2",
            muted && "opacity-55 saturate-75",
            imageClassName,
          )}
          fill
          sizes="(max-width: 768px) 45vw, 180px"
          src={item.imageSrc}
        />
      ) : (
        <Sparkles
          className={cn(
            "size-5 text-[var(--quest-accent)]",
            muted && "opacity-55",
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function AvatarPreview({ equippedItems }: { equippedItems: EquippedAvatarItems }) {
  const equipped = getEquippedAvatarItems(equippedItems);

  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-sm",
        questAccentClass("teal"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold">Мой аватар</h2>
          <p className="text-sm text-muted-foreground">
            Персональный образ городского исследователя.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-4">
        <div className="rounded-lg bg-[var(--quest-accent-soft)] p-4">
          <div className="mx-auto grid max-w-sm place-items-center rounded-lg border border-[var(--quest-accent-border)] bg-background/80 p-6 text-center shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--quest-accent)]">
              {equipped.background?.name ?? "Default City"}
            </div>
            <div className="mt-4 grid w-full place-items-center">
              <div className="relative grid size-52 place-items-center rounded-full border border-[var(--quest-accent-border)] bg-[var(--quest-accent-surface)]">
                <AvatarItemArtwork
                  className="absolute -top-5 size-16 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                  imageClassName="p-1.5"
                  item={equipped.head}
                />
                <div className="grid size-24 place-items-center rounded-full bg-[var(--quest-accent)] text-3xl font-bold text-[var(--quest-accent-foreground)]">
                  CQ
                </div>
                <AvatarItemArtwork
                  className="absolute left-0 top-20 size-14 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                  imageClassName="p-1.5"
                  item={equipped.accessory}
                />
                <div className="absolute right-1 top-20 flex flex-col gap-1">
                  <AvatarItemArtwork
                    className="size-12 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                    imageClassName="p-1.5"
                    item={equipped.top}
                  />
                  <AvatarItemArtwork
                    className="size-12 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                    imageClassName="p-1.5"
                    item={equipped.bottom}
                  />
                </div>
                <AvatarItemArtwork
                  className="absolute -bottom-5 size-16 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                  imageClassName="p-1.5"
                  item={equipped.shoes}
                />
                <AvatarItemArtwork
                  className="absolute -right-5 bottom-0 size-16 border border-[var(--quest-accent-border)] bg-background shadow-sm"
                  imageClassName="p-1.5"
                  item={equipped.pet}
                />
              </div>
            </div>
            <div className="mt-7 grid w-full grid-cols-2 gap-2 text-xs">
              <EquippedPill item={equipped.accessory} label="Аксессуар" />
              <EquippedPill item={equipped.pet} label="Питомец" />
              <EquippedPill item={equipped.background} label="Фон" />
              <EquippedPill item={equipped.effect} label="Эффект" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EquipmentPanel({ equippedItems }: { equippedItems: EquippedAvatarItems }) {
  const equipped = getEquippedAvatarItems(equippedItems);

  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-sm",
        questAccentClass("copper"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2">
        <Settings className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Слоты экипировки</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {avatarSlots.map((slot) => {
          const item = equipped[slot];

          return (
            <div
              className="rounded-lg border-2 bg-background/70 p-3"
              key={slot}
              style={
                item
                  ? { borderColor: avatarRarityBorderColors[item.rarity] }
                  : undefined
              }
            >
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {avatarSlotLabels[slot]}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {item?.name ?? "Empty slot"}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {item?.description ?? "No item equipped"}
                  </p>
                </div>
                <AvatarItemArtwork
                  className="size-12 shrink-0 border border-[var(--quest-accent-border)] bg-background"
                  imageClassName="p-1"
                  item={item}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function InventoryFilters({
  rarityFilter,
  setRarityFilter,
  setSlotFilter,
  slotFilter,
}: {
  rarityFilter: InventoryRarityFilter;
  setRarityFilter: (filter: InventoryRarityFilter) => void;
  setSlotFilter: (filter: InventorySlotFilter) => void;
  slotFilter: InventorySlotFilter;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-background/70 p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={slotFilter === "all"}
          label="Все"
          onClick={() => setSlotFilter("all")}
        />
        {avatarSlots.map((slot) => (
          <FilterChip
            active={slotFilter === slot}
            key={slot}
            label={avatarSlotLabels[slot]}
            onClick={() => setSlotFilter(slot)}
          />
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={rarityFilter === "all"}
          label="Все редкости"
          onClick={() => setRarityFilter("all")}
        />
        {(["common", "uncommon", "rare", "epic"] as const).map((rarity) => (
          <FilterChip
            active={rarityFilter === rarity}
            key={rarity}
            label={avatarRarityLabels[rarity]}
            onClick={() => setRarityFilter(rarity)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        active
          ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]"
          : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function InventoryItemButton({
  equipped,
  item,
  onEquip,
}: {
  equipped: boolean;
  item: AvatarItem;
  onEquip: (item: AvatarItem) => void;
}) {
  const rarityBorderColor = avatarRarityBorderColors[item.rarity];

  return (
    <button
      aria-label={`${item.name}: ${equipped ? "Equipped" : item.owned ? "Equip" : "Locked"}`}
      className={cn(
        "flex min-h-64 flex-col rounded-lg border-2 bg-background/80 p-3 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        item.owned
          ? "hover:bg-[var(--quest-accent-soft)]"
          : "cursor-not-allowed bg-muted/30",
      )}
      data-avatar-item-card={item.id}
      disabled={!item.owned}
      onClick={() => onEquip(item)}
      style={{
        borderColor: rarityBorderColor,
        boxShadow: equipped ? `0 0 0 1px ${rarityBorderColor}66` : undefined,
      }}
      type="button"
    >
      <AvatarItemArtwork
        className="h-32 w-full border border-border/60 bg-background"
        item={item}
        muted={!item.owned}
      />
      <div className="mt-3 text-sm font-semibold">{item.name}</div>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {item.description}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-3 text-xs font-semibold">
        {equipped ? (
          <>
            <Check className="size-3.5 text-[var(--quest-accent)]" aria-hidden="true" />
            Equipped
          </>
        ) : item.owned ? (
          "Equip"
        ) : (
          <>
            <Lock className="size-3.5" aria-hidden="true" />
            Locked
          </>
        )}
      </div>
    </button>
  );
}

function NextRewardCard({ progress }: { progress: UserProgress }) {
  const progressPercent = Math.min(
    100,
    Math.round((progress.xp / progress.xp_to_next_level) * 100),
  );

  return (
    <aside
      className={cn(
        "rounded-lg border p-4",
        questAccentClass("gold"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Trophy className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        Следующая награда
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Заверши первый маршрут, чтобы получить стартовый сундук.
      </p>
      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold">
          <span>Level {progress.level}</span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-[var(--quest-accent)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
        Сейчас доступны только базовые предметы, экипировка и локальный выбор
        образа. Награды будут подключены позже отдельным безопасным шагом.
      </div>
    </aside>
  );
}

function MiniProgressStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 px-3 py-2">
      <div className="font-bold text-[var(--quest-accent)]">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function EquippedPill({
  item,
  label,
}: {
  item: AvatarItem | null | undefined;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-2">
      <AvatarItemArtwork
        className="size-9 shrink-0 border border-[var(--quest-accent-border)] bg-background"
        imageClassName="p-1"
        item={item}
      />
      <div className="min-w-0">
        <div className="text-[0.68rem] font-semibold uppercase text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 truncate font-semibold">{item?.name ?? "None"}</div>
      </div>
    </div>
  );
}

function PublicProfileTab({
  bio,
  cities,
  citiesLoading,
  copy,
  favoriteCategoryIds,
  form,
  formValues,
  onBioChange,
  onSubmit,
  onToggleFavoriteCategory,
  onVisibilityChange,
  profile,
  publicVisibility,
  saved,
  selectedCityName,
  stats,
  updateProfileError,
  updateProfilePending,
}: {
  bio: string;
  cities: Array<{ id: number; name: string }>;
  citiesLoading: boolean;
  copy: (typeof profileCopy)[keyof typeof profileCopy];
  favoriteCategoryIds: string[];
  form: UseFormReturn<UpdateProfileFormValues>;
  formValues: UpdateProfileFormValues;
  onBioChange: (value: string) => void;
  onSubmit: () => void;
  onToggleFavoriteCategory: (categoryId: string) => void;
  onVisibilityChange: (visibility: PublicVisibility) => void;
  profile: User;
  publicVisibility: PublicVisibility;
  saved: boolean;
  selectedCityName: string | null;
  stats: ProfileStats;
  updateProfileError: Error | null;
  updateProfilePending: boolean;
}) {
  const { language } = useI18n();

  return (
    <section
      aria-labelledby="profile-tab-public"
      className={cn(
        "grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)]",
        questAccentClass("plum"),
      )}
      id="profile-panel-public"
      role="tabpanel"
    >
      <PublicProfilePreview
        bio={bio}
        favoriteCategoryIds={favoriteCategoryIds}
        formValues={formValues}
        profile={profile}
        publicVisibility={publicVisibility}
        selectedCityName={selectedCityName}
        stats={stats}
      />

      <form
        className={cn("rounded-lg border p-5 shadow-sm", questAccentPanelClassName)}
        onSubmit={onSubmit}
      >
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Публичный профиль</h2>
            <p className="text-sm text-muted-foreground">
              Настрой, как тебя видят другие пользователи CityQuest.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField error={form.formState.errors.name?.message} label={copy.fields.name}>
            <input
              autoComplete="name"
              className={inputClassName}
              type="text"
              {...form.register("name")}
            />
          </FormField>

          <FormField
            error={form.formState.errors.avatar_url?.message}
            label={copy.fields.avatarUrl}
          >
            <input
              autoComplete="url"
              className={inputClassName}
              type="url"
              {...form.register("avatar_url", {
                setValueAs: (value: string) => emptyToNull(value),
              })}
            />
          </FormField>

          <FormField className="md:col-span-2" hint={`${bio.length}/180`} label="Био">
            <textarea
              className={textareaClassName}
              maxLength={180}
              onChange={(event) => onBioChange(event.target.value)}
              placeholder="Люблю тихие дворики, парки и маршруты с хорошим кофе."
              value={bio}
            />
          </FormField>

          <FormField label={copy.fields.city}>
            <select
              className={selectClassName}
              disabled={citiesLoading}
              {...form.register("preferred_city_id", {
                setValueAs: (value: string) => (value ? Number(value) : null),
              })}
            >
              <option value="" />
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={copy.fields.language}>
            <select className={selectClassName} {...form.register("preferred_language")}>
              {languageCodes.map((code) => (
                <option key={code} value={code}>
                  {localizedLanguageNames[code]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label={copy.fields.theme}>
            <select className={selectClassName} {...form.register("preferred_theme")}>
              {themeCodes.map((code) => (
                <option key={code} value={code}>
                  {localizedThemeNames[language][code]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            hint="Публичный профиль пригодится, когда ты будешь делиться маршрутами или добавлять места."
            label="Видимость профиля"
          >
            <select
              className={selectClassName}
              onChange={(event) => onVisibilityChange(event.target.value as PublicVisibility)}
              value={publicVisibility}
            >
              <option value="private">Приватный</option>
              <option value="community">Виден сообществу</option>
              <option value="routes">Только на моих маршрутах</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <div className="text-sm font-medium">Любимые категории</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileCategoryOptions.map((category) => {
                const active = favoriteCategoryIds.includes(category.id);

                return (
                  <button
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                      active
                        ? "border-[var(--quest-accent-border)] bg-[var(--quest-accent)] text-[var(--quest-accent-foreground)]"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                    key={category.id}
                    onClick={() => onToggleFavoriteCategory(category.id)}
                    type="button"
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {updateProfileError ? (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {getApiErrorMessage(updateProfileError, copy.errors.save)}
          </div>
        ) : null}

        {saved ? (
          <div className="mt-4 rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] p-3 text-sm text-[var(--quest-accent)]">
            {copy.success}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button disabled={updateProfilePending} type="submit">
            {updateProfilePending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {updateProfilePending ? copy.actions.saving : copy.actions.save}
          </Button>
          <a className={buttonVariants({ variant: "outline" })} href="#public-profile-preview">
            Предпросмотр профиля
          </a>
        </div>
      </form>
    </section>
  );
}

function PublicProfilePreview({
  bio,
  favoriteCategoryIds,
  formValues,
  profile,
  publicVisibility,
  selectedCityName,
  stats,
}: {
  bio: string;
  favoriteCategoryIds: string[];
  formValues: UpdateProfileFormValues;
  profile: User;
  publicVisibility: PublicVisibility;
  selectedCityName: string | null;
  stats: ProfileStats;
}) {
  const displayName = formValues.name?.trim() || profile.name;
  const avatarUrl = emptyToNull(formValues.avatar_url) ?? profile.avatar_url;
  const visibilityLabel =
    publicVisibility === "private"
      ? "Приватный"
      : publicVisibility === "community"
        ? "Виден сообществу"
        : "На маршрутах";

  return (
    <aside
      className={cn(
        "rounded-lg border p-5 shadow-sm",
        questAccentClass("plum"),
        questAccentPanelClassName,
      )}
      id="public-profile-preview"
    >
      <div className="flex items-center gap-2">
        <UserRound className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Публичная карточка</h2>
      </div>
      <div className="mt-5 rounded-lg border border-[var(--quest-accent-border)] bg-background/75 p-5">
        <div className="flex items-start gap-4">
          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--quest-accent)] text-xl font-bold text-[var(--quest-accent-foreground)]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="size-full object-cover" src={avatarUrl} />
            ) : (
              getInitial(displayName)
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold">{displayName}</h3>
            <p className="text-sm text-muted-foreground">Urban Explorer / Городской исследователь</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-lg bg-[var(--quest-accent-soft)] px-2 py-1 text-[var(--quest-accent)]">
                Level {profile.level}
              </span>
              <span className="rounded-lg bg-muted px-2 py-1">{visibilityLabel}</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          {bio || "Короткое описание появится здесь. Расскажи, какие прогулки и места тебе нравятся."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCityName ? (
            <span className="rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--quest-accent)]">
              {selectedCityName}
            </span>
          ) : null}
          {favoriteCategoryIds.map((categoryId) => {
            const category = profileCategoryOptions.find((item) => item.id === categoryId);

            return category ? (
              <span
                className="rounded-lg border border-border bg-muted px-2 py-1 text-xs font-semibold"
                key={category.id}
              >
                {category.label}
              </span>
            ) : null;
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <PreviewStat label="Завершено" value={stats.completed} />
          <PreviewStat label="Места" value={stats.discovered} />
          <PreviewStat label="Сохранено" value={stats.routes} />
          <PreviewStat label="Достижения" value={stats.achievements} />
        </div>
      </div>
    </aside>
  );
}

function PreviewStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-2">
      <div className="font-bold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function CityJournalTab({
  achievements,
  contributionStatus,
  detailsLoading,
  favoritePlaces,
  preferredCategories,
  preferredVibes,
  recentActivity,
  retentionCopy,
  savedRoutes,
  stats,
  suggestedRoute,
}: {
  achievements: NonNullable<User["achievements"]>;
  contributionStatus: User["contribution_status"] | null;
  detailsLoading: boolean;
  favoritePlaces: NonNullable<User["favorite_places"]>;
  preferredCategories: NonNullable<User["preferred_categories"]>;
  preferredVibes: string[];
  recentActivity: NonNullable<User["recent_route_activity"]>;
  retentionCopy: ProfileRetentionCopy;
  savedRoutes: NonNullable<User["saved_routes"]>;
  stats: ProfileStats;
  suggestedRoute: CityRoute | null;
}) {
  const { dictionary, language } = useI18n();

  return (
    <section
      aria-labelledby="profile-tab-journal"
      className={cn("space-y-5", questAccentClass("gold"))}
      id="profile-panel-journal"
      role="tabpanel"
    >
      <JournalStats stats={stats} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          <section
            className={cn("rounded-lg border p-5 shadow-sm", questAccentPanelClassName)}
          >
            <div className="flex items-center gap-2">
              <Compass className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Продолжить планирование</h2>
                <p className="text-sm text-muted-foreground">
                  Следующий шаг для прогулки или сохраненного маршрута.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <NextRouteCard
                copy={retentionCopy}
                detailsLoading={detailsLoading}
                route={suggestedRoute ?? savedRoutes[0] ?? null}
              />
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            <ProfileList
              accentClassName={questAccentClass("teal")}
              emptyText={
                detailsLoading
                  ? dictionary.common.loading
                  : "Сохранённые маршруты появятся здесь. Найди маршрут и сохрани его, чтобы вернуться позже."
              }
              icon={<RouteIcon className="size-4" aria-hidden="true" />}
              items={savedRoutes}
              renderItem={(route) => {
                const routeContent = getLocalizedRouteContent(route, language);

                return (
                  <Link
                    className="block rounded-lg border border-border bg-background p-3 transition hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]"
                    href={`/routes/${route.id}`}
                  >
                    <span className="block truncate text-sm font-semibold">
                      {routeContent.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {route.duration_minutes ? `${route.duration_minutes} min` : route.route_type}
                    </span>
                  </Link>
                );
              }}
              title="Сохранённые маршруты"
            />

            <ProfileList
              accentClassName={questAccentClass("sage")}
              emptyText={
                detailsLoading
                  ? dictionary.common.loading
                  : "Избранные места появятся здесь. Добавляй кафе, парки и музеи в избранное."
              }
              icon={<Star className="size-4" aria-hidden="true" />}
              items={favoritePlaces}
              renderItem={(place) => {
                const placeContent = getLocalizedPlaceContent(place, language);

                return (
                  <Link
                    className="block rounded-lg border border-border bg-background p-3 transition hover:border-[var(--quest-accent-border)] hover:bg-[var(--quest-accent-surface)]"
                    href={`/places/${place.id}`}
                  >
                    <span className="block truncate text-sm font-semibold">
                      {placeContent.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {place.category
                        ? categoryDisplayName(place.category, dictionary)
                        : place.address ?? ""}
                    </span>
                  </Link>
                );
              }}
              title="Избранные места"
            />
          </div>

          <RecentRouteActivity
            copy={retentionCopy}
            detailsLoading={detailsLoading}
            items={recentActivity}
          />

          <AchievementsPanel achievements={achievements} detailsLoading={detailsLoading} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <VibeChips
            categories={preferredCategories}
            copy={retentionCopy}
            detailsLoading={detailsLoading}
            vibes={preferredVibes}
          />
          <ContributionSummary copy={retentionCopy} status={contributionStatus} />
        </aside>
      </div>
    </section>
  );
}

function JournalStats({ stats }: { stats: ProfileStats }) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6",
        questAccentClass("gold"),
        questAccentPanelClassName,
      )}
    >
      <StatCard accentClassName={questAccentClass("gold")} label="Завершено" value={stats.completed} />
      <StatCard accentClassName={questAccentClass("teal")} label="Сохранено" value={stats.routes} />
      <StatCard accentClassName={questAccentClass("sage")} label="Избранное" value={stats.favorites} />
      <StatCard accentClassName={questAccentClass("plum")} label="Открыто мест" value={stats.discovered} />
      <StatCard accentClassName={questAccentClass("copper")} label="Достижения" value={stats.achievements} />
      <StatCard accentClassName={questAccentClass("rose")} label="Вклады" value={stats.contributions} />
    </div>
  );
}

function NextRouteCard({
  copy,
  detailsLoading,
  route,
}: {
  copy: ProfileRetentionCopy;
  detailsLoading: boolean;
  route: CityRoute | null;
}) {
  const { dictionary, language } = useI18n();
  const routeContent = route ? getLocalizedRouteContent(route, language) : null;

  return (
    <div className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <RouteIcon className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        {copy.sections.nextRoute}
      </div>
      {detailsLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">{dictionary.common.loading}</p>
      ) : route ? (
        <>
          <h3 className="mt-3 text-lg font-semibold">{routeContent?.title}</h3>
          {routeContent?.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {routeContent.description}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            {route.duration_minutes ? <span>{route.duration_minutes} min</span> : null}
            {route.distance_km ? <span>{route.distance_km} km</span> : null}
            {route.vibe ? <span>{route.vibe}</span> : null}
          </div>
          <Link className={buttonVariants({ className: "mt-4" })} href={`/routes/${route.id}`}>
            <Footprints className="size-4" aria-hidden="true" />
            {copy.actions.startSuggested}
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Сохранённые маршруты появятся здесь. Найди маршрут и сохрани его, чтобы
            вернуться позже.
          </p>
          <Link className={buttonVariants({ className: "mt-4" })} href="/routes/create">
            <PlusCircle className="size-4" aria-hidden="true" />
            {copy.actions.createRoute}
          </Link>
        </>
      )}
    </div>
  );
}

function VibeChips({
  categories,
  copy,
  detailsLoading,
  vibes,
}: {
  categories: NonNullable<User["preferred_categories"]>;
  copy: ProfileRetentionCopy;
  detailsLoading: boolean;
  vibes: string[];
}) {
  const { dictionary } = useI18n();
  const chips = [
    ...categories.map((category) => categoryDisplayName(category, dictionary)),
    ...vibes.map((vibe) => profileVibeLabel(vibe, dictionary)),
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        questAccentClass("sage"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        {copy.sections.vibe}
      </div>
      {detailsLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">{dictionary.common.loading}</p>
      ) : chips.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.slice(0, 8).map((chip) => (
            <span
              className="rounded-lg border border-[var(--quest-accent-border)] bg-[var(--quest-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--quest-accent)]"
              key={chip}
            >
              {chip}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.vibeEmpty}</p>
      )}
    </div>
  );
}

function ContributionSummary({
  copy,
  status,
}: {
  copy: ProfileRetentionCopy;
  status: User["contribution_status"] | null;
}) {
  const { language } = useI18n();

  if (!status || status.total === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border p-4 shadow-sm",
          questAccentClass("teal"),
          questAccentPanelClassName,
        )}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <MapPinned className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
          {copy.contributions.title}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Добавь любимое место и помоги другим открыть город.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        questAccentClass("teal"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MapPinned className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        {copy.contributions.title}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <ContributionStat label={copy.contributions.total} value={status.total} />
        <ContributionStat label={copy.contributions.pending} value={status.pending} />
        <ContributionStat label={copy.contributions.approved} value={status.approved} />
        <ContributionStat label={copy.contributions.rejected} value={status.rejected} />
      </div>
      {status.last_place_name ? (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {copy.contributions.last}:{" "}
          {getLocalizedPlaceNameText(status.last_place_name, language) ??
            status.last_place_name}
        </p>
      ) : null}
    </div>
  );
}

function ContributionStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-1.5">
      <div className="font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}

function profileVibeLabel(
  vibe: string,
  dictionary: ReturnType<typeof useI18n>["dictionary"],
): string {
  const labels = dictionary.routes.create.vibe as Record<string, string>;

  return labels[vibe] ?? vibe.replaceAll("_", " ");
}

function RecentRouteActivity({
  copy,
  detailsLoading,
  items,
}: {
  copy: ProfileRetentionCopy;
  detailsLoading: boolean;
  items: NonNullable<User["recent_route_activity"]>;
}) {
  const { dictionary } = useI18n();

  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-sm",
        questAccentClass("plum"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2">
        <CalendarCheck2 className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <h2 className="text-lg font-semibold">История маршрутов</h2>
      </div>
      {detailsLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{dictionary.common.loading}</p>
      ) : items.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.slice(0, 4).map((activity) => (
            <RouteActivityLink activity={activity} copy={copy} key={activity.id} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Начни или заверши маршрут, чтобы собрать историю прогулок.
        </p>
      )}
    </section>
  );
}

function RouteActivityLink({
  activity,
  copy,
}: {
  activity: NonNullable<User["recent_route_activity"]>[number];
  copy: ProfileRetentionCopy;
}) {
  const { language } = useI18n();
  const isCompleted = activity.status === "completed";
  const Icon = isCompleted ? BadgeCheck : Footprints;
  const statusLabel = isCompleted ? copy.activity.completed : copy.activity.started;
  const routeContent = activity.route
    ? getLocalizedRouteContent(activity.route, language)
    : null;
  const content = (
    <>
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase text-muted-foreground">
          {statusLabel}
        </span>
      </div>
      <div className="mt-2 truncate text-sm font-semibold">
        {routeContent?.title ?? copy.sections.nextRoute}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {formatProfileDate(activity.completed_at ?? activity.started_at ?? activity.updated_at)}
      </div>
    </>
  );

  if (!activity.route) {
    return (
      <article className="rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3">
        {content}
      </article>
    );
  }

  return (
    <Link
      className="block rounded-lg border border-[var(--quest-accent-border)] bg-background/70 p-3 transition hover:bg-[var(--quest-accent-surface)]"
      href={`/routes/${activity.route.id}`}
    >
      {content}
    </Link>
  );
}

function AchievementsPanel({
  achievements,
  detailsLoading,
}: {
  achievements: NonNullable<User["achievements"]>;
  detailsLoading: boolean;
}) {
  const { dictionary, language } = useI18n();
  const unlockedCodes = new Set(achievements.map((achievement) => achievement.code));
  const lockedExamples = lockedAchievementExamples.filter(
    (achievement) => !unlockedCodes.has(achievement.code),
  );

  return (
    <section
      className={cn(
        "rounded-lg border p-5 shadow-sm",
        questAccentClass("gold"),
        questAccentPanelClassName,
      )}
    >
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Достижения</h2>
      </div>
      {detailsLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">{dictionary.common.loading}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {achievements.map((achievement) => {
            const achievementContent = getLocalizedAchievementContent(achievement, language);

            return (
              <AchievementCard
                description={achievementContent.description}
                key={achievement.id}
                locked={false}
                name={achievementContent.name}
              />
            );
          })}
          {lockedExamples.map((achievement) => (
            <AchievementCard
              description={achievement.description}
              key={achievement.code}
              locked
              name={achievement.name}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AchievementCard({
  description,
  locked,
  name,
}: {
  description: string | null;
  locked: boolean;
  name: string;
}) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-background/70 p-3",
        locked ? "border-border opacity-75" : "border-[var(--quest-accent-border)]",
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {locked ? (
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <BadgeCheck className="size-4 text-[var(--quest-accent)]" aria-hidden="true" />
        )}
        {name}
      </div>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-3 text-xs font-semibold text-muted-foreground">
        {locked ? "Locked" : "Unlocked"}
      </div>
    </article>
  );
}

function StatCard({
  accentClassName,
  label,
  value,
}: {
  accentClassName: string;
  label: string;
  value: number | string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-background/70 p-3",
        accentClassName,
        "border-[var(--quest-accent-border)]",
      )}
    >
      <div className="text-2xl font-bold text-[var(--quest-accent)]">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProfileList<T extends CityRoute | Place>({
  accentClassName,
  emptyText,
  icon,
  items,
  renderItem,
  title,
}: {
  accentClassName: string;
  emptyText: string;
  icon: ReactNode;
  items: T[];
  renderItem: (item: T) => ReactNode;
  title: string;
}) {
  return (
    <section className={cn("rounded-lg border p-5 shadow-sm", accentClassName, questAccentPanelClassName)}>
      <div className="flex items-center gap-2">
        <span className="text-[var(--quest-accent)]">{icon}</span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {items.length ? (
        <div className="mt-4 grid gap-3">
          {items.slice(0, 4).map((item) => (
            <Fragment key={item.id}>{renderItem(item)}</Fragment>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{emptyText}</p>
      )}
    </section>
  );
}

function getEquippedAvatarItems(equippedItems: EquippedAvatarItems) {
  return Object.fromEntries(
    avatarSlots.map((slot) => [
      slot,
      avatarItems.find((item) => item.id === equippedItems[slot]) ?? null,
    ]),
  ) as Record<AvatarSlot, AvatarItem | null>;
}

function getProfileTabFromLocation(): ProfileTabId | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tab = new URLSearchParams(window.location.search).get(profileTabParamName);

  return isProfileTabId(tab) ? tab : null;
}

function isProfileTabId(value: string | null): value is ProfileTabId {
  return value === "avatar" || value === "public" || value === "journal";
}

function updateProfileTabUrl(tab: ProfileTabId) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  url.searchParams.set(profileTabParamName, tab);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function readStoredEquippedAvatarItems(): EquippedAvatarItems | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(avatarEquipmentStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as unknown;

    return isEquippedAvatarItems(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function isEquippedAvatarItems(value: unknown): value is EquippedAvatarItems {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Partial<Record<AvatarSlot, unknown>>;

  return avatarSlots.every((slot) => {
    const itemId = record[slot];

    return (
      typeof itemId === "string" &&
      avatarItems.some(
        (item) => item.id === itemId && item.slot === slot && item.owned,
      )
    );
  });
}

function getInitial(name: string): string {
  return name.slice(0, 1).toUpperCase();
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function formatProfileDate(value: string | null): string {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function hasLoadedProfileDetails(profile: User | null | undefined): boolean {
  if (!profile) {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(profile, "achievements") ||
    Object.prototype.hasOwnProperty.call(profile, "favorite_places") ||
    Object.prototype.hasOwnProperty.call(profile, "recent_route_activity") ||
    Object.prototype.hasOwnProperty.call(profile, "saved_routes")
  );
}
