"use client";

import {useThread} from "@openuidev/react-headless";
import {useCallback, useMemo} from "react";
import {
  getChatRetryControl,
  getIsChatThreadErrorRetryable,
  getLastUserMessageRetryPolicy,
} from "@/application/services/chat/chat-retry-policy";

type UseChatRetryProps = {
  isRetryTarget?: boolean;
  error?: unknown;
};

export function useChatRetry(props: UseChatRetryProps = {}) {
  const { isRetryTarget = true, error } = props;
  const messages = useThread((state) => state.messages);
  const processMessage = useThread((state) => state.processMessage);
  const setMessages = useThread((state) => state.setMessages);

  const retryPolicy = useMemo(() => {
    return getLastUserMessageRetryPolicy(messages);
  }, [messages]);

  const retryControl = getChatRetryControl(retryPolicy, {
    isRetryTarget,
    isRetryableError: error === undefined ? undefined : getIsChatThreadErrorRetryable(error),
  });

  const handleRetry = useCallback(() => {
    if (retryPolicy.status !== "allowed") {
      return;
    }

    setMessages(retryPolicy.messagesBeforeRetry);
    void processMessage(retryPolicy.retryMessage);
  }, [processMessage, retryPolicy, setMessages]);

  return {
    retryControl,
    handleRetry,
  };
}
