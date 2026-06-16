"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { getDisplayText } from "../lib/display-text";
import { getImagePartSource } from "../lib/image-message-content";
import { ImagePreviewThumbnail } from "./image-preview-thumbnail";

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
