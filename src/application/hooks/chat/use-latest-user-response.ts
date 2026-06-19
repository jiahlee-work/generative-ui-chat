"use client";

import { useThread } from "@openuidev/react-headless";
import { useMemo } from "react";
import { getIsLatestUserMessageWithoutResponse } from "@/application/services/chat/chat-retry-policy";

export function useLatestUserResponse() {
  const messages = useThread((state) => state.messages);
  const latestUserMessageId = useMemo(() => {
    return messages.findLast((message) => message.role === "user")?.id ?? null;
  }, [messages]);

  const isMissing = useMemo(() => {
    if (!latestUserMessageId) {
      return false;
    }

    return getIsLatestUserMessageWithoutResponse(messages, latestUserMessageId);
  }, [latestUserMessageId, messages]);

  return {
    isMissing,
  };
}
