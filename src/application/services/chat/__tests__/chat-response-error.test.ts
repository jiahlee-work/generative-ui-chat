import { describe, expect, it } from "vitest";
import { getChatResponseErrorMessage } from "@/application/services/chat/chat-response-error";

describe("채팅 응답 에러 메시지", () => {
  it("구조화된 에러 응답의 코드를 사용자 메시지로 바꾼다", async () => {
    const response = Response.json(
      {
        error: {
          code: "missing_api_key",
          message: "Missing GEMINI_API_KEY in the environment.",
          retryable: false,
        },
      },
      { status: 500 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.",
    );
  });

  it("구조화된 에러 응답의 내부 메시지를 사용자에게 노출하지 않는다", async () => {
    const response = Response.json(
      {
        error: {
          code: "response_failed",
          message: "Gemini provider responded with malformed JSON.",
          retryable: true,
        },
      },
      { status: 500 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "응답을 생성하지 못했습니다. 다시 시도해 주세요.",
    );
  });

  it("메시지가 없는 구조화된 에러 응답도 코드로 사용자 메시지를 만든다", async () => {
    const response = Response.json(
      {
        error: {
          code: "rate_limited",
          retryable: true,
        },
      },
      { status: 429 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "요청이 많아 잠시 응답할 수 없습니다. 나중에 다시 시도해 주세요.",
    );
  });

  it("알 수 없는 코드는 내부 메시지 대신 상태값 기반 메시지를 사용한다", async () => {
    const response = Response.json(
      {
        error: {
          code: "provider_auth_failed",
          message: "Gemini API key rejected: GEMINI_API_KEY is invalid.",
          retryable: false,
        },
      },
      { status: 500 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "응답을 생성하지 못했습니다. 다시 시도해 주세요.",
    );
  });

  it("알 수 없는 상태값은 내부 메시지 대신 기본 실패 메시지를 사용한다", async () => {
    const response = Response.json(
      {
        error: {
          code: "provider_auth_failed",
          message: "Gemini API key rejected: GEMINI_API_KEY is invalid.",
          retryable: false,
        },
      },
      { status: 502 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "채팅 요청에 실패했습니다. 다시 시도해 주세요.",
    );
  });

  it("기존 API 키 누락 문구를 사용자용 메시지로 바꾼다", async () => {
    const response = Response.json(
      { error: "Missing GEMINI_API_KEY in the environment." },
      { status: 500 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.",
    );
  });

  it("본문이 없는 503 응답을 재시도 가능한 메시지로 보여준다", async () => {
    const response = new Response(null, { status: 503 });

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.",
    );
  });
});
