"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

export type ImagePreviewItem = {
  alt: string;
  src: string;
};

type ImagePreviewDialogProps = {
  currentIndex: number;
  currentItem: ImagePreviewItem;
  itemCount: number;
  onClose: () => void;
  onShowNextImage: () => void;
  onShowPreviousImage: () => void;
};

export function ImagePreviewDialog(props: ImagePreviewDialogProps) {
  const { currentIndex, currentItem, itemCount, onClose, onShowNextImage, onShowPreviousImage } =
    props;
  const canNavigate = itemCount > 1;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-image-preview-dialog flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
    >
      <button
        aria-label="이미지 미리보기 닫기"
        className="fixed top-5 right-5 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-black/70 text-white"
        onClick={onClose}
        type="button"
      >
        <X size={20} />
      </button>
      {canNavigate && (
        <button
          aria-label="이전 이미지 보기"
          className="fixed left-5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-black/70 text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={(event) => {
            event.stopPropagation();
            onShowPreviousImage();
          }}
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div
        className="relative h-[min(calc(100vh-48px),760px)] w-[min(100%,1040px)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          alt={currentItem.alt}
          className="rounded-xl object-contain"
          fill
          sizes="100vw"
          src={currentItem.src}
          unoptimized
        />
      </div>
      {canNavigate && (
        <>
          <div className="fixed bottom-6 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
            {currentIndex + 1} / {itemCount}
          </div>
          <button
            aria-label="다음 이미지 보기"
            className="fixed right-5 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-black/70 text-white disabled:cursor-not-allowed disabled:opacity-40"
            onClick={(event) => {
              event.stopPropagation();
              onShowNextImage();
            }}
            type="button"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
