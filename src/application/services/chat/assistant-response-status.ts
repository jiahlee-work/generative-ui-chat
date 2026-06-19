import type { AssistantMessage } from "@openuidev/react-headless";

export type AssistantResponseMetadata = {
  responseStatus?: "interrupted";
};

export type AssistantMessageWithMetadata = AssistantMessage & {
  metadata?: AssistantResponseMetadata;
};

export function getAssistantResponseStatus(message: AssistantMessage) {
  return getAssistantResponseMetadata(message)?.responseStatus ?? null;
}

export function getAssistantResponseMetadata(message: AssistantMessage) {
  const metadata = (message as AssistantMessageWithMetadata).metadata;

  if (metadata?.responseStatus !== "interrupted") {
    return undefined;
  }

  return metadata;
}

export function setAssistantResponseStatus(
  message: AssistantMessage,
  responseStatus: "interrupted",
): AssistantMessageWithMetadata {
  return {
    ...message,
    metadata: {
      ...getAssistantResponseMetadata(message),
      responseStatus,
    },
  };
}

export function getStoredAssistantResponseMetadata(message: AssistantMessage) {
  return getAssistantResponseMetadata(message);
}
