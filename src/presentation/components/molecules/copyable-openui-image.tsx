"use client";

import { Image as OpenUIImage, ImageBlock as OpenUIImageBlock } from "@openuidev/react-ui";
import { useImageCopyAction } from "@/application/hooks/chat/use-image-copy-action";
import { ImageCopyButton } from "@/presentation/components/molecules/image-copy-button";

type CopyableOpenUIImageProps = {
  alt?: string;
  src: string;
};

export function CopyableOpenUIImage(props: CopyableOpenUIImageProps) {
  const { alt, src } = props;
  const { copyState, handleCopy, isCopying } = useImageCopyAction(src);

  return (
    <div className="relative">
      <OpenUIImage alt={alt} src={src} />
      <ImageCopyButton copyState={copyState} isCopying={isCopying} onCopy={handleCopy} />
    </div>
  );
}

export function CopyableOpenUIImageBlock(props: CopyableOpenUIImageProps) {
  const { alt, src } = props;
  const { copyState, handleCopy, isCopying } = useImageCopyAction(src);

  return (
    <div className="relative">
      <OpenUIImageBlock alt={alt} src={src} />
      <ImageCopyButton copyState={copyState} isCopying={isCopying} onCopy={handleCopy} />
    </div>
  );
}
