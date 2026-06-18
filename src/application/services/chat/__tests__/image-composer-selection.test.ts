import { describe, expect, it } from "vitest";
import { getClipboardImageFiles } from "@/application/services/chat/image-composer-selection";

describe("image composer selection", () => {
  it("returns image files from clipboard items", () => {
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

  it("ignores clipboard image items that do not expose a file", () => {
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
