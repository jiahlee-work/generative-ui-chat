import type { Message, ToolMessage } from "@openuidev/react-headless";

export function getIsStreamingAssistantMessage(
  messages: Message[],
  isRunning: boolean,
  messageId: string,
) {
  if (!isRunning) {
    return false;
  }

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === "assistant") {
      return messages[index]?.id === messageId;
    }
  }

  return false;
}

export function getInitialRendererState(contextString: string | null) {
  if (!contextString) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(contextString);

    if (Array.isArray(parsed) && typeof parsed[0] === "object") {
      return parsed[0];
    }

    if (typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function getFollowingToolMessages(messages: Message[], assistantMessageId: string) {
  const result: ToolMessage[] = [];
  const messageIndex = messages.findIndex((item) => {
    return item.id === assistantMessageId;
  });

  if (messageIndex === -1) {
    return result;
  }

  for (let index = messageIndex + 1; index < messages.length; index += 1) {
    const item = messages[index];

    if (item?.role === "tool") {
      result.push(item);
      continue;
    }

    break;
  }

  return result;
}
