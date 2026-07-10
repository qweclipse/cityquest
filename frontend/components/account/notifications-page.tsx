"use client";

import { Bell, Check, Loader2 } from "lucide-react";

import {
  AccountEmptyState,
  AccountError,
  AccountLoading,
  AccountPageShell,
} from "@/components/account/account-page-shell";
import { Button } from "@/components/ui/button";
import { useMarkNotificationAsRead, useNotifications } from "@/hooks/api";
import type { CityQuestNotification, LanguageCode } from "@/lib/api/types";
import { formatAccountDate, notificationTypeLabel } from "@/lib/account/account-format";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { getLocalizedNotificationContent } from "@/lib/i18n/content-localization";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";
import { cn } from "@/lib/utils";

export function NotificationsPage() {
  const { language } = useI18n();
  const copy = accountCopy[language];
  const notificationsQuery = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const notifications = notificationsQuery.data ?? [];

  return (
    <AccountPageShell
      icon={Bell}
      subtitle={copy.notifications.subtitle}
      title={copy.notifications.title}
    >
      {notificationsQuery.isLoading ? <AccountLoading label={copy.common.loading} /> : null}
      {notificationsQuery.isError ? (
        <AccountError
          message={getApiErrorMessage(notificationsQuery.error, copy.errors.notifications)}
        />
      ) : null}
      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0 ? (
        <AccountEmptyState
          text={copy.notifications.emptyText}
          title={copy.notifications.emptyTitle}
        />
      ) : null}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              copy={copy}
              isPending={markAsRead.isPending}
              key={notification.id}
              language={language}
              notification={notification}
              onMarkRead={() => markAsRead.mutate(notification.id)}
            />
          ))}
        </div>
      ) : null}
    </AccountPageShell>
  );
}

function NotificationCard({
  copy,
  isPending,
  language,
  notification,
  onMarkRead,
}: {
  copy: (typeof accountCopy)[LanguageCode];
  isPending: boolean;
  language: LanguageCode;
  notification: CityQuestNotification;
  onMarkRead: () => void;
}) {
  const isUnread = !notification.read_at;
  const notificationContent = getLocalizedNotificationContent(notification, language);

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        isUnread ? "border-primary/35" : "border-border",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
              {notificationTypeLabel(notification, language)}
            </span>
            <span
              className={cn(
                "rounded-lg px-2 py-1 text-xs font-semibold",
                isUnread
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isUnread ? copy.common.unread : copy.common.read}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatAccountDate(notification.created_at, language)}
            </span>
          </div>
          <h2 className="mt-3 text-base font-semibold">{notificationContent.title}</h2>
          {notificationContent.body ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              {notificationContent.body}
            </p>
          ) : null}
        </div>
        <Button
          disabled={!isUnread || isPending}
          onClick={onMarkRead}
          type="button"
          variant="outline"
        >
          {isPending && isUnread ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="size-4" aria-hidden="true" />
          )}
          {isUnread ? copy.actions.markRead : copy.common.read}
        </Button>
      </div>
    </article>
  );
}
