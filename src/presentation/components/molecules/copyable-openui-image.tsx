"use client";

import { Image as OpenUIImage, ImageBlock as OpenUIImageBlock } from "@openuidev/react-ui";
import { type SyntheticEvent, useState } from "react";
import { useImageCopyAction } from "@/application/hooks/chat/use-image-copy-action";
import {
  getCanRenderImageSource,
  normalizeRenderableImageProps,
} from "@/application/services/chat/image-source";
import { ImageCopyButton } from "@/presentation/components/molecules/image-copy-button";

type CopyableOpenUIImageProps = {
  alt?: string;
  showCopyButton?: boolean;
  src: string;
};

function ImageLoadFallback(props: { alt?: string }) {
  const { alt } = props;

  return (
    <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border border-current/10 bg-current/5 px-4 text-center text-sm text-current/60">
      {alt ? `${alt} 이미지를 불러올 수 없습니다.` : "이미지를 불러올 수 없습니다."}
    </div>
  );
}

export function CopyableOpenUIImage(props: CopyableOpenUIImageProps) {
  const { showCopyButton = true } = props;
  const { alt, src } = normalizeRenderableImageProps(props);
  const { copyState, handleCopy, isCopying } = useImageCopyAction(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const canRenderImageSource = getCanRenderImageSource(src);
  const hasImageLoadError = failedSource === src;

  const handleImageLoad = () => {
    setFailedSource(null);
  };

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.display = "none";
    setFailedSource(src);
  };

  return (
    <div className="relative">
      {!canRenderImageSource || hasImageLoadError ? (
        <ImageLoadFallback alt={alt} />
      ) : (
        <>
          <OpenUIImage alt={alt} onError={handleImageError} onLoad={handleImageLoad} src={src} />
          {showCopyButton && (
            <ImageCopyButton copyState={copyState} isCopying={isCopying} onCopy={handleCopy} />
          )}
        </>
      )}
    </div>
  );
}

export function CopyableOpenUIImageBlock(props: CopyableOpenUIImageProps) {
  const { showCopyButton = true } = props;
  const { alt, src } = normalizeRenderableImageProps(props);
  const { copyState, handleCopy, isCopying } = useImageCopyAction(src);
  const canRenderImageSource = getCanRenderImageSource(src);

  if (!canRenderImageSource) {
    return (
      <div className="relative">
        <ImageLoadFallback alt={alt} />
      </div>
    );
  }

  return (
    <div className="relative">
      <OpenUIImageBlock alt={alt} src={src} />
      {showCopyButton && (
        <ImageCopyButton copyState={copyState} isCopying={isCopying} onCopy={handleCopy} />
      )}
    </div>
  );
}
