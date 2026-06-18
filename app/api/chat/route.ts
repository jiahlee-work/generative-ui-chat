import { NextRequest } from "next/server";
import {
  type ChatApiErrorDetail,
  getProviderChatErrorDetail,
  invalidChatRequestError,
  missingApiKeyChatError,
} from "@/application/services/chat/chat-api-error";
import {
  getChatRequestMessages,
  validateChatRequestMessages,
} from "@/application/services/chat/chat-request-validation";
import { logChatError } from "@/infrastructure/logging/server-log";
import {
  createGeminiChatStream,
  getGeminiInternalErrorMessage,
  getGeminiProviderStatus,
  isMissingGeminiApiKeyError,
} from "@/infrastructure/providers/gemini/gemini-chat-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const messages = getChatRequestMessages(body);

    if (!validateChatRequestMessages(messages)) {
      logChatError({
        code: invalidChatRequestError.code,
        internalMessage: "채팅 요청 또는 이미지 첨부가 올바르지 않습니다.",
        status: invalidChatRequestError.status,
      });

      return createErrorResponse(invalidChatRequestError);
    }

    return new Response(await createGeminiChatStream(messages), {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    const errorDetail = getChatErrorDetail(error);
    logChatError({
      code: errorDetail.code,
      internalMessage: getGeminiInternalErrorMessage(error),
      status: errorDetail.status,
    });

    return createErrorResponse(errorDetail);
  }
}

function getChatErrorDetail(error: unknown) {
  if (isMissingGeminiApiKeyError(error)) {
    return missingApiKeyChatError;
  }

  return getProviderChatErrorDetail(getGeminiProviderStatus(error));
}

function createErrorResponse(error: ChatApiErrorDetail) {
  return Response.json(
    {
      error: {
        code: error.code,
        retryable: error.retryable,
      },
    },
    { status: error.status },
  );
}
