import { describe, expect, it } from "vitest";
import { getClipboardImageFiles } from "@/application/services/chat/image-composer-selection";

describe("이미지 첨부 선택", () => {
  it("클립보드 항목에서 이미지 파일만 반환한다", () => {
    const pngFile = new File(["image"], "image.png", { type: "image/png" });
    const webpFile = new File(["image"], "image.webp", { type: "image/webp" });

    expect(
      getClipboardImageFiles([
        createClipboardFileItem("image/png", pngFile),
        createClipboardFileItem("text/plain", new File(["text"], "text.txt")),
        createClipboardFileItem("image/webp", webpFile),
        createClipboardTextItem(),
      ] as unknown as DataTransferItemList),
    ).toEqual([pngFile, webpFile]);
  });

  it("파일을 제공하지 않는 클립보드 이미지 항목은 무시한다", () => {
    expect(
      getClipboardImageFiles([
        createClipboardFileItem("image/png", null),
      ] as unknown as DataTransferItemList),
    ).toEqual([]);
  });
});

function createClipboardFileItem(type: string, file: File | null): DataTransferItem {
  return {
    kind: "file",
    type,
    getAsFile: () => file,
  } as DataTransferItem;
}

function createClipboardTextItem(): DataTransferItem {
  return {
    kind: "string",
    type: "text/plain",
    getAsFile: () => null,
  } as DataTransferItem;
}
