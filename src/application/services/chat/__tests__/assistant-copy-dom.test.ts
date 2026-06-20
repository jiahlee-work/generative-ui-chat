import { describe, expect, it } from "vitest";
import { getShouldShowAssistantImageCopyButtons } from "@/application/services/chat/assistant-copy-dom";

describe("어시스턴트 이미지 개별 복사 버튼 표시 정책", () => {
  it("텍스트와 이미지가 함께 렌더링된 경우에만 개별 이미지 복사 버튼을 표시한다", () => {
    expect(
      getShouldShowAssistantImageCopyButtons(createRenderedResponse("설명 텍스트", ["image.png"])),
    ).toBe(true);
  });

  it("텍스트만 렌더링된 경우 개별 이미지 복사 버튼을 표시하지 않는다", () => {
    expect(getShouldShowAssistantImageCopyButtons(createRenderedResponse("설명 텍스트", []))).toBe(
      false,
    );
  });

  it("이미지만 렌더링된 경우 개별 이미지 복사 버튼을 표시하지 않는다", () => {
    expect(getShouldShowAssistantImageCopyButtons(createRenderedResponse("", ["image.png"]))).toBe(
      false,
    );
  });
});

function createRenderedResponse(innerText: string, imageSources: string[]) {
  return {
    innerText,
    querySelectorAll: () =>
      imageSources.map((source) => ({
        currentSrc: source,
        src: source,
      })),
  } as unknown as HTMLElement;
}
