"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Compass,
  Gift,
  Heart,
  History,
  Home,
  Map,
  MapPin,
  MapPinned,
  Menu,
  Plus,
  Route,
  ShieldPlus,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { LanguageMenu } from "@/components/common/language-switcher";
import { ThemeSegmentedSwitch } from "@/components/common/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCities, useNotifications, useProfile } from "@/hooks/api";
import { useAuth } from "@/lib/auth/auth-provider";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";

interface AppShellProps {
  children: ReactNode;
}

interface NavigationItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

interface NavigationSection {
  items: NavigationItem[];
  label: string;
}

let desktopSidebarPreference = true;

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { dictionary } = useI18n();
  const citiesQuery = useCities();
  const notificationsQuery = useNotifications();
  const [desktopSidebarOpen, setDesktopSidebarOpenState] = useState(
    desktopSidebarPreference,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const setDesktopSidebarOpen = useCallback(
    (nextValue: boolean | ((currentValue: boolean) => boolean)) => {
      setDesktopSidebarOpenState((currentValue) => {
        const resolvedValue =
          typeof nextValue === "function" ? nextValue(currentValue) : nextValue;

        desktopSidebarPreference = resolvedValue;

        return resolvedValue;
      });
    },
    [],
  );
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const cityName = citiesQuery.data?.[0]?.name ?? dictionary.common.defaultCity;
  const cityStatus = citiesQuery.isLoading
    ? dictionary.shell.city.loading
    : citiesQuery.isError
      ? dictionary.shell.city.unavailable
      : dictionary.shell.city.loaded;
  const unreadNotifications =
    notificationsQuery.data?.filter((notification) => !notification.read_at).length ?? 0;
  const navigationSections = useMemo<NavigationSection[]>(
    () => [
      {
        label: dictionary.shell.nav.groups.main,
        items: [
          { href: "/", icon: Home, label: dictionary.shell.nav.home },
          { href: "/collections", icon: Sparkles, label: dictionary.shell.nav.collections },
          { href: "/routes/create", icon: Route, label: dictionary.shell.nav.createRoute },
          { href: "/routes/random", icon: Compass, label: dictionary.shell.nav.randomRoute },
          { href: "/map", icon: Map, label: dictionary.shell.nav.map },
          { href: "/places", icon: MapPinned, label: dictionary.shell.nav.places },
        ],
      },
      {
        label: dictionary.shell.nav.groups.my,
        items: [
          { href: "/saved-routes", icon: Star, label: dictionary.shell.nav.savedRoutes },
          { href: "/favorite-places", icon: Heart, label: dictionary.shell.nav.favorites },
          { href: "/history", icon: History, label: dictionary.shell.nav.history },
          { href: "/achievements", icon: Trophy, label: dictionary.shell.nav.achievements },
        ],
      },
      {
        label: dictionary.shell.nav.groups.community,
        items: [
          { href: "/places/new", icon: Plus, label: dictionary.shell.nav.submitPlace },
          { href: "/places/newest", icon: ShieldPlus, label: dictionary.shell.nav.newPlaces },
        ],
      },
      {
        label: dictionary.shell.nav.groups.more,
        items: [
          { href: "/events", icon: CalendarDays, label: dictionary.shell.nav.events },
          { href: "/deals", icon: Gift, label: dictionary.shell.nav.deals },
          { href: "/buddy", icon: UsersRound, label: dictionary.shell.nav.buddy },
          { href: "/advanced", icon: Sparkles, label: dictionary.shell.nav.advanced },
        ],
      },
    ],
    [dictionary],
  );
  const profileItem = { href: "/profile", icon: UserRound, label: dictionary.shell.nav.profile };
  const mobileNavItems = [
    navigationSections[0].items[0],
    navigationSections[0].items[1],
    navigationSections[0].items[4],
    navigationSections[1].items[0],
    profileItem,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {desktopSidebarOpen ? (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[12px_0_36px_rgba(37,45,36,0.08)] lg:flex">
          <SidebarContent
            activePath={pathname}
            navigationSections={navigationSections}
            onNavigate={() => undefined}
            onToggleSidebar={() => setDesktopSidebarOpen(false)}
          />
        </aside>
      ) : (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-16 border-r border-sidebar-border bg-sidebar px-2 py-4 text-sidebar-foreground shadow-[12px_0_36px_rgba(37,45,36,0.08)] lg:flex lg:flex-col lg:items-center">
          <button
            aria-label={dictionary.shell.menu.open}
            className="grid size-10 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-sm transition hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-sidebar-ring/40"
            onClick={() => setDesktopSidebarOpen(true)}
            type="button"
          >
            <Compass className="size-5" aria-hidden="true" />
          </button>
        </aside>
      )}

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label={dictionary.shell.menu.close}
            className="absolute inset-0 bg-foreground/35"
            onClick={closeMobileMenu}
            type="button"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl">
            <SidebarContent
              activePath={pathname}
              navigationSections={navigationSections}
              onNavigate={closeMobileMenu}
              onToggleSidebar={closeMobileMenu}
            />
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          desktopSidebarOpen ? "lg:pl-64" : "lg:pl-16",
        )}
      >
        <header className="sticky top-0 z-20 border-b border-border bg-[color-mix(in_oklch,var(--surface-elevated),transparent_10%)] backdrop-blur">
          <div className="flex min-h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
            <Button
              aria-label={dictionary.shell.menu.open}
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>

            <button
              aria-label={dictionary.shell.menu.open}
              className="flex min-w-0 items-center gap-2 font-semibold transition hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/40 lg:hidden"
              onClick={() => setMobileMenuOpen((value) => !value)}
              type="button"
            >
              <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <Compass className="size-5" aria-hidden="true" />
              </span>
              <span className="hidden min-[420px]:inline">CityQuest</span>
            </button>

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                aria-label={dictionary.shell.city.ariaLabel}
                className="hidden h-8 items-center gap-2 rounded-lg border border-border bg-[var(--surface-elevated)] px-2.5 text-sm text-muted-foreground shadow-sm sm:inline-flex"
                type="button"
              >
                <MapPin className="size-4" aria-hidden="true" />
                <span className="max-w-40 truncate">{cityName}</span>
                <span className="hidden text-xs text-muted-foreground/75 xl:inline">
                  {cityStatus}
                </span>
              </button>
              <LanguageMenu />
              <Link
                aria-label={dictionary.shell.notifications.ariaLabel}
                className={cn(
                  buttonVariants({ size: "icon-lg", variant: "outline" }),
                  "relative",
                )}
                href="/notifications"
              >
                <Bell className="size-4" aria-hidden="true" />
                {unreadNotifications > 0 ? (
                  <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.62rem] font-bold leading-4 text-primary-foreground">
                    {unreadNotifications}
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </header>

        <main className="pb-24 lg:pb-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-[color-mix(in_oklch,var(--surface-elevated),transparent_4%)] px-2 py-2 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {mobileNavItems.map((item) => (
            <NavigationLink
              active={isNavigationActive(pathname, item.href)}
              compact
              item={item}
              key={item.href}
              onNavigate={closeMobileMenu}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function SidebarContent({
  activePath,
  navigationSections,
  onNavigate,
  onToggleSidebar,
}: {
  activePath: string;
  navigationSections: NavigationSection[];
  onNavigate: () => void;
  onToggleSidebar: () => void;
}) {
  const { dictionary } = useI18n();
  const auth = useAuth();
  const profileQuery = useProfile();
  const profile = profileQuery.data ?? auth.user;
  const accountName = profile?.name ?? dictionary.shell.nav.profile;
  const accountLevel = profile
    ? dictionary.shell.account.level.replace(/\d+/, String(profile.level))
    : dictionary.shell.account.openProfile;
  const accountInitial = profile?.name.slice(0, 1).toUpperCase() ?? "C";
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="flex min-h-0 w-full flex-col px-3 pb-12 pt-4">
      <div className="flex items-center gap-3">
        <button
          aria-label={dictionary.shell.menu.close}
          className="flex min-w-0 items-center gap-2 rounded-lg text-left text-base font-semibold transition hover:text-sidebar-primary focus-visible:ring-3 focus-visible:ring-sidebar-ring/40"
          onClick={onToggleSidebar}
          type="button"
        >
          <span className="grid size-8 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_10px_22px_color-mix(in_srgb,var(--sidebar-primary)_24%,transparent)]">
            <Compass className="size-4" aria-hidden="true" />
          </span>
          <span className="truncate">CityQuest</span>
        </button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
        {navigationSections.map((section) => {
          const isMoreSection = section.label === dictionary.shell.nav.groups.more;
          const hasActiveItem = section.items.some((item) =>
            isNavigationActive(activePath, item.href),
          );
          const isExpanded = !isMoreSection || moreOpen || hasActiveItem;

          return (
            <div className="mb-3 last:mb-0" key={section.label}>
              {isMoreSection ? (
                <button
                  aria-expanded={isExpanded}
                  className="mb-1.5 flex h-7 w-full items-center justify-between rounded-lg px-2 text-xs font-semibold text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  onClick={() => setMoreOpen((value) => !value)}
                  type="button"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    className={cn("size-3.5 transition", isExpanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <div className="mb-1.5 px-2 text-xs font-semibold text-muted-foreground">
                  {section.label}
                </div>
              )}

              {isExpanded ? (
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <NavigationLink
                      active={isNavigationActive(activePath, item.href)}
                      item={item}
                      key={item.href}
                      onNavigate={onNavigate}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex shrink-0 flex-col gap-2">
        <div className="flex justify-end">
          <ThemeSegmentedSwitch />
        </div>
        <Link
          className="flex min-w-0 items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent px-2.5 py-2 text-sm transition hover:bg-sidebar-accent/80"
          href="/profile"
          onClick={onNavigate}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            {accountInitial}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{accountName}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {accountLevel}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}

function NavigationLink({
  active,
  compact = false,
  item,
  onNavigate,
}: {
  active: boolean;
  compact?: boolean;
  item: NavigationItem;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-lg text-sm font-medium transition",
        compact
          ? "min-h-12 flex-col justify-center px-1 py-1 text-[0.68rem]"
          : "h-8 px-2 text-[0.82rem]",
        active
          ? "border border-sidebar-primary/30 bg-sidebar-primary/12 text-sidebar-primary shadow-sm"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon className={compact ? "size-4" : "size-4"} aria-hidden="true" />
      <span className={compact ? "max-w-full truncate" : "truncate"}>{item.label}</span>
    </Link>
  );
}

function isNavigationActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
