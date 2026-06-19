"use client";

import { useCallback, useRef } from "react";
import { normalizeAssistantCopyText } from "@/application/services/chat/assistant-copy-text";

export function useAssistantCopyAction() {
  const renderedResponseRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const copyText = normalizeAssistantCopyText(renderedResponseRef.current?.innerText);

    if (!copyText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    handleCopy,
    renderedResponseRef,
  };
}
