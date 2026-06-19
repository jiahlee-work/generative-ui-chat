"use client";

import { MessageProvider, useThread } from "@openuidev/react-headless";
import { Shell } from "@openuidev/react-ui";
import { useChatRetry } from "@/application/hooks/chat/use-chat-retry";
import { useLatestUserResponse } from "@/application/hooks/chat/use-latest-user-response";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
import { ChatThreadError } from "@/presentation/components/molecules/chat-thread-error";
import { GenUIAssistantMessage } from "@/presentation/components/organisms/genui-assistant-message/genui-assistant-message";
import { ImageUserMessage } from "@/presentation/components/organisms/image-user-message/image-user-message";

export function ChatMessages() {
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const threadError = useThread((state) => state.threadError);
  const latestUserResponse = useLatestUserResponse();
  const shouldShowUnansweredResponse = !isRunning && !threadError && latestUserResponse.isMissing;
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
