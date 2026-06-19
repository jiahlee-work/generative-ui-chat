"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { getOpenUIDisplayText } from "@/application/services/chat/openui-content";
import {
  type ImagePreviewItem,
  ImagePreviewThumbnail,
} from "@/presentation/components/atoms/image-preview-thumbnail";
import {
  getImagePartKey,
  getImagePartSource,
} from "@/presentation/components/organisms/image-user-message/utils/image-message-content";

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
            {imageParts.map((part, index) => (
              <ImagePreviewThumbnail
                alt={part.filename ?? ""}
                className="aspect-square w-[132px] max-w-full rounded-lg max-sm:w-[104px]"
                initialIndex={index}
                items={previewItems}
                key={getImagePartKey(part)}
                src={previewItems[index]?.src ?? getImagePartSource(part)}
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
