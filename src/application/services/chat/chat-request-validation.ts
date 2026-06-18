import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageCount = 3;
const maxImageBytes = 4 * 1024 * 1024;

export function getChatRequestMessages(body: unknown) {
  if (!isRecord(body)) {
    return undefined;
  }

  return body.messages;
}

export function validateChatRequestMessages(
  messages: unknown,
): messages is ChatCompletionMessageParam[] {
  if (!Array.isArray(messages)) {
    return false;
  }

  let imageCount = 0;

  for (const message of messages) {
    if (!isRecord(message)) {
      return false;
    }

    const { content } = message;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (!isRecord(part) || part.type !== "image_url") {
        continue;
      }

      imageCount += 1;

      if (imageCount > maxImageCount) {
        return false;
      }

      const imageUrl = part.image_url;

      if (!isRecord(imageUrl) || typeof imageUrl.url !== "string") {
        return false;
      }

      if (!isValidInlineImage(imageUrl.url)) {
        return false;
      }
    }
  }

  return true;
}

function isValidInlineImage(url: string) {
  const match = url.match(/^data:([^;]+);base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    return false;
  }

  const [, mimeType, base64Data] = match;

  if (!mimeType || !allowedImageMimeTypes.has(mimeType)) {
    return false;
  }

  const estimatedBytes = Math.floor((base64Data.length * 3) / 4);

  return estimatedBytes <= maxImageBytes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
