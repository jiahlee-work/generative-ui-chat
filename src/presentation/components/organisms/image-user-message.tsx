"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { ImagePreviewThumbnail } from "@/presentation/components/atoms/image-preview-thumbnail";
import {
  getImagePartKey,
  getImagePartSource,
} from "@/presentation/features/chat/lib/image/image-message-content";
import { getDisplayText } from "@/presentation/features/chat/lib/message/display-text";

type ImageUserMessageProps = {
  message: UserMessage;
};

export function ImageUserMessage(props: ImageUserMessageProps) {
  const { message } = props;
  const { content } = message;
  const hasTextOnlyContent = typeof content === "string";
  const textParts = hasTextOnlyContent ? [] : content.filter((part) => part.type === "text");
  const imageParts = hasTextOnlyContent ? [] : content.filter((part) => part.type === "binary");
  const hasImageParts = imageParts.length > 0;
  const hasTextParts = textParts.length > 0;
  const messageText = hasTextOnlyContent
    ? getDisplayText(content)
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
            {imageParts.map((part) => (
              <ImagePreviewThumbnail
                alt={part.filename ?? ""}
                className="aspect-square w-[132px] max-w-full rounded-lg max-sm:w-[104px]"
                key={getImagePartKey(part)}
                src={getImagePartSource(part)}
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
