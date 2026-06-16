import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const systemPrompt = readFileSync(
  join(process.cwd(), "src/generated/system-prompt.txt"),
  "utf-8",
);

const geminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/openai/";
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const maxImageCount = 3;
const maxImageBytes = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Missing GEMINI_API_KEY in the environment." },
      { status: 500 },
    );
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: geminiBaseUrl,
    });
    const { messages } = await req.json();

    if (!validateMessages(messages)) {
      return Response.json(
        { error: "Invalid messages or image attachments." },
        { status: 400 },
      );
    }

    const response = await client.chat.completions.create({
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ] satisfies ChatCompletionMessageParam[],
      stream: true,
    });

    return new Response(response.toReadableStream(), {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error(error);
    const message = getPublicErrorMessage(error);
    const status = getPublicErrorStatus(error);

    return Response.json({ error: message }, { status });
  }
}

function getPublicErrorStatus(error: unknown) {
  const status = getProviderStatus(error);

  if (status === 400 || status === 429 || status === 503) {
    return status;
  }

  return 500;
}

function getPublicErrorMessage(error: unknown) {
  const status = getProviderStatus(error);

  if (status === 400) {
    return "The chat request was invalid.";
  }

  if (status === 429) {
    return "The model rate limit was reached. Try again later.";
  }

  if (status === 503) {
    return "The model is temporarily unavailable. Try again.";
  }

  return "The chat response failed. Try again.";
}

function getProviderStatus(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return typeof error.status === "number" ? error.status : null;
}

function validateMessages(
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
