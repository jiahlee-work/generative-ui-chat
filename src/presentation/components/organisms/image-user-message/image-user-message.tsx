"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { getOpenUIDisplayText } from "@/application/services/chat/openui-content";
import type { ImagePreviewItem } from "@/presentation/components/atoms/image-preview-thumbnail";
import { ImageMessageMediaPreview } from "@/presentation/components/organisms/image-message-media-preview/image-message-media-preview";
import { getImageMessageMediaPartKey } from "@/presentation/components/organisms/image-message-media-preview/utils/image-message-media-part-key";
import {
  getImageMessageContentParts,
  getImagePartSource,
} from "@/presentation/components/organisms/image-user-message/utils/image-message-content";

type ImageUserMessageProps = {
  message: UserMessage;
};

export function ImageUserMessage(props: ImageUserMessageProps) {
  const { message } = props;
  const { content } = message;
  const hasTextOnlyContent = typeof content === "string";
  const { imageParts, mediaParts, textParts } = hasTextOnlyContent
    ? { imageParts: [], mediaParts: [], textParts: [] }
    : getImageMessageContentParts(content);
  const hasImageParts = mediaParts.length > 0;
  const hasTextParts = textParts.length > 0;
  const previewItems: ImagePreviewItem[] = imageParts.map((part) => {
    return {
      alt: part.filename ?? "",
      src: getImagePartSource(part),
    };
  });
  const messageText = hasTextOnlyContent
    ? getOpenUIDisplayText(content)
    : textParts.map((part) => part.text).join("\n");

  if (hasTextOnlyContent) {
    return (
      <div className="openui-shell-thread-message-user">
        <div className="openui-shell-thread-message-user__content">{messageText}</div>
      </div>
    );
  }

  return (
    <div className="openui-shell-thread-message-user">
      <div className="flex flex-col items-end gap-2">
        {hasImageParts && (
          <div className="flex max-w-[min(420px,100%)] flex-wrap justify-end gap-2">
            {mediaParts.map((part) => (
              <ImageMessageMediaPreview
                key={getImageMessageMediaPartKey(part)}
                part={part}
                previewItems={previewItems}
              />
            ))}
          </div>
        )}
        {hasTextParts && (
          <div className="openui-shell-thread-message-user__content">{messageText}</div>
        )}
      </div>
    </div>
  );
}
