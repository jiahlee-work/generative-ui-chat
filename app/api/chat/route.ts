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
const serverSetupErrorMessage =
  "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.";

type ChatErrorCode =
  | "missing_api_key"
  | "invalid_request"
  | "rate_limited"
  | "model_unavailable"
  | "response_failed";

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    logChatError({
      code: "missing_api_key",
      message: "Gemini API 키가 설정되지 않았습니다.",
      status: 500,
    });

    return createErrorResponse({
      code: "missing_api_key",
      message: serverSetupErrorMessage,
      retryable: false,
      status: 500,
    });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: geminiBaseUrl,
    });
    const { messages } = await req.json();

    if (!validateMessages(messages)) {
      logChatError({
        code: "invalid_request",
        message: "채팅 요청 또는 이미지 첨부가 올바르지 않습니다.",
        status: 400,
      });

      return createErrorResponse({
        code: "invalid_request",
        message: "채팅 요청 또는 이미지 첨부가 올바르지 않습니다.",
        retryable: false,
        status: 400,
      });
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
    const errorDetail = getPublicErrorDetail(error);
    logChatError({
      code: errorDetail.code,
      message: getInternalErrorMessage(error),
      status: errorDetail.status,
    });

    return createErrorResponse(errorDetail);
  }
}

function getPublicErrorDetail(error: unknown) {
  const status = getProviderStatus(error);

  if (status === 400) {
    return {
      code: "invalid_request",
      message: "채팅 요청이 올바르지 않습니다.",
      retryable: false,
      status,
    } satisfies ErrorResponseDetail;
  }

  if (status === 429) {
    return {
      code: "rate_limited",
      message: "요청이 많아 잠시 응답할 수 없습니다. 나중에 다시 시도해 주세요.",
      retryable: true,
      status,
    } satisfies ErrorResponseDetail;
  }

  if (status === 503) {
    return {
      code: "model_unavailable",
      message: "일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      retryable: true,
      status,
    } satisfies ErrorResponseDetail;
  }

  return {
    code: "response_failed",
    message: "응답을 생성하지 못했습니다. 다시 시도해 주세요.",
    retryable: true,
    status: 500,
  } satisfies ErrorResponseDetail;
}

function getProviderStatus(error: unknown) {
  if (!isRecord(error)) {
    return null;
  }

  return typeof error.status === "number" ? error.status : null;
}

function getInternalErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function logChatError(error: {
  code: ChatErrorCode;
  message: string;
  status: number;
}) {
  console.error("[chat:error]", error);
}

type ErrorResponseDetail = {
  code: ChatErrorCode;
  message: string;
  retryable: boolean;
  status: number;
};

function createErrorResponse(error: ErrorResponseDetail) {
  return Response.json(
    {
      error: {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      },
    },
    { status: error.status },
  );
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
