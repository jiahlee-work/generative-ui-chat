"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { useCallback } from "react";
import { getUserMessageCopyText } from "@/application/services/chat/message-copy-text";
import { writeBrowserClipboardText } from "@/infrastructure/browser/clipboard";

export function useUserCopyAction(message: UserMessage) {
  // 사용자 메시지는 저장된 message.content가 원본 입력이므로 DOM을 읽지 않고 복사 내용을 만든다.
  const copyText = getUserMessageCopyText(message.content);

  const handleCopy = useCallback(async () => {
    if (!copyText) {
      return false;
    }

    return writeBrowserClipboardText(copyText);
  }, [copyText]);

  return {
    copyText,
    handleCopy,
  };
}
