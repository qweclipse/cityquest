"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

export const textareaClassName =
  "min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

export const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60";

export function FormField({
  children,
  className,
  error,
  hint,
  label,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  hint?: string;
  label: string;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium", className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      <FieldError message={error} />
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-semibold text-destructive">{message}</p>;
}
