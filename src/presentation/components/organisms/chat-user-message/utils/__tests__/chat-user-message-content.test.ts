import { describe, expect, it } from "vitest";
import {
  getChatUserMessageContentParts,
  getUserMessageImagePartKey,
  getUserMessageImagePartSource,
} from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-content";

describe("사용자 메시지 콘텐츠 도우미", () => {
  it("이미지 조각 URL이 있으면 이미지 출처로 사용한다", () => {
    expect(
      getUserMessageImagePartSource({
        type: "binary",
        mimeType: "image/png",
        url: "blob:http://localhost/image",
      }),
    ).toBe("blob:http://localhost/image");
  });

  it("base64 이미지 데이터에서 데이터 URL을 만든다", () => {
    expect(
      getUserMessageImagePartSource({
        type: "binary",
        mimeType: "image/png",
        data: "abc",
      }),
    ).toBe("data:image/png;base64,abc");
  });

  it("안정적인 이미지 키로 첨부 ID를 우선 사용한다", () => {
    expect(
      getUserMessageImagePartKey({
        type: "binary",
        mimeType: "image/png",
        filename: "image.png",
        url: "blob:http://localhost/image",
        attachmentId: "attachment-1",
      }),
    ).toBe("attachment-1");
  });

  it("이미지 키가 없으면 URL 또는 이미지 콘텐츠로 대체한다", () => {
    expect(
      getUserMessageImagePartKey({
        type: "binary",
        mimeType: "image/webp",
        filename: "image.webp",
        url: "blob:http://localhost/image",
      }),
    ).toBe("blob:http://localhost/image");

    expect(
      getUserMessageImagePartKey({
        type: "binary",
        mimeType: "image/jpeg",
        filename: "image.jpg",
        data: "abc",
      }),
    ).toBe("image/jpeg:image.jpg:abc");
  });

  it("깨진 이미지 안내 텍스트를 일반 텍스트와 분리한다", () => {
    expect(
      getChatUserMessageContentParts([
        { type: "text", text: "이미지 설명" },
        { type: "text", text: "[이미지를 불러올 수 없습니다: missing.png]" },
      ]),
    ).toEqual({
      imageParts: [],
      mediaParts: [
        {
          part: {
            filename: "missing.png",
            key: "unavailable-image:1:missing.png",
          },
          type: "unavailableImage",
        },
      ],
      textParts: [{ type: "text", text: "이미지 설명" }],
      unavailableImageParts: [
        {
          filename: "missing.png",
          key: "unavailable-image:1:missing.png",
        },
      ],
    });
  });

  it("정상 이미지와 깨진 이미지의 표시 순서를 유지한다", () => {
    const imagePart = {
      type: "binary",
      mimeType: "image/png",
      filename: "image.png",
      url: "blob:http://localhost/image",
    } as const;

    expect(
      getChatUserMessageContentParts([
        { type: "text", text: "[이미지를 불러올 수 없습니다: missing.png]" },
        imagePart,
      ]).mediaParts,
    ).toEqual([
      {
        part: {
          filename: "missing.png",
          key: "unavailable-image:0:missing.png",
        },
        type: "unavailableImage",
      },
      {
        imageIndex: 0,
        part: imagePart,
        type: "image",
      },
    ]);
  });
});
