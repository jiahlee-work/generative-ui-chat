"use client";

import type { AttachmentStatus } from "@/presentation/features/chat/lib/composer/image-composer-status";
import { cn } from "@/shared/cn";

type ImageComposerStatusProps = {
  attachmentStatus: AttachmentStatus;
  attachmentStatusMessage: string | null;
};

export function ImageComposerStatus(props: ImageComposerStatusProps) {
  const { attachmentStatus, attachmentStatusMessage } = props;

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
    </>
  );
}
