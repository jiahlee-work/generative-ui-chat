import {
  getImagePartKey,
  type ImageMessageMediaPart,
} from "@/presentation/components/organisms/image-user-message/utils/image-message-content";

export function getImageMessageMediaPartKey(part: ImageMessageMediaPart) {
  if (part.type === "unavailableImage") {
    return part.part.key;
  }

  return getImagePartKey(part.part);
}
