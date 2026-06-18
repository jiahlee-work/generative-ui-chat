"use client";

import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ImagePreviewDialog,
  type ImagePreviewItem,
} from "@/presentation/components/atoms/image-preview-dialog";
import { cn } from "@/shared/cn";

export type { ImagePreviewItem };

type ImagePreviewThumbnailProps = {
  alt: string;
  src: string;
  className: string;
  initialIndex?: number;
  items?: ImagePreviewItem[];
};

export function ImagePreviewThumbnail(props: ImagePreviewThumbnailProps) {
  const { alt, src, className, initialIndex = 0, items } = props;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const previewItems = items && items.length > 0 ? items : [{ alt, src }];
  const currentItem = previewItems[currentIndex] ?? previewItems[0];

  const getAdjacentIndex = (direction: "next" | "previous") => {
    if (previewItems.length <= 0) {
      return 0;
    }

    if (direction === "previous") {
      return (currentIndex - 1 + previewItems.length) % previewItems.length;
    }

    return (currentIndex + 1) % previewItems.length;
  };

  const openPreview = () => {
    setCurrentIndex(initialIndex);
    setIsPreviewOpen(true);
  };

  const showPreviousImage = () => {
    setCurrentIndex(getAdjacentIndex("previous"));
  };

  const showNextImage = () => {
    setCurrentIndex(getAdjacentIndex("next"));
  };

  return (
    <>
      <button
        aria-label={alt ? `${alt} 미리보기` : "이미지 미리보기"}
        className={cn(
          className,
          "relative block cursor-zoom-in overflow-hidden border-0 bg-transparent p-0",
        )}
        onClick={openPreview}
        type="button"
      >
        <Image
          alt={alt}
          className="block h-full w-full object-cover"
          fill
          sizes="132px"
          src={src}
          unoptimized
        />
      </button>
      {isPreviewOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <ImagePreviewDialog
            currentIndex={currentIndex}
            currentItem={currentItem}
            itemCount={previewItems.length}
            onClose={() => setIsPreviewOpen(false)}
            onShowNextImage={showNextImage}
            onShowPreviousImage={showPreviousImage}
          />,
          document.body,
        )}
    </>
  );
}
