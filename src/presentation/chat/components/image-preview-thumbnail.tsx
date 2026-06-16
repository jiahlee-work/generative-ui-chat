"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

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
      className="image-preview-dialog"
      onClick={() => setIsPreviewOpen(false)}
      role="dialog"
    >
      <button
        aria-label="Close image preview"
        className="image-preview-dialog__close"
        onClick={() => setIsPreviewOpen(false)}
        type="button"
      >
        <X size={20} />
      </button>
      {/* User-provided image data can be local data/blob URLs from IndexedDB. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="image-preview-dialog__image"
        onClick={(event) => event.stopPropagation()}
        src={src}
      />
    </div>
  );

  return (
    <>
      <button
        aria-label={alt ? `Preview ${alt}` : "Preview image"}
        className={`${className} image-preview-thumbnail`}
        onClick={() => setIsPreviewOpen(true)}
        type="button"
      >
        {/* User-provided image data can be local data/blob URLs from IndexedDB. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={alt} className="image-preview-thumbnail__image" src={src} />
      </button>
      {isPreviewOpen &&
        typeof document !== "undefined" &&
        createPortal(previewDialog, document.body)}
    </>
  );
}
