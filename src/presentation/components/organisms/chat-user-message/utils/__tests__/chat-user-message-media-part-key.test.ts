import { describe, expect, it } from "vitest";
import { getChatUserMessageMediaPartKey } from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-media-part-key";

describe("사용자 메시지 미디어 key", () => {
  it("정상 이미지는 이미지 part key를 사용한다", () => {
    expect(
      getChatUserMessageMediaPartKey({
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
      getChatUserMessageMediaPartKey({
        part: {
          filename: "missing.png",
          key: "unavailable-image:0:missing.png",
        },
        type: "unavailableImage",
      }),
    ).toBe("unavailable-image:0:missing.png");
  });
});
