"use client";

import { MessageProvider, useThread } from "@openuidev/react-headless";
import { Shell } from "@openuidev/react-ui";
import { useCallback, useMemo } from "react";
import { isChatResponseError } from "@/application/services/chat/chat-response-error";
import {
  getChatRetryBlockedMessage,
  getIsLatestUserMessageWithoutResponse,
  getLastUserMessageRetryPolicy,
} from "@/application/services/chat/chat-retry-policy";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
import { ChatThreadError } from "@/presentation/components/molecules/chat-thread-error";
import { GenUIAssistantMessage } from "@/presentation/components/organisms/genui-assistant-message";
import { ImageUserMessage } from "@/presentation/components/organisms/image-user-message/image-user-message";

export function ChatMessages() {
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const processMessage = useThread((state) => state.processMessage);
  const setMessages = useThread((state) => state.setMessages);
  const threadError = useThread((state) => state.threadError);

  const retryPolicy = useMemo(() => getLastUserMessageRetryPolicy(messages), [messages]);
  const latestUserMessageId = useMemo(() => {
    return messages.findLast((message) => message.role === "user")?.id ?? null;
  }, [messages]);
  const hasLatestUserMessageWithoutResponse = useMemo(() => {
    if (!latestUserMessageId) {
      return false;
    }

    return getIsLatestUserMessageWithoutResponse(messages, latestUserMessageId);
  }, [latestUserMessageId, messages]);
  const canRetryThreadError = Boolean(
    threadError && (!isChatResponseError(threadError) || threadError.retryable),
  );
  const retryBlockedMessage =
    canRetryThreadError && retryPolicy.status === "blocked"
      ? getChatRetryBlockedMessage(retryPolicy.reason)
      : null;
  const shouldShowUnansweredResponse =
    !isRunning && !threadError && hasLatestUserMessageWithoutResponse;
  const unansweredRetryBlockedMessage =
    shouldShowUnansweredResponse && retryPolicy.status === "blocked"
      ? getChatRetryBlockedMessage(retryPolicy.reason)
      : null;

  const handleRetry = useCallback(() => {
    if (retryPolicy.status !== "allowed") {
      return;
    }

    setMessages(retryPolicy.messagesBeforeRetry);
    void processMessage(retryPolicy.retryMessage);
  }, [processMessage, retryPolicy, setMessages]);

  return (
    <div className="openui-shell-thread-messages">
      {messages.map((message, index) => (
        <MessageProvider key={message.id} message={message}>
          <Shell.RenderMessage
            allMessages={messages}
            assistantMessage={GenUIAssistantMessage}
            isStreaming={isRunning && index === messages.length - 1}
            message={message}
            userMessage={ImageUserMessage}
          />
        </MessageProvider>
      ))}
      {isRunning && <Shell.MessageLoading />}
      {shouldShowUnansweredResponse && (
        <Shell.AssistantMessageContainer>
          <AssistantResponseNotice
            message="응답이 생성되지 않았습니다."
            onRetry={retryPolicy.status === "allowed" ? handleRetry : undefined}
            retryBlockedMessage={unansweredRetryBlockedMessage}
          />
        </Shell.AssistantMessageContainer>
      )}
      {!isRunning && threadError && (
        <ChatThreadError
          message={threadError.message}
          onRetry={
            canRetryThreadError && retryPolicy.status === "allowed" ? handleRetry : undefined
          }
          retryBlockedMessage={retryBlockedMessage}
        />
      )}
    </div>
  );
}
