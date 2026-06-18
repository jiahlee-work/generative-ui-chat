import type {
  BinaryInputContent,
  CreateMessage,
  InputContent,
  Message,
  UserMessage,
} from "@openuidev/react-headless";

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
  return part.type === "text" && part.text.startsWith("[이미지를 불러올 수 없습니다:");
}
