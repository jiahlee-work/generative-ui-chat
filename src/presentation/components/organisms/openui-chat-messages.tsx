"use client";

import { MessageProvider, useThread } from "@openuidev/react-headless";
import { Shell } from "@openuidev/react-ui";
import { useChatRetry } from "@/application/hooks/chat/use-chat-retry";
import { useLatestUserResponse } from "@/application/hooks/chat/use-latest-user-response";
import { getIsUnansweredUserMessageRetryTarget } from "@/application/services/chat/chat-retry-policy";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
import { ChatThreadError } from "@/presentation/components/molecules/chat-thread-error";
import { ChatUserMessage } from "@/presentation/components/organisms/chat-user-message/chat-user-message";
import { OpenUIAssistantMessage } from "@/presentation/components/organisms/openui-assistant-message/openui-assistant-message";

export function OpenUIChatMessages() {
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const threadError = useThread((state) => state.threadError);
  const latestUserResponse = useLatestUserResponse();
  const shouldShowUnansweredResponse = getIsUnansweredUserMessageRetryTarget({
    hasThreadError: Boolean(threadError),
    isLatestUserMessageMissingResponse: latestUserResponse.isMissing,
    isRunning,
  });
  const { retryControl: threadErrorRetryControl, handleRetry: handleThreadErrorRetry } =
    useChatRetry({
      isRetryTarget: Boolean(threadError),
      error: threadError,
    });
  const { retryControl: unansweredRetryControl, handleRetry: handleUnansweredRetry } = useChatRetry(
    {
      isRetryTarget: shouldShowUnansweredResponse,
    },
  );

  return (
    <div className="openui-shell-thread-messages">
      {messages.map((message, index) => (
        <MessageProvider key={message.id} message={message}>
          <Shell.RenderMessage
            allMessages={messages}
            assistantMessage={OpenUIAssistantMessage}
            isStreaming={isRunning && index === messages.length - 1}
            message={message}
            userMessage={ChatUserMessage}
          />
        </MessageProvider>
      ))}
      {isRunning && <Shell.MessageLoading />}
      {shouldShowUnansweredResponse && (
        <Shell.AssistantMessageContainer>
          <AssistantResponseNotice
            message="응답이 생성되지 않았습니다."
            onRetry={unansweredRetryControl.canRetry ? handleUnansweredRetry : undefined}
            retryBlockedMessage={unansweredRetryControl.blockedMessage}
          />
        </Shell.AssistantMessageContainer>
      )}
      {!isRunning && threadError && (
        <ChatThreadError
          message={threadError.message}
          onRetry={threadErrorRetryControl.canRetry ? handleThreadErrorRetry : undefined}
          retryBlockedMessage={threadErrorRetryControl.blockedMessage}
        />
      )}
    </div>
  );
}
