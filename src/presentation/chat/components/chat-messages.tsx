"use client";

import { MessageProvider, useThread } from "@openuidev/react-headless";
import { Shell } from "@openuidev/react-ui";
import { GenUIAssistantMessage } from "@/presentation/chat/components/genui-assistant-message";
import { ImageUserMessage } from "@/presentation/chat/components/image-user-message";

export function ChatMessages() {
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const threadError = useThread((state) => state.threadError);

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
      {!isRunning && threadError && (
        <ChatThreadError message={threadError.message} />
      )}
    </div>
  );
}

type ChatThreadErrorProps = {
  message?: string;
};

function ChatThreadError(props: ChatThreadErrorProps) {
  const { message } = props;

  return (
    <div className="openui-shell-thread-error">
      <div className="chat-thread-error" role="alert">
        <p className="chat-thread-error__title">응답을 생성하지 못했습니다.</p>
        <p className="chat-thread-error__description">
          {message || "잠시 후 다시 시도해 주세요."}
        </p>
      </div>
    </div>
  );
}
