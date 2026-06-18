"use client";

import { Shell } from "@openuidev/react-ui";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";

type ChatThreadErrorProps = {
  message?: string;
  onRetry?: () => void;
  retryBlockedMessage?: string | null;
};

export function ChatThreadError(props: ChatThreadErrorProps) {
  const { message, onRetry, retryBlockedMessage } = props;

  return (
    <Shell.AssistantMessageContainer>
      <AssistantResponseNotice
        message={message || "응답을 생성하지 못했습니다. 잠시 후 재시도해 주세요."}
        onRetry={onRetry}
        retryBlockedMessage={retryBlockedMessage}
        tone="error"
      />
    </Shell.AssistantMessageContainer>
  );
}
