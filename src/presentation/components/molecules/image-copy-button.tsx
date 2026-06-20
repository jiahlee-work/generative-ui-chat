"use client";

import type { MouseEvent } from "react";
import type { CopyActionState } from "@/application/hooks/chat/copy-action-state";
import { CopyStatusIcon } from "@/presentation/components/atoms/copy-status-icon";
import { cn } from "@/shared/cn";

type ImageCopyButtonProps = {
  copyState: CopyActionState;
  isCopying: boolean;
  onCopy: () => void;
};

export function ImageCopyButton(props: ImageCopyButtonProps) {
  const { copyState, isCopying, onCopy } = props;
  const copyStateLabelMap = {
    copied: "이미지 복사 완료",
    copying: "이미지 복사 중",
    failed: "이미지 복사 실패",
    idle: "이미지 복사",
  } satisfies Record<CopyActionState, string>;
  const label = copyStateLabelMap[copyState];

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onCopy();
  };

  return (
    <button
      aria-label={label}
      className={cn(
        "absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 bg-white/90 text-black/75 shadow-sm backdrop-blur transition hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-70",
        copyState === "failed" && "text-[#b42318] hover:text-[#b42318]",
      )}
      disabled={isCopying}
      onClick={handleClick}
      title={label}
      type="button"
    >
      <CopyStatusIcon copyState={copyState} size={15} />
    </button>
  );
}
