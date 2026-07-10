"use client";

import { Trophy } from "lucide-react";

import {
  AccountEmptyState,
  AccountError,
  AccountLoading,
  AccountPageShell,
} from "@/components/account/account-page-shell";
import { useProfile } from "@/hooks/api";
import { getApiErrorMessage } from "@/lib/forms/api-errors";
import { getLocalizedAchievementContent } from "@/lib/i18n/content-localization";
import { accountCopy } from "@/lib/i18n/feature-copy";
import { useI18n } from "@/lib/i18n/i18n-provider";

export function AchievementsPage() {
  const { language } = useI18n();
  const copy = accountCopy[language];
  const profileQuery = useProfile();
  const achievements = profileQuery.data?.achievements ?? [];

  return (
    <AccountPageShell
      icon={Trophy}
      subtitle={copy.achievements.subtitle}
      title={copy.achievements.title}
    >
      {profileQuery.isLoading ? <AccountLoading label={copy.common.loading} /> : null}
      {profileQuery.isError ? (
        <AccountError message={getApiErrorMessage(profileQuery.error, copy.errors.profile)} />
      ) : null}
      {!profileQuery.isLoading && !profileQuery.isError && achievements.length === 0 ? (
        <AccountEmptyState
          text={copy.achievements.emptyText}
          title={copy.achievements.emptyTitle}
        />
      ) : null}
      {achievements.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => {
            const achievementContent = getLocalizedAchievementContent(achievement, language);

            return (
              <article
                className="rounded-lg border border-border bg-card p-5 shadow-sm"
                key={achievement.id}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-primary">
                    <Trophy className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold">{achievementContent.name}</h2>
                    {achievementContent.description ? (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {achievementContent.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </AccountPageShell>
  );
}
