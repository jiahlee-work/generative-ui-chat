import type { BinaryInputContent } from "@openuidev/react-headless";

export function getImagePartSource(part: BinaryInputContent) {
  if (part.url) {
    return part.url;
  }

  return `data:${part.mimeType};base64,${part.data ?? ""}`;
}
