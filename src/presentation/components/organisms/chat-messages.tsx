"use client";

import { MessageProvider, useThread } from "@openuidev/react-headless";
import { Shell } from "@openuidev/react-ui";
import { ChatThreadError } from "@/presentation/components/molecules/chat-thread-error";
import { GenUIAssistantMessage } from "@/presentation/components/organisms/genui-assistant-message";
import { ImageUserMessage } from "@/presentation/components/organisms/image-user-message";

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
      {!isRunning && threadError && <ChatThreadError message={threadError.message} />}
    </div>
  );
}
