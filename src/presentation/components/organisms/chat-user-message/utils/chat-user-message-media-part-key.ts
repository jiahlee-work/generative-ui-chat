import {
  type ChatUserMessageMediaPart,
  getUserMessageImagePartKey,
} from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-content";

export function getChatUserMessageMediaPartKey(part: ChatUserMessageMediaPart) {
  if (part.type === "unavailableImage") {
    return part.part.key;
  }

  return getUserMessageImagePartKey(part.part);
}
