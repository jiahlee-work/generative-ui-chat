"use client";

import type {
  AttachmentStatus,
  ChatNotice,
} from "@/presentation/features/chat/lib/composer/image-composer-status";
import { cn } from "@/shared/cn";

type ImageComposerStatusProps = {
  attachmentStatus: AttachmentStatus;
  attachmentStatusMessage: string | null;
  chatNotice: ChatNotice;
  isRunning: boolean;
};

export function ImageComposerStatus(props: ImageComposerStatusProps) {
  const { attachmentStatus, attachmentStatusMessage, chatNotice, isRunning } = props;

  return (
    <>
      {attachmentStatusMessage && (
        <p
          className={cn(
            "m-0 text-[13px]",
            attachmentStatus === "failed" ? "text-[#b42318]" : "text-current/70",
          )}
          role="status"
        >
          {attachmentStatusMessage}
        </p>
      )}
      {isRunning && (
        <p className="m-0 text-[13px] text-current/70" role="status">
          응답을 생성하는 중입니다.
        </p>
      )}
      {!isRunning && chatNotice === "cancelled" && (
        <p className="m-0 text-[13px] text-current/70" role="status">
          응답 생성을 중단했습니다.
        </p>
      )}
    </>
  );
}
