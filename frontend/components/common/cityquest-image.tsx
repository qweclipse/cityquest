"use client";

import { ImageIcon, ImageOff, Sparkles } from "lucide-react";
import { useState } from "react";

import type {
  CityQuestImageSelection,
  ImageQuality,
} from "@/lib/images/cityquest-images";
import { cn } from "@/lib/utils";

interface CityQuestImageProps {
  alt: string;
  badgeClassName?: string;
  className?: string;
  image: CityQuestImageSelection;
  imageClassName?: string;
  showBadge?: boolean;
}

export function CityQuestImage({
  alt,
  badgeClassName,
  className,
  image,
  imageClassName,
  showBadge = true,
}: CityQuestImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const failed = failedSource === image.src;
  const src = failed ? image.fallbackSrc : image.src;
  const quality: ImageQuality = failed ? "category_fallback" : image.quality;
  const label = failed ? "Fallback image" : image.label;
  const title = failed
    ? "Original image failed to load. Showing local fallback."
    : image.title;
  const Icon =
    quality === "real_photo" ? ImageIcon : quality === "needs_review" ? ImageOff : Sparkles;

  return (
    <span
      className={cn("relative block overflow-hidden bg-muted", className)}
      data-image-pool={image.poolKey}
      data-image-quality={quality}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => {
          if (src !== image.fallbackSrc) {
            setFailedSource(image.src);
          }
        }}
        src={src}
      />
      {showBadge ? (
        <span
          aria-label={title}
          className={cn(
            "absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg border border-white/20 bg-card/88 px-2 py-1 text-[0.68rem] font-semibold text-card-foreground shadow-sm backdrop-blur",
            badgeClassName,
          )}
          title={title}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
        </span>
      ) : null}
    </span>
  );
}
