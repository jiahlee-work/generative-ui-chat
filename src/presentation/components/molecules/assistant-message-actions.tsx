"use client";

import {Check, Copy, RotateCcw} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";

type AssistantMessageActionsProps = {
  onCopy?: () => boolean | Promise<boolean>;
  onRetry?: () => void;
  retryBlockedMessage?: string | null;
};

export function AssistantMessageActions(props: AssistantMessageActionsProps) {
  const { onCopy, onRetry, retryBlockedMessage } = props;

  const [hasCopied, setHasCopied] = useState(false);
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasAction = Boolean(onCopy || onRetry || retryBlockedMessage);

  const handleCopy = useCallback(async () => {
    if (!onCopy) {
      return;
    }

    const didCopy = await onCopy();

    if (!didCopy) {
      return;
    }

    setHasCopied(true);

    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }

    copyResetTimeoutRef.current = setTimeout(() => {
      setHasCopied(false);
      copyResetTimeoutRef.current = null;
    }, 800);
  }, [onCopy]);

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
    <div className="mt-2 flex flex-wrap items-center gap-2 text-current/70">
      {onCopy && (
        <button
          aria-label={hasCopied ? "응답 복사 완료" : "응답 복사"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-current/70 transition hover:bg-current/5 hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          onClick={handleCopy}
          title={hasCopied ? "복사 완료" : "응답 복사"}
          type="button"
        >
          {hasCopied ? <Check size={16} /> : <Copy size={16} />}
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
  );
}
