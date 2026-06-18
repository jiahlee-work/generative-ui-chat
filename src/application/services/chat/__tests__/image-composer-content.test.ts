import { describe, expect, it } from "vitest";
import { createImageInputContent } from "@/application/services/chat/image-composer-content";
import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";

describe("image composer content", () => {
  it("creates text and binary input content from attachments", () => {
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

  it("uses a default prompt when only images are attached", () => {
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
