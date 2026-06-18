"use client";

import { type AssistantMessage, useThread, useThreadList } from "@openuidev/react-headless";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { saveLocalThreadMessages } from "@/application/services/chat/chat-history";
import { createImageInputContent } from "@/application/services/chat/image-composer-content";
import {
  getClipboardImageFiles,
  maxImageCount,
  readSelectedImageAttachments,
} from "@/application/services/chat/image-composer-selection";
import { markOpenUIResponseInterrupted } from "@/application/services/chat/openui-content";
import { ImageComposerAttachments } from "@/presentation/components/molecules/image-composer-attachments";
import { ImageComposerInputRow } from "@/presentation/components/molecules/image-composer-input-row";
import { ImageComposerStatus } from "@/presentation/components/molecules/image-composer-status";
import { getHasMultilineInput } from "@/presentation/features/chat/lib/composer/image-composer-layout";
import {
  imageComposerReducer,
  initialImageComposerState,
} from "@/presentation/features/chat/lib/composer/image-composer-state";
import { getAttachmentStatusMessage } from "@/presentation/features/chat/lib/composer/image-composer-status";

type ImageComposerProps = {
  onCancel: () => void;
  isRunning: boolean;
  isLoadingMessages: boolean;
};

export function ImageComposer(props: ImageComposerProps) {
  const { onCancel, isRunning, isLoadingMessages } = props;
  const processMessage = useThread((state) => state.processMessage);
  const messages = useThread((state) => state.messages);
  const updateMessage = useThread((state) => state.updateMessage);
  const selectedThreadId = useThreadList((state) => state.selectedThreadId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [composerState, dispatch] = useReducer(imageComposerReducer, initialImageComposerState);
  const {
    textContent,
    attachments,
    attachmentStatus,
    attachmentErrorMessage,
    chatNotice,
    hasMultilineInput,
  } = composerState;
  const hasTextContent = textContent.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const isDisabled = isRunning || isLoadingMessages;
  const canSubmit = !isDisabled && (hasTextContent || hasAttachments);
  const canSelectImages = !isDisabled && attachments.length < maxImageCount;
  const attachmentStatusMessage = getAttachmentStatusMessage(
    attachmentStatus,
    attachments.length,
    attachmentErrorMessage,
  );

  const addImageFiles = async (imageFiles: File[]) => {
    if (imageFiles.length === 0) {
      return;
    }

    dispatch({ type: "imageSelectionStarted" });

    const result = await readSelectedImageAttachments(imageFiles, attachments.length);

    if (result.status === "succeeded") {
      dispatch({
        type: "imageSelectionSucceeded",
        attachments: result.attachments,
        errorMessage: result.errorMessage,
      });
      return;
    }

    dispatch({
      type: "imageSelectionFailed",
      message: result.message,
    });
  };

  const handleSelectImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    await addImageFiles(selectedFiles);
  };

  const handlePaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedImageFiles = getClipboardImageFiles(event.clipboardData.items);

    if (pastedImageFiles.length === 0) {
      return;
    }

    event.preventDefault();
    await addImageFiles(pastedImageFiles);
  };

  const handleRemoveImage = (attachmentId: string) => {
    dispatch({ type: "imageRemoved", attachmentId });
  };

  const handleChangeText = (nextTextContent: string) => {
    dispatch({
      type: "textChanged",
      textContent: nextTextContent,
    });
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    processMessage({
      role: "user",
      content: createImageInputContent(textContent, attachments),
    });

    dispatch({ type: "submitted" });
  };

  const handleCancel = () => {
    let latestAssistantMessage: AssistantMessage | null = null;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const candidateMessage = messages[index];

      if (!candidateMessage || candidateMessage.role === "user") {
        break;
      }

      if (candidateMessage.role === "assistant") {
        latestAssistantMessage = candidateMessage;
        break;
      }
    }

    onCancel();

    if (latestAssistantMessage) {
      updateMessage({
        ...latestAssistantMessage,
        content: markOpenUIResponseInterrupted(latestAssistantMessage.content ?? ""),
      });
    }

    dispatch({ type: "cancelled" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!selectedThreadId || isRunning) {
      return;
    }

    void saveLocalThreadMessages(selectedThreadId, messages).catch(() => undefined);
  }, [isRunning, messages, selectedThreadId]);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    dispatch({
      type: "inputLayoutChanged",
      hasMultilineInput: getHasMultilineInput(textarea),
    });
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  });

  return (
    <form
      className="flex flex-col gap-2 px-4 pt-3 pb-4 max-sm:p-2.5"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div
        className="flex flex-col gap-2 rounded-[14px] border border-current/15 bg-[color-mix(in_srgb,var(--background)_92%,currentColor_4%)] p-2.5"
        onClick={(event) => {
          const target = event.target;
          if (target instanceof HTMLElement && !target.closest("button, a, [role='button']")) {
            textareaRef.current?.focus();
          }
        }}
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
        chatNotice={chatNotice}
        isRunning={isRunning}
      />
    </form>
  );
}
