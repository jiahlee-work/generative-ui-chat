"use client";

import { ArrowUp, ImagePlus, Square } from "lucide-react";
import { type ChangeEvent, type ClipboardEvent, type KeyboardEvent, type RefObject } from "react";
import { cn } from "@/shared/cn";

type ImageComposerInputRowProps = {
  canSelectImages: boolean;
  canSubmit: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  hasMultilineInput: boolean;
  isDisabled: boolean;
  isRunning: boolean;
  onCancel: () => void;
  onChangeText: (textContent: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onSelectImages: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  textContent: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
};

export function ImageComposerInputRow(props: ImageComposerInputRowProps) {
  const {
    canSelectImages,
    canSubmit,
    fileInputRef,
    hasMultilineInput,
    isDisabled,
    isRunning,
    onCancel,
    onChangeText,
    onKeyDown,
    onPaste,
    onSelectImages,
    onSubmit,
    textContent,
    textareaRef,
  } = props;

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChangeText(event.target.value);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2",
        hasMultilineInput && "grid-rows-[auto_auto]",
      )}
    >
      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isDisabled}
        hidden
        multiple
        onChange={onSelectImages}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />
      <button
        aria-label="이미지 첨부"
        className={cn(
          "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-current/15 bg-transparent text-inherit disabled:cursor-not-allowed disabled:opacity-45",
          hasMultilineInput && "row-start-2 col-start-1",
        )}
        disabled={!canSelectImages}
        onClick={() => fileInputRef.current?.click()}
        title="이미지 첨부"
        type="button"
      >
        <ImagePlus size={18} />
      </button>
      <textarea
        className={cn(
          "max-h-40 min-h-7 resize-none overflow-y-auto border-0 bg-transparent font-[inherit] leading-normal text-inherit outline-0 placeholder:text-current/50",
          hasMultilineInput && "col-span-full row-start-1",
        )}
        disabled={isDisabled}
        onChange={handleTextChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder="메시지를 입력하세요..."
        ref={textareaRef}
        rows={1}
        value={textContent}
      />
      <button
        aria-label={isRunning ? "응답 중단" : "메시지 전송"}
        className={cn(
          "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-teal-700 bg-teal-700 text-white disabled:cursor-not-allowed disabled:opacity-45",
          hasMultilineInput && "row-start-2 col-start-3",
        )}
        disabled={!canSubmit && !isRunning}
        onClick={isRunning ? onCancel : onSubmit}
        title={isRunning ? "응답 중단" : "메시지 전송"}
        type="button"
      >
        {isRunning ? <Square fill="currentColor" size={14} /> : <ArrowUp size={18} />}
      </button>
    </div>
  );
}
