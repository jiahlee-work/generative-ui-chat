"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/cn";

type ImagePreviewThumbnailProps = {
  alt: string;
  src: string;
  className: string;
};

export function ImagePreviewThumbnail(props: ImagePreviewThumbnailProps) {
  const { alt, src, className } = props;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewDialog = (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 p-6"
      onClick={() => setIsPreviewOpen(false)}
      role="dialog"
    >
      <button
        aria-label="이미지 미리보기 닫기"
        className="fixed top-5 right-5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/70 text-white"
        onClick={() => setIsPreviewOpen(false)}
        type="button"
      >
        <X size={20} />
      </button>
      <div
        className="relative h-[min(calc(100vh-48px),760px)] w-[min(100%,1040px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          alt={alt}
          className="rounded-xl object-contain"
          fill
          sizes="100vw"
          src={src}
          unoptimized
        />
      </div>
    </div>
  );

  return (
    <>
      <button
        aria-label={alt ? `${alt} 미리보기` : "이미지 미리보기"}
        className={cn(
          className,
          "relative block cursor-zoom-in overflow-hidden border-0 bg-transparent p-0",
        )}
        onClick={() => setIsPreviewOpen(true)}
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
        createPortal(previewDialog, document.body)}
    </>
  );
}
