import { describe, expect, it } from "vitest";
import { createImageInputContent } from "@/application/services/chat/image-composer-content";
import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";

describe("이미지 입력 콘텐츠", () => {
  it("첨부 이미지에서 텍스트와 바이너리 입력 콘텐츠를 만든다", () => {
    expect(createImageInputContent("  설명해줘  ", [attachment])).toEqual([
      { type: "text", text: "설명해줘" },
      {
        type: "binary",
        mimeType: "image/png",
        url: "data:image/png;base64,abc",
        filename: "image.png",
        attachmentId: "attachment-1",
      },
    ]);
  });

  it("이미지만 첨부된 경우 기본 프롬프트를 사용한다", () => {
    expect(createImageInputContent("", [attachment])[0]).toEqual({
      type: "text",
      text: "첨부한 이미지를 설명해 주세요.",
    });
  });
});

const attachment: BrowserImageAttachment = {
  id: "attachment-1",
  name: "image.png",
  dataUrl: "data:image/png;base64,abc",
  mimeType: "image/png",
  size: 123,
};
