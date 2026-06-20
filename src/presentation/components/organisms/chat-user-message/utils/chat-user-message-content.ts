import type { BinaryInputContent, InputContent } from "@openuidev/react-headless";
import { getUnavailableImageFilename } from "@/application/services/chat/unavailable-image";

type UserMessageBinaryInputContent = BinaryInputContent & {
  attachmentId?: string;
};

export type UnavailableImagePart = {
  filename: string;
  key: string;
};

export type ChatUserMessageMediaPart =
  | {
      imageIndex: number;
      part: UserMessageBinaryInputContent;
      type: "image";
    }
  | {
      part: UnavailableImagePart;
      type: "unavailableImage";
    };

export function getChatUserMessageContentParts(content: InputContent[]) {
  const imageParts: UserMessageBinaryInputContent[] = [];
  const mediaParts: ChatUserMessageMediaPart[] = [];
  const textParts: Extract<InputContent, { type: "text" }>[] = [];
  const unavailableImageParts: UnavailableImagePart[] = [];

  for (const [index, part] of content.entries()) {
    if (part.type === "binary") {
      mediaParts.push({
        imageIndex: imageParts.length,
        part,
        type: "image",
      });
      imageParts.push(part);
      continue;
    }

    const unavailableImageFilename = getUnavailableImageFilename(part.text);

    if (unavailableImageFilename) {
      unavailableImageParts.push({
        filename: unavailableImageFilename,
        key: `unavailable-image:${index}:${unavailableImageFilename}`,
      });
      mediaParts.push({
        part: unavailableImageParts[unavailableImageParts.length - 1],
        type: "unavailableImage",
      });
      continue;
    }

    textParts.push(part);
  }

  return {
    imageParts,
    mediaParts,
    textParts,
    unavailableImageParts,
  };
}

export function getUserMessageImagePartSource(part: BinaryInputContent) {
  if (part.url) {
    return part.url;
  }

  return `data:${part.mimeType};base64,${part.data ?? ""}`;
}

export function getUserMessageImagePartKey(part: UserMessageBinaryInputContent) {
  if (part.attachmentId) {
    return part.attachmentId;
  }

  if (part.url) {
    return part.url;
  }

  return `${part.mimeType}:${part.filename ?? "image"}:${part.data ?? ""}`;
}
