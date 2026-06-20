import { describe, expect, it } from "vitest";
import {
  getCanRenderImageSource,
  normalizeRenderableImageProps,
} from "@/application/services/chat/image-source";

describe("이미지 소스 렌더링 가능 여부", () => {
  it("http, https, data image, blob 이미지 소스를 허용한다", () => {
    expect(getCanRenderImageSource("https://example.com/image.png")).toBe(true);
    expect(getCanRenderImageSource("http://example.com/image.png")).toBe(true);
    expect(getCanRenderImageSource("data:image/png;base64,abc")).toBe(true);
    expect(getCanRenderImageSource("blob:http://localhost:3000/image-id")).toBe(true);
  });

  it("일반 텍스트와 상대 경로는 이미지 요청으로 렌더링하지 않는다", () => {
    expect(getCanRenderImageSource("A cute dog")).toBe(false);
    expect(getCanRenderImageSource("image.png")).toBe(false);
    expect(getCanRenderImageSource("/image.png")).toBe(false);
  });

  it("빈 값과 이미지가 아닌 프로토콜은 거부한다", () => {
    expect(getCanRenderImageSource("")).toBe(false);
    expect(getCanRenderImageSource(null)).toBe(false);
    expect(getCanRenderImageSource(undefined)).toBe(false);
    expect(getCanRenderImageSource("javascript:alert(1)")).toBe(false);
  });

  it("모델이 Image(src, alt) 순서로 잘못 보낸 이미지 인자를 보정한다", () => {
    const dataImage = "data:image/svg+xml,%3Csvg%3E%3C/svg%3E";

    expect(normalizeRenderableImageProps({ alt: dataImage, src: "OpenUI" })).toEqual({
      alt: "OpenUI",
      src: dataImage,
    });
  });

  it("이미 올바른 이미지 인자 순서는 그대로 유지한다", () => {
    expect(
      normalizeRenderableImageProps({
        alt: "OpenUI",
        src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
      }),
    ).toEqual({
      alt: "OpenUI",
      src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
    });
  });
});
