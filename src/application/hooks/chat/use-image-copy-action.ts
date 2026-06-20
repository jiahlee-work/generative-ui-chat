"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CopyActionState } from "@/application/hooks/chat/copy-action-state";
import { writeBrowserClipboardPayload } from "@/infrastructure/browser/clipboard";
import { fetchImageAsPngBlob } from "@/infrastructure/browser/image-blob";

export function useImageCopyAction(src: string) {
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyState, setCopyState] = useState<CopyActionState>("idle");
  const isCopying = copyState === "copying";

  const resetCopyStateLater = useCallback((delay: number) => {
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setCopyState("idle");
      copyResetTimeoutRef.current = null;
    }, delay);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!src || isCopying) {
      return;
    }

    setCopyState("copying");

    const imageBlob = await fetchImageAsPngBlob(src);
    const didCopy = imageBlob ? await writeBrowserClipboardPayload({ imageBlob }) : false;

    if (!didCopy) {
      setCopyState("failed");
      resetCopyStateLater(1500);
      return;
    }

    setCopyState("copied");
    resetCopyStateLater(800);
  }, [isCopying, resetCopyStateLater, src]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  return {
    copyState,
    handleCopy,
    isCopying,
  };
}
