"use client";

import { ImageOff } from "lucide-react";
import {
  type ImagePreviewItem,
  ImagePreviewThumbnail,
} from "@/presentation/components/atoms/image-preview-thumbnail";
import {
  type ChatUserMessageMediaPart,
  getUserMessageImagePartSource,
} from "@/presentation/components/organisms/chat-user-message/utils/chat-user-message-content";

type ImageMessageMediaPreviewProps = {
  part: ChatUserMessageMediaPart;
  previewItems: ImagePreviewItem[];
};

export function ImageMessageMediaPreview(props: ImageMessageMediaPreviewProps) {
  const { part, previewItems } = props;

  if (part.type === "unavailableImage") {
    return (
      <div className="flex aspect-square w-[132px] max-w-full flex-col items-center justify-center gap-1 rounded-lg border border-destructive/25 bg-destructive/10 p-3 text-center text-destructive max-sm:w-[104px]">
        <ImageOff className="shrink-0" size={20} />
        <span className="text-[12px] font-medium leading-tight">이미지를 불러올 수 없습니다</span>
        <span className="max-w-full truncate text-[11px] leading-tight opacity-75">
          {part.part.filename}
        </span>
      </div>
    );
  }

  return (
    <ImagePreviewThumbnail
      alt={part.part.filename ?? ""}
      className="aspect-square w-[132px] max-w-full rounded-lg max-sm:w-[104px]"
      initialIndex={part.imageIndex}
      items={previewItems}
      src={previewItems[part.imageIndex]?.src ?? getUserMessageImagePartSource(part.part)}
    />
  );
}
