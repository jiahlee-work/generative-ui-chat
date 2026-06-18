import { describe, expect, it } from "vitest";
import {
  getProviderChatErrorDetail,
  invalidChatRequestError,
  missingApiKeyChatError,
} from "@/application/services/chat/chat-api-error";

describe("채팅 API 에러 분류", () => {
  it("요청 검증 실패와 API 키 누락 에러를 명시적으로 제공한다", () => {
    expect(invalidChatRequestError).toEqual({
      code: "invalid_request",
      retryable: false,
      status: 400,
    });
    expect(missingApiKeyChatError).toEqual({
      code: "missing_api_key",
      retryable: false,
      status: 500,
    });
  });

  it("Gemini 응답 상태값을 공개 에러 정보로 바꾼다", () => {
    expect(getProviderChatErrorDetail(429)).toEqual({
      code: "rate_limited",
      retryable: true,
      status: 429,
    });
    expect(getProviderChatErrorDetail(503)).toEqual({
      code: "model_unavailable",
      retryable: true,
      status: 503,
    });
  });

  it("알 수 없는 Gemini 응답 상태값은 응답 실패로 처리한다", () => {
    expect(getProviderChatErrorDetail(null)).toEqual({
      code: "response_failed",
      retryable: true,
      status: 500,
    });
    expect(getProviderChatErrorDetail(502)).toEqual({
      code: "response_failed",
      retryable: true,
      status: 500,
    });
  });
});
