"use client";

import { X } from "lucide-react";
import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";
import { ImagePreviewThumbnail } from "@/presentation/components/atoms/image-preview-thumbnail";

type ImageComposerAttachmentsProps = {
  attachments: BrowserImageAttachment[];
  isDisabled: boolean;
  onRemoveImage: (attachmentId: string) => void;
};

export function ImageComposerAttachments(props: ImageComposerAttachmentsProps) {
  const { attachments, isDisabled, onRemoveImage } = props;

  return (
    <div className="flex w-full flex-wrap gap-2">
      {attachments.map((attachment) => (
        <div
          className="relative h-[104px] w-[104px] max-sm:h-[88px] max-sm:w-[88px]"
          key={attachment.id}
        >
          <ImagePreviewThumbnail
            alt={attachment.name}
            className="h-full w-full rounded-xl"
            src={attachment.dataUrl}
          />
          <button
            aria-label={`${attachment.name} 제거`}
            className="absolute top-1.5 right-1.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-black/75 text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isDisabled}
            onClick={() => onRemoveImage(attachment.id)}
            title="이미지 제거"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
