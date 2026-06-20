"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { useCallback } from "react";
import { getUserMessageCopyText } from "@/application/services/chat/message-copy-text";

export function useUserCopyAction(message: UserMessage) {
  const copyText = getUserMessageCopyText(message.content);

  const handleCopy = useCallback(async () => {
    if (!copyText || typeof navigator === "undefined") {
      return false;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      return true;
    } catch {
      return false;
    }
  }, [copyText]);

  return {
    copyText,
    handleCopy,
  };
}
