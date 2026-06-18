import { describe, expect, it } from "vitest";
import {
  getImagePartKey,
  getImagePartSource,
} from "@/presentation/features/chat/lib/image/image-message-content";

describe("image message content helpers", () => {
  it("uses the part URL as the image source when it exists", () => {
    expect(
      getImagePartSource({
        type: "binary",
        mimeType: "image/png",
        url: "blob:http://localhost/image",
      }),
    ).toBe("blob:http://localhost/image");
  });

  it("builds a data URL from base64 image data", () => {
    expect(
      getImagePartSource({
        type: "binary",
        mimeType: "image/png",
        data: "abc",
      }),
    ).toBe("data:image/png;base64,abc");
  });

  it("prefers attachment IDs for stable image keys", () => {
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

  it("falls back to URL or image content for image keys", () => {
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
