"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { usePopoverDismiss } from "@/hooks/use-popover-dismiss";

export function LanguageMenu() {
  const { dictionary, language, languages, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const currentLanguage = languages.find((option) => option.code === language);
  const closeMenu = useCallback(() => setOpen(false), []);

  usePopoverDismiss({
    onClose: closeMenu,
    open,
    ref: menuRef,
  });

  return (
    <div
      className="relative"
      ref={menuRef}
    >
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={dictionary.shell.language.ariaLabel}
        className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-card/85 px-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Languages className="size-4 text-muted-foreground" aria-hidden="true" />
        <span>{currentLanguage?.label ?? "RU"}</span>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground transition", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-10 z-50 w-44 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
          role="menu"
        >
          <div className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">
            {dictionary.shell.language.title}
          </div>
          {languages.map((option) => (
            <button
              className={cn(
                "flex h-9 w-full items-center justify-between rounded-md px-2 text-left text-sm transition hover:bg-muted",
                language === option.code && "bg-muted font-semibold",
              )}
              key={option.code}
              onClick={() => {
                setLanguage(option.code);
                setOpen(false);
              }}
              role="menuitemradio"
              type="button"
              aria-checked={language === option.code}
            >
              <span>{option.name}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {option.label}
                {language === option.code ? (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                ) : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const LanguageSwitcher = LanguageMenu;
