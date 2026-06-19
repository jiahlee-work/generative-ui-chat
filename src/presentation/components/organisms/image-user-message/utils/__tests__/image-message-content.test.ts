import { describe, expect, it } from "vitest";
import {
  getImagePartKey,
  getImagePartSource,
} from "@/presentation/components/organisms/image-user-message/utils/image-message-content";

describe("이미지 메시지 콘텐츠 도우미", () => {
  it("이미지 조각 URL이 있으면 이미지 출처로 사용한다", () => {
    expect(
      getImagePartSource({
        type: "binary",
        mimeType: "image/png",
        url: "blob:http://localhost/image",
      }),
    ).toBe("blob:http://localhost/image");
  });

  it("base64 이미지 데이터에서 데이터 URL을 만든다", () => {
    expect(
      getImagePartSource({
        type: "binary",
        mimeType: "image/png",
        data: "abc",
      }),
    ).toBe("data:image/png;base64,abc");
  });

  it("안정적인 이미지 키로 첨부 ID를 우선 사용한다", () => {
    expect(
      getImagePartKey({
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
      getImagePartKey({
        type: "binary",
        mimeType: "image/webp",
        filename: "image.webp",
        url: "blob:http://localhost/image",
      }),
    ).toBe("blob:http://localhost/image");

    expect(
      getImagePartKey({
        type: "binary",
        mimeType: "image/jpeg",
        filename: "image.jpg",
        data: "abc",
      }),
    ).toBe("image/jpeg:image.jpg:abc");
  });
});
