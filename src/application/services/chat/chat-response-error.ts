import type { ChatErrorCode } from "@/application/services/chat/chat-error-code";

export type ChatResponseErrorDetail = {
  message: string;
  retryable: boolean;
};

export class ChatResponseError extends Error {
  retryable: boolean;

  constructor(detail: ChatResponseErrorDetail) {
    super(detail.message);
    this.name = "ChatResponseError";
    this.retryable = detail.retryable;
  }
}

const chatErrorMessages = {
  invalid_request: "채팅 요청이 올바르지 않습니다.",
  missing_api_key: "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.",
  model_unavailable: "일시적으로 응답할 수 없습니다. 잠시 후 재시도해 주세요.",
  rate_limited: "요청이 많아 잠시 응답할 수 없습니다. 나중에 재시도해 주세요.",
  request_failed: "채팅 요청에 실패했습니다. 재시도해 주세요.",
  response_failed: "응답을 생성하지 못했습니다. 재시도해 주세요.",
} satisfies Record<ChatErrorCode, string>;

const statusErrorCodes: Partial<Record<number, ChatErrorCode>> = {
  400: "invalid_request",
  429: "rate_limited",
  500: "response_failed",
  503: "model_unavailable",
};

const chatErrorRetryable = {
  invalid_request: false,
  missing_api_key: false,
  model_unavailable: true,
  rate_limited: true,
  request_failed: true,
  response_failed: true,
} satisfies Record<ChatErrorCode, boolean>;

const legacyErrorCodeRules = [
  ["Missing GEMINI_API_KEY", "missing_api_key"],
  ["invalid", "invalid_request"],
  ["rate limit", "rate_limited"],
  ["temporarily unavailable", "model_unavailable"],
] as const satisfies readonly (readonly [string, ChatErrorCode])[];

export async function getChatResponseErrorMessage(response: Response) {
  return (await getChatResponseErrorDetail(response)).message;
}

export async function getChatResponseErrorDetail(response: Response): Promise<ChatResponseErrorDetail> {
  const fallbackCode = getFallbackErrorCode(response.status);

  try {
    const body = await response.json();

    if (!isErrorResponseBody(body)) {
      return createChatResponseErrorDetail(fallbackCode);
    }

    if (typeof body.error === "string") {
      return createChatResponseErrorDetail(getLegacyErrorCode(body.error));
    }

    if (isChatErrorCode(body.error.code)) {
      return createChatResponseErrorDetail(body.error.code, body.error.retryable);
    }
  } catch {
    return createChatResponseErrorDetail(fallbackCode);
  }

  return createChatResponseErrorDetail(fallbackCode);
}

export function isChatResponseError(error: unknown): error is ChatResponseError {
  return error instanceof ChatResponseError;
}

export function isErrorResponseBody(
  value: unknown,
): value is { error: string | { code?: unknown; message?: unknown; retryable?: unknown } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    (typeof value.error === "string" || (typeof value.error === "object" && value.error !== null))
  );
}

function isChatErrorCode(code: unknown): code is ChatErrorCode {
  return typeof code === "string" && code in chatErrorMessages;
}

function getFallbackErrorCode(status: number): ChatErrorCode {
  return statusErrorCodes[status] ?? "request_failed";
}

function createChatResponseErrorDetail(
  code: ChatErrorCode,
  retryableOverride?: unknown,
): ChatResponseErrorDetail {
  return {
    message: chatErrorMessages[code],
    retryable:
      typeof retryableOverride === "boolean" ? retryableOverride : chatErrorRetryable[code],
  };
}

function getLegacyErrorCode(message: string): ChatErrorCode {
  return (
    legacyErrorCodeRules.find(([pattern]) => message.includes(pattern))?.[1] ?? "response_failed"
  );
}
