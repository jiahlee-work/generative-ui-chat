import type { BinaryInputContent } from "@openuidev/react-headless";

type ImageBinaryInputContent = BinaryInputContent & {
  attachmentId?: string;
};

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
