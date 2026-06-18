"use client";

import { Info, RotateCcw } from "lucide-react";

type AssistantResponseNoticeTone = "neutral" | "error";

type AssistantResponseNoticeProps = {
  message: string;
  onRetry?: () => void;
  retryBlockedMessage?: string | null;
  tone?: AssistantResponseNoticeTone;
};

export function AssistantResponseNotice(props: AssistantResponseNoticeProps) {
  const { message, onRetry, retryBlockedMessage, tone = "neutral" } = props;
  const isError = tone === "error";

  return (
    <div
      className={
        isError
          ? "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#b42318]/25 bg-[#fef3f2] px-3.5 py-3 text-[#7a271a]"
          : "flex flex-wrap items-center justify-between gap-2 rounded-lg border border-current/15 bg-[color-mix(in_srgb,var(--background)_94%,currentColor_3%)] px-3.5 py-3 text-current/80"
      }
      role={isError ? "alert" : "status"}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Info className="shrink-0" size={16} />
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium leading-normal">{message}</p>
          {retryBlockedMessage && (
            <p className="m-0 mt-1 text-sm leading-normal opacity-80">{retryBlockedMessage}</p>
          )}
        </div>
      </div>
      {onRetry && (
        <button
          className={
            isError
              ? "inline-flex h-8 items-center gap-1.5 rounded-md border border-[#b42318]/30 bg-white/70 px-2.5 text-sm font-medium text-[#7a271a] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b42318]"
              : "inline-flex h-8 items-center gap-1.5 rounded-md border border-current/15 bg-[color-mix(in_srgb,var(--background)_96%,currentColor_2%)] px-2.5 text-sm font-medium text-current/80 transition hover:bg-current/5 hover:text-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          }
          onClick={onRetry}
          type="button"
        >
          <RotateCcw size={14} />
          재시도
        </button>
      )}
    </div>
  );
}
