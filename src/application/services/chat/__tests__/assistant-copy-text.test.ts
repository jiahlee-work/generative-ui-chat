import { describe, expect, it } from "vitest";
import { normalizeAssistantCopyText } from "@/application/services/chat/assistant-copy-text";

describe("어시스턴트 응답 복사 텍스트", () => {
  it("렌더링된 텍스트의 앞뒤 공백을 정리한다", () => {
    expect(normalizeAssistantCopyText("  1+1  \n  = 2  ")).toBe("1+1\n= 2");
  });

  it("과도한 빈 줄을 줄인다", () => {
    expect(normalizeAssistantCopyText("첫 줄\n\n\n\n둘째 줄")).toBe("첫 줄\n\n둘째 줄");
  });

  it("복사할 텍스트가 없으면 null을 반환한다", () => {
    expect(normalizeAssistantCopyText("  \n  ")).toBeNull();
    expect(normalizeAssistantCopyText(null)).toBeNull();
  });
});
