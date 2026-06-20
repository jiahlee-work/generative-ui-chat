import type {
  BinaryInputContent,
  CreateMessage,
  InputContent,
  Message,
  UserMessage,
} from "@openuidev/react-headless";
import { isChatResponseError } from "@/application/services/chat/chat-response-error";
import { getIsLatestAssistantResponseMessage } from "@/application/services/chat/genui-assistant-message";
import { getUnavailableImageFilename } from "@/application/services/chat/unavailable-image";

export type ChatRetryBlockReason = "noUserMessage" | "imageRequiresReattach";

export type ChatRetryPolicy =
  | {
      status: "allowed";
      retryMessage: CreateMessage;
      messagesBeforeRetry: Message[];
    }
  | {
      status: "blocked";
      reason: ChatRetryBlockReason;
    };

export type ChatRetryControl = {
  canRetry: boolean;
  blockedMessage: string | null;
};

type ChatRetryControlOptions = {
  isRetryTarget: boolean;
  error?: unknown;
};

type AssistantMessageRetryTargetOptions = {
  assistantMessageId: string;
  hasThreadError: boolean;
  isRunning: boolean;
  messages: Message[];
};

type UnansweredUserMessageRetryTargetOptions = {
  hasThreadError: boolean;
  isLatestUserMessageMissingResponse: boolean;
  isRunning: boolean;
};

export function getIsAssistantMessageRetryTarget(options: AssistantMessageRetryTargetOptions) {
  if (options.isRunning || options.hasThreadError) {
    return false;
  }

  return getIsLatestAssistantResponseMessage(options.messages, options.assistantMessageId);
}

export function getIsUnansweredUserMessageRetryTarget(
  options: UnansweredUserMessageRetryTargetOptions,
) {
  if (options.isRunning || options.hasThreadError) {
    return false;
  }

  return options.isLatestUserMessageMissingResponse;
}

export function getLastUserMessageRetryPolicy(messages: Message[]): ChatRetryPolicy {
  const retryMessageIndex = messages.findLastIndex(
    (message): message is UserMessage => message.role === "user",
  );

  if (retryMessageIndex < 0) {
    return {
      status: "blocked",
      reason: "noUserMessage",
    };
  }

  const retryMessage = messages[retryMessageIndex] as UserMessage;

  if (hasImageThatRequiresReattachment(retryMessage.content)) {
    return {
      status: "blocked",
      reason: "imageRequiresReattach",
    };
  }

  return {
    status: "allowed",
    retryMessage: {
      role: "user",
      content: retryMessage.content,
    },
    messagesBeforeRetry: messages.slice(0, retryMessageIndex),
  };
}

export function getChatRetryControl(
  policy: ChatRetryPolicy,
  options: ChatRetryControlOptions,
): ChatRetryControl {
  if (!options.isRetryTarget) {
    return {
      canRetry: false,
      blockedMessage: null,
    };
  }

  if (options.error !== undefined && !getIsChatThreadErrorRetryable(options.error)) {
    return {
      canRetry: false,
      blockedMessage: null,
    };
  }

  if (policy.status === "allowed") {
    return {
      canRetry: true,
      blockedMessage: null,
    };
  }

  return {
    canRetry: false,
    blockedMessage: getChatRetryBlockedMessage(policy.reason),
  };
}

export function getIsChatThreadErrorRetryable(error: unknown) {
  if (!error) {
    return false;
  }

  if (!isChatResponseError(error)) {
    return true;
  }

  return error.retryable;
}

export function getIsLatestUserMessageWithoutResponse(messages: Message[], messageId: string) {
  const messageIndex = messages.findIndex((message) => {
    return message.id === messageId;
  });

  if (messageIndex < 0 || messages[messageIndex]?.role !== "user") {
    return false;
  }

  for (let index = messageIndex + 1; index < messages.length; index += 1) {
    const message = messages[index];

    if (message?.role === "assistant" || message?.role === "tool") {
      return false;
    }
  }

  return messages.findLast((message) => message.role === "user")?.id === messageId;
}

export function getChatRetryBlockedMessage(reason: ChatRetryBlockReason) {
  if (reason === "imageRequiresReattach") {
    return "이미지는 다시 첨부해야 합니다.";
  }

  return null;
}

function hasImageThatRequiresReattachment(content: UserMessage["content"]) {
  if (typeof content === "string") {
    return false;
  }

  return content.some((part) => {
    if (part.type === "binary") {
      return !hasDirectImageData(part);
    }

    return isUnavailableImageText(part);
  });
}

function hasDirectImageData(part: BinaryInputContent) {
  return Boolean(part.data) || part.url?.startsWith("data:image/") === true;
}

function isUnavailableImageText(part: InputContent) {
  return part.type === "text" && getUnavailableImageFilename(part.text) !== null;
}
