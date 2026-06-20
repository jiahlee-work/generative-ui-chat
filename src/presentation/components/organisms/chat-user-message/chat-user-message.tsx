"use client";

import type { UserMessage } from "@openuidev/react-headless";
import { useUserCopyAction } from "@/application/hooks/chat/use-user-copy-action";
import { getOpenUIDisplayText } from "@/application/services/chat/openui-content";
import type { ImagePreviewItem } from "@/presentation/components/atoms/image-preview-thumbnail";
import { ChatMessageActions } from "@/presentation/components/molecules/chat-message-actions";
import { getChatUserMessageMediaPartKey } from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-media-part-key";
import { ImageMessageMediaPreview } from "@/presentation/components/organisms/image-message-media-preview/image-message-media-preview";
import {
  getChatUserMessageContentParts,
  getUserMessageImagePartSource,
} from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-content";

type ChatUserMessageProps = {
  message: UserMessage;
};

export function ChatUserMessage(props: ChatUserMessageProps) {
  const { message } = props;
  const { content } = message;
  const { copyText, handleCopy } = useUserCopyAction(message);
  const hasTextOnlyContent = typeof content === "string";
  const { imageParts, mediaParts, textParts } = hasTextOnlyContent
    ? { imageParts: [], mediaParts: [], textParts: [] }
    : getChatUserMessageContentParts(content);
  const hasImageParts = mediaParts.length > 0;
  const hasTextParts = textParts.length > 0;
  const previewItems: ImagePreviewItem[] = imageParts.map((part) => {
    return {
      alt: part.filename ?? "",
      src: getUserMessageImagePartSource(part),
    };
  });
  const messageText = hasTextOnlyContent
    ? getOpenUIDisplayText(content)
    : textParts.map((part) => part.text).join("\n");

  if (hasTextOnlyContent) {
    return (
      <div className="openui-shell-thread-message-user">
        <div className="flex flex-col items-end">
          <div className="openui-shell-thread-message-user__content">{messageText}</div>
          <ChatMessageActions
            align="end"
            copyLabel="사용자 메시지"
            onCopy={copyText ? handleCopy : undefined}
          />
        </div>
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
                key={getChatUserMessageMediaPartKey(part)}
                part={part}
                previewItems={previewItems}
              />
            ))}
          </div>
        )}
        {hasTextParts && (
          <div className="openui-shell-thread-message-user__content">{messageText}</div>
        )}
        <ChatMessageActions
          align="end"
          copyLabel="사용자 메시지"
          onCopy={copyText ? handleCopy : undefined}
        />
      </div>
    </div>
  );
}
