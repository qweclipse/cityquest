"use client";

import { useEffect, type RefObject } from "react";

interface UsePopoverDismissOptions {
  onClose: () => void;
  open: boolean;
  ref: RefObject<HTMLElement | null>;
}

export function usePopoverDismiss({ onClose, open, ref }: UsePopoverDismissOptions) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      onClose();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open, ref]);
}
