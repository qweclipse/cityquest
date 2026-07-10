import type { CityQuestNotification, LanguageCode } from "@/lib/api/types";
import { accountCopy } from "@/lib/i18n/feature-copy";

const dateLocales: Record<LanguageCode, string> = {
  en: "en-US",
  ro: "ro-RO",
  ru: "ru-RU",
};

export function formatAccountDate(value: string | null, language: LanguageCode): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(dateLocales[language], {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function notificationTypeLabel(
  notification: CityQuestNotification,
  language: LanguageCode,
): string {
  const types = accountCopy[language].notifications.types;

  switch (notification.type) {
    case "achievement":
      return types.achievement;
    case "favorite":
      return types.favorite;
    case "place":
      return types.place;
    case "route":
      return types.route;
    case "system":
      return types.system;
    default:
      return types.unknown;
  }
}
