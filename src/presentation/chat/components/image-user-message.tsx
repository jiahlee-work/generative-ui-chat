"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { ImagePreviewThumbnail } from "@/presentation/chat/components/image-preview-thumbnail";
import { getImagePartSource } from "@/presentation/chat/lib/image/image-message-content";
import { getDisplayText } from "@/presentation/chat/lib/message/display-text";

type ImageUserMessageProps = {
  message: UserMessage;
};

export function ImageUserMessage(props: ImageUserMessageProps) {
  const { message } = props;
  const { content } = message;
  const hasTextOnlyContent = typeof content === "string";
  const textParts = hasTextOnlyContent
    ? []
    : content.filter((part) => part.type === "text");
  const imageParts = hasTextOnlyContent
    ? []
    : content.filter((part) => part.type === "binary");
  const hasImageParts = imageParts.length > 0;
  const hasTextParts = textParts.length > 0;
  const messageText = hasTextOnlyContent
    ? getDisplayText(content)
    : textParts.map((part) => part.text).join("\n");

  if (hasTextOnlyContent) {
    return (
      <div className="openui-shell-thread-message-user">
        <div className="openui-shell-thread-message-user__content">
          {messageText}
        </div>
      </div>
    );
  }

  return (
    <div className="openui-shell-thread-message-user">
      <div className="image-user-message">
        {hasImageParts && (
          <div className="image-user-message__images">
            {imageParts.map((part, index) => (
              <ImagePreviewThumbnail
                alt={part.filename ?? ""}
                className="image-user-message__image"
                key={`${part.filename ?? "image"}-${index}`}
                src={getImagePartSource(part)}
              />
            ))}
          </div>
        )}
        {hasTextParts && (
          <div className="openui-shell-thread-message-user__content">
            {messageText}
          </div>
        )}
      </div>
    </div>
  );
}
