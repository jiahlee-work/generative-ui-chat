import type { BinaryInputContent, InputContent } from "@openuidev/react-headless";
import { getUnavailableImageFilename } from "@/application/services/chat/unavailable-image";

type ImageBinaryInputContent = BinaryInputContent & {
  attachmentId?: string;
};

export type UnavailableImagePart = {
  filename: string;
  key: string;
};

export type ImageMessageMediaPart =
  | {
      imageIndex: number;
      part: BinaryInputContent;
      type: "image";
    }
  | {
      part: UnavailableImagePart;
      type: "unavailableImage";
    };

export function getImageMessageContentParts(content: InputContent[]) {
  const imageParts: BinaryInputContent[] = [];
  const mediaParts: ImageMessageMediaPart[] = [];
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

export function getImagePartSource(part: BinaryInputContent) {
  if (part.url) {
    return part.url;
  }

  return `data:${part.mimeType};base64,${part.data ?? ""}`;
}

export function getImagePartKey(part: ImageBinaryInputContent) {
  if (part.attachmentId) {
    return part.attachmentId;
  }

  if (part.url) {
    return part.url;
  }

  return `${part.mimeType}:${part.filename ?? "image"}:${part.data ?? ""}`;
}
