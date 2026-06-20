"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CopyActionState } from "@/application/hooks/chat/copy-action-state";
import { CopyStatusIcon } from "@/presentation/components/atoms/copy-status-icon";
import { cn } from "@/shared/cn";

type MessageActionsAlign = "start" | "end";

type ChatMessageActionsProps = {
  align?: MessageActionsAlign;
  copyFailedMessage?: string;
  copyLabel?: string;
  onCopy?: () => boolean | Promise<boolean>;
  onRetry?: () => void;
  retryBlockedMessage?: string | null;
};

function getCopyButtonLabel(copyLabel: string, copyState: CopyActionState) {
  if (copyState === "copied") {
    return `${copyLabel} 복사 완료`;
  }

  if (copyState === "copying") {
    return `${copyLabel} 복사 중`;
  }

  if (copyState === "failed") {
    return `${copyLabel} 복사 실패`;
  }

  return `${copyLabel} 복사`;
}

function getCopyButtonTitle(copyLabel: string, copyState: CopyActionState) {
  if (copyState === "copied") {
    return "복사 완료";
  }

  if (copyState === "failed") {
    return "복사 실패";
  }

  return `${copyLabel} 복사`;
}

export function ChatMessageActions(props: ChatMessageActionsProps) {
  const {
    align = "start",
    copyFailedMessage = "복사를 실패했습니다.",
    copyLabel = "응답",
    onCopy,
    onRetry,
    retryBlockedMessage,
  } = props;
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyState, setCopyState] = useState<CopyActionState>("idle");
  const hasAction = Boolean(onCopy || onRetry || retryBlockedMessage);
  const isCopying = copyState === "copying";
  const hasCopyFailed = copyState === "failed";
  const copyButtonLabel = getCopyButtonLabel(copyLabel, copyState);
  const copyButtonTitle = getCopyButtonTitle(copyLabel, copyState);
  const containerClassName = cn(
    "mt-2 flex flex-wrap items-center gap-2 text-current/70",
    align === "end" && "justify-end",
  );
  const wrapperClassName = cn("mt-2", align === "end" && "text-right");

  const resetCopyStateLater = useCallback((delay: number) => {
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setCopyState("idle");
      copyResetTimeoutRef.current = null;
    }, delay);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!onCopy || isCopying) {
      return;
    }

    setCopyState("copying");

    const didCopy = await onCopy();

    if (!didCopy) {
      setCopyState("failed");
      resetCopyStateLater(1500);
      return;
    }

    setCopyState("copied");
    resetCopyStateLater(800);
  }, [isCopying, onCopy, resetCopyStateLater]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  if (!hasAction) {
    return null;
  }

  return (
    <div className={wrapperClassName}>
      <div className={containerClassName}>
        {onCopy && (
          <button
            aria-label={copyButtonLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-current/70 transition hover:bg-current/5 hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:pointer-events-none disabled:opacity-60"
            disabled={isCopying}
            onClick={handleCopy}
            title={copyButtonTitle}
            type="button"
          >
            <CopyStatusIcon copyState={copyState} />
          </button>
        )}
        {onRetry && (
          <button
            aria-label="마지막 질문으로 재시도"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-current/70 transition hover:bg-current/5 hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            onClick={onRetry}
            title="마지막 질문으로 재시도"
            type="button"
          >
            <RotateCcw size={16} />
          </button>
        )}
        {retryBlockedMessage && <p className="m-0 text-[13px]">{retryBlockedMessage}</p>}
      </div>
      {hasCopyFailed && (
        <p className="m-0 mt-1 text-[12px] leading-normal text-[#b42318]" role="alert">
          {copyFailedMessage}
        </p>
      )}
    </div>
  );
}
