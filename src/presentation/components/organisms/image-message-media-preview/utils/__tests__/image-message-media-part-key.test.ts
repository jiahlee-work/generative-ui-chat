import { describe, expect, it } from "vitest";
import { getImageMessageMediaPartKey } from "@/presentation/components/organisms/image-message-media-preview/utils/image-message-media-part-key";

describe("이미지 메시지 미디어 key", () => {
  it("정상 이미지는 이미지 part key를 사용한다", () => {
    expect(
      getImageMessageMediaPartKey({
        imageIndex: 0,
        part: {
          type: "binary",
          mimeType: "image/png",
          filename: "image.png",
          attachmentId: "attachment-1",
        },
        type: "image",
      }),
    ).toBe("attachment-1");
  });

  it("깨진 이미지는 복원 실패 part key를 사용한다", () => {
    expect(
      getImageMessageMediaPartKey({
        part: {
          filename: "missing.png",
          key: "unavailable-image:0:missing.png",
        },
        type: "unavailableImage",
      }),
    ).toBe("unavailable-image:0:missing.png");
  });
});
