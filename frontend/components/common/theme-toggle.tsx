"use client";

import { Check, ChevronDown, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { usePopoverDismiss } from "@/hooks/use-popover-dismiss";
import type { ThemePreference } from "@/lib/api/types";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";
import { useThemePreference } from "@/lib/theme/theme-provider";

const themeIcons: Record<ThemePreference, LucideIcon> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

export function ThemeMenu() {
  const { dictionary } = useI18n();
  const { setTheme, theme } = useThemePreference();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeMenu = useCallback(() => setOpen(false), []);
  const CurrentIcon = themeIcons[theme];

  usePopoverDismiss({
    onClose: closeMenu,
    open,
    ref: menuRef,
  });

  const options: Array<{
    icon: LucideIcon;
    label: string;
    value: ThemePreference;
  }> = [
    { icon: Monitor, label: dictionary.shell.theme.system, value: "system" },
    { icon: Sun, label: dictionary.shell.theme.light, value: "light" },
    { icon: Moon, label: dictionary.shell.theme.dark, value: "dark" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={dictionary.shell.theme.ariaLabel}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card/85 px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <CurrentIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="hidden sm:inline">{dictionary.shell.theme.title}</span>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
          role="menu"
        >
          <div className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
            {dictionary.shell.theme.title}
          </div>
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <button
                aria-checked={theme === option.value}
                className={cn(
                  "flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-sm transition hover:bg-muted",
                  theme === option.value && "bg-muted font-semibold",
                )}
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                role="menuitemradio"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {option.label}
                </span>
                {theme === option.value ? (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export const ThemeToggle = ThemeMenu;

export function ThemeSegmentedSwitch({ className }: { className?: string }) {
  const { dictionary } = useI18n();
  const { resolvedTheme, setTheme, theme } = useThemePreference();
  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div
      aria-label={dictionary.shell.theme.ariaLabel}
      className={cn(
        "inline-grid h-8 grid-cols-2 rounded-full border border-sidebar-border bg-sidebar-accent/70 p-1 text-sidebar-foreground shadow-sm",
        className,
      )}
      role="group"
    >
      <button
        aria-pressed={activeTheme === "light"}
        className={cn(
          "grid size-6 place-items-center rounded-full text-muted-foreground transition hover:text-sidebar-accent-foreground",
          activeTheme === "light" &&
            "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:text-sidebar-primary-foreground",
        )}
        onClick={() => setTheme("light")}
        title={dictionary.shell.theme.light}
        type="button"
      >
        <Sun className="size-3.5" aria-hidden="true" />
      </button>
      <button
        aria-pressed={activeTheme === "dark"}
        className={cn(
          "grid size-6 place-items-center rounded-full text-muted-foreground transition hover:text-sidebar-accent-foreground",
          activeTheme === "dark" &&
            "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:text-sidebar-primary-foreground",
        )}
        onClick={() => setTheme("dark")}
        title={dictionary.shell.theme.dark}
        type="button"
      >
        <Moon className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
