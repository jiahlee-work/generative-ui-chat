"use client";

import { type AssistantMessage, useThread } from "@openuidev/react-headless";
import { useChatRetry } from "@/application/hooks/chat/use-chat-retry";
import { getAssistantResponseStatus } from "@/application/services/chat/assistant-response-status";
import { getIsAssistantMessageRetryTarget } from "@/application/services/chat/chat-retry-policy";
import {
  getFollowingToolMessages,
  getIsStreamingAssistantMessage,
} from "@/application/services/chat/openui-assistant-message";

export function useAssistantMessageState(message: AssistantMessage) {
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const threadError = useThread((state) => state.threadError);
  const isStreaming = getIsStreamingAssistantMessage(messages, isRunning, message.id);
  const toolMessages = getFollowingToolMessages(messages, message.id);
  const responseStatus = getAssistantResponseStatus(message);
  const canRetryAssistantResponse = getIsAssistantMessageRetryTarget({
    assistantMessageId: message.id,
    hasThreadError: Boolean(threadError),
    isRunning,
    messages,
  });
  const { retryControl, handleRetry } = useChatRetry({
    isRetryTarget: canRetryAssistantResponse,
  });
  const shouldShowInterruptedNotice = responseStatus === "interrupted";

  return {
    handleRetry,
    isRunning,
    isStreaming,
    retryControl,
    shouldShowInterruptedNotice,
    toolMessages,
  };
}
