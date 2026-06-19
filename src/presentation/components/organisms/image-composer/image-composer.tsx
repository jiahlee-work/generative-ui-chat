"use client";

import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useImageComposer } from "@/application/hooks/chat/use-image-composer";
import { ImageComposerAttachments } from "@/presentation/components/molecules/image-composer-attachments";
import { ImageComposerInputRow } from "@/presentation/components/molecules/image-composer-input-row";
import { ImageComposerStatus } from "@/presentation/components/molecules/image-composer-status";
import { getHasMultilineInput } from "@/presentation/components/organisms/image-composer/utils/image-composer-layout";
import { getAttachmentStatusMessage } from "@/presentation/components/organisms/image-composer/utils/image-composer-status-message";

type ImageComposerProps = {
  onCancel: () => void;
  isRunning: boolean;
  isLoadingMessages: boolean;
};

export function ImageComposer(props: ImageComposerProps) {
  const { onCancel, isRunning, isLoadingMessages } = props;
  const imageComposer = useImageComposer({ onCancel, isRunning, isLoadingMessages });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasMultilineInput, setHasMultilineInput] = useState(false);
  const {
    textContent,
    attachments,
    attachmentStatus,
    attachmentErrorMessage,
    hasAttachments,
    isDisabled,
    canSubmit,
    canSelectImages,
    handleSelectImages,
    handlePaste,
    handleRemoveImage,
    handleChangeText,
    handleSubmit,
    handleCancel,
  } = imageComposer;
  const attachmentStatusMessage = getAttachmentStatusMessage(
    attachmentStatus,
    attachments.length,
    attachmentErrorMessage,
  );

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    setHasMultilineInput(getHasMultilineInput(textarea));
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFormSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleComposerBoxClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (target instanceof HTMLElement && !target.closest("button, a, [role='button']")) {
      textareaRef.current?.focus();
    }
  };

  return (
    <form className="flex flex-col gap-2 px-4 pt-3 pb-4 max-sm:p-2.5" onSubmit={handleFormSubmit}>
      <div
        className="flex flex-col gap-2 rounded-[14px] border border-current/15 bg-[color-mix(in_srgb,var(--background)_92%,currentColor_4%)] p-2.5"
        onClick={handleComposerBoxClick}
      >
        {hasAttachments && (
          <ImageComposerAttachments
            attachments={attachments}
            isDisabled={isDisabled}
            onRemoveImage={handleRemoveImage}
          />
        )}
        <ImageComposerInputRow
          canSelectImages={canSelectImages}
          canSubmit={canSubmit}
          fileInputRef={fileInputRef}
          hasMultilineInput={hasMultilineInput}
          isDisabled={isDisabled}
          isRunning={isRunning}
          onCancel={handleCancel}
          onChangeText={handleChangeText}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onSelectImages={handleSelectImages}
          onSubmit={handleSubmit}
          textContent={textContent}
          textareaRef={textareaRef}
        />
      </div>
      <ImageComposerStatus
        attachmentStatus={attachmentStatus}
        attachmentStatusMessage={attachmentStatusMessage}
      />
    </form>
  );
}
