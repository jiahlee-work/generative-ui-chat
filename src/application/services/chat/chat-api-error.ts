import type { ChatApiErrorCode } from "@/application/services/chat/chat-error-code";

export type ChatApiErrorDetail = {
  code: ChatApiErrorCode;
  retryable: boolean;
  status: number;
};

export const invalidChatRequestError = {
  code: "invalid_request",
  retryable: false,
  status: 400,
} satisfies ChatApiErrorDetail;

export const missingApiKeyChatError = {
  code: "missing_api_key",
  retryable: false,
  status: 500,
} satisfies ChatApiErrorDetail;

const providerStatusErrorDetails: Partial<Record<number, ChatApiErrorDetail>> = {
  400: invalidChatRequestError,
  429: {
    code: "rate_limited",
    retryable: true,
    status: 429,
  },
  503: {
    code: "model_unavailable",
    retryable: true,
    status: 503,
  },
};

export function getProviderChatErrorDetail(status: number | null): ChatApiErrorDetail {
  return providerStatusErrorDetails[status ?? 0] ?? responseFailedError;
}

const responseFailedError = {
  code: "response_failed",
  retryable: true,
  status: 500,
} satisfies ChatApiErrorDetail;
