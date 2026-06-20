import type { UserMessage } from "@openuidev/react-headless";
import { getOpenUIDisplayText } from "@/application/services/chat/openui-content";

export function normalizeCopyText(rawText: string | null | undefined) {
  if (!rawText) {
    return null;
  }

  const normalizedText = rawText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizedText.length > 0 ? normalizedText : null;
}

export function getUserMessageCopyText(content: UserMessage["content"]) {
  if (typeof content === "string") {
    return normalizeCopyText(getOpenUIDisplayText(content));
  }

  const textContent = content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");

  return normalizeCopyText(textContent);
}
