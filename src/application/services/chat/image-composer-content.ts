import type { BinaryInputContent, InputContent } from "@openuidev/react-headless";
import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";

type ImageInputContentPart = BinaryInputContent & {
  attachmentId: string;
};

export function createImageInputContent(
  textContent: string,
  attachments: BrowserImageAttachment[],
) {
  const promptText =
    textContent.trim().length > 0 ? textContent.trim() : "첨부한 이미지를 설명해 주세요.";

  return [
    { type: "text", text: promptText },
    ...attachments.map((attachment) => {
      return {
        type: "binary",
        mimeType: attachment.mimeType,
        url: attachment.dataUrl,
        filename: attachment.name,
        attachmentId: attachment.id,
      } satisfies ImageInputContentPart;
    }),
  ] satisfies InputContent[];
}
