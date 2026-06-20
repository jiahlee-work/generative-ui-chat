import { normalizeCopyText } from "@/application/services/chat/message-copy-text";

export function normalizeAssistantCopyText(renderedText: string | null | undefined) {
  return normalizeCopyText(renderedText);
}
