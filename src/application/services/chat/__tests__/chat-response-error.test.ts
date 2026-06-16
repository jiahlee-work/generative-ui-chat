import { describe, expect, it } from "vitest";
import { getChatResponseErrorMessage } from "@/application/services/chat/chat-response-error";

describe("채팅 응답 에러 메시지", () => {
  it("구조화된 에러 응답의 사용자 메시지를 사용한다", async () => {
    const response = Response.json(
      {
        error: {
          code: "missing_api_key",
          message: "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.",
          retryable: false,
        },
      },
      { status: 500 },
    );

    await expect(getChatResponseErrorMessage(response)).resolves.toBe(
      "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.",
    );
  });

  it("기존 API key 누락 문구를 사용자용 메시지로 바꾼다", async () => {
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
