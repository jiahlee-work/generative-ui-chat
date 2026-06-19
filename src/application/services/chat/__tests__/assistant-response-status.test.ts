import type { AssistantMessage } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import {
  getAssistantResponseMetadata,
  getAssistantResponseStatus,
  setAssistantResponseStatus,
} from "@/application/services/chat/assistant-response-status";

describe("어시스턴트 응답 상태", () => {
  it("어시스턴트 메시지 metadata에 중단 상태를 저장한다", () => {
    const message: AssistantMessage = {
      id: "assistant-1",
      role: "assistant",
      content: "응답",
    };

    const interruptedMessage = setAssistantResponseStatus(message, "interrupted");

    expect(interruptedMessage.content).toBe("응답");
    expect(interruptedMessage.metadata).toEqual({
      responseStatus: "interrupted",
    });
    expect(getAssistantResponseStatus(interruptedMessage)).toBe("interrupted");
    expect(getAssistantResponseMetadata(interruptedMessage)).toEqual({
      responseStatus: "interrupted",
    });
  });

  it("중단 상태가 없으면 null을 반환한다", () => {
    expect(
      getAssistantResponseStatus({
        id: "assistant-1",
        role: "assistant",
        content: "응답",
      }),
    ).toBeNull();
  });
});
