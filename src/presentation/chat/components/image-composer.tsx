"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import {
  type BinaryInputContent,
  type InputContent,
  useThread,
  useThreadList,
} from "@openuidev/react-headless";
import { ArrowUp, ImagePlus, Square, X } from "lucide-react";
import { saveLocalThreadMessages } from "@/application/chat/chat-history";
import {
  allowedImageTypes,
  maxImageCount,
  maxImageSize,
  readImageFile,
} from "@/infrastructure/browser/image-files";
import {
  getAttachmentStatusMessage,
  getChatErrorMessage,
} from "@/presentation/chat/lib/composer/image-composer-status";
import {
  imageComposerReducer,
  initialImageComposerState,
} from "@/presentation/chat/lib/composer/image-composer-state";
import { ImagePreviewThumbnail } from "@/presentation/chat/components/image-preview-thumbnail";
import { getHasMultilineInput } from "@/presentation/chat/lib/composer/image-composer-layout";

type ImageComposerProps = {
  onSend: (message: string) => void;
  onCancel: () => void;
  isRunning: boolean;
  isLoadingMessages: boolean;
};

export function ImageComposer(props: ImageComposerProps) {
  const { onCancel, isRunning, isLoadingMessages } = props;
  const processMessage = useThread((state) => state.processMessage);
  const messages = useThread((state) => state.messages);
  const threadError = useThread((state) => state.threadError);
  const selectedThreadId = useThreadList((state) => state.selectedThreadId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [composerState, dispatch] = useReducer(
    imageComposerReducer,
    initialImageComposerState,
  );
  const {
    textContent,
    attachments,
    attachmentStatus,
    attachmentErrorMessage,
    chatNotice,
    hasMultilineInput,
  } = composerState;
  const inputRowClassName = hasMultilineInput
    ? "image-composer__input-row image-composer__input-row--multiline"
    : "image-composer__input-row";
  const hasTextContent = textContent.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const isDisabled = isRunning || isLoadingMessages;
  const canSubmit = !isDisabled && (hasTextContent || hasAttachments);
  const chatErrorMessage = threadError ? getChatErrorMessage(threadError) : null;
  const attachmentStatusMessage = getAttachmentStatusMessage(
    attachmentStatus,
    attachments.length,
    attachmentErrorMessage,
  );

  useEffect(() => {
    if (!selectedThreadId || isRunning) {
      return;
    }

    void saveLocalThreadMessages(selectedThreadId, messages).catch((error) => {
      console.error(error);
    });
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
  }, [hasMultilineInput, textContent]);

  const handleSelectImages = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    dispatch({ type: "imageSelectionStarted" });

    const availableSlots = maxImageCount - attachments.length;
    const filesWithinLimit = selectedFiles.slice(0, Math.max(availableSlots, 0));
    const invalidFiles = filesWithinLimit.filter(
      (file) => !allowedImageTypes.has(file.type),
    );
    const oversizedFiles = filesWithinLimit.filter(
      (file) => file.size > maxImageSize,
    );
    const validFiles = filesWithinLimit.filter((file) => {
      return allowedImageTypes.has(file.type) && file.size <= maxImageSize;
    });
    const hasSelectionError =
      selectedFiles.length > availableSlots ||
      invalidFiles.length > 0 ||
      oversizedFiles.length > 0;

    if (availableSlots <= 0) {
      dispatch({
        type: "imageSelectionFailed",
        message: `You can attach up to ${maxImageCount} images.`,
      });
      return;
    }

    let selectionErrorMessage: string | null = null;

    if (selectedFiles.length > availableSlots) {
      selectionErrorMessage = `Only ${maxImageCount} images can be attached.`;
    } else if (invalidFiles.length > 0) {
      selectionErrorMessage = "Use JPG, PNG, or WebP images.";
    } else if (oversizedFiles.length > 0) {
      selectionErrorMessage = "Each image must be 4 MB or smaller.";
    }

    if (validFiles.length === 0) {
      dispatch({
        type: "imageSelectionFailed",
        message: selectionErrorMessage ?? "Image upload failed.",
      });
      return;
    }

    try {
      const nextAttachments = await Promise.all(validFiles.map(readImageFile));
      dispatch({
        type: "imageSelectionSucceeded",
        attachments: nextAttachments,
        errorMessage: hasSelectionError ? selectionErrorMessage : null,
      });
    } catch {
      dispatch({
        type: "imageSelectionFailed",
        message: "Failed to read one of the selected images.",
      });
    }
  };

  const handleRemoveImage = (attachmentId: string) => {
    dispatch({ type: "imageRemoved", attachmentId });
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const promptText = hasTextContent
      ? textContent.trim()
      : "Describe the attached image.";
    const content: InputContent[] = [
      { type: "text", text: promptText },
      ...attachments.map((attachment) => {
        return {
          type: "binary",
          mimeType: attachment.mimeType,
          url: attachment.dataUrl,
          filename: attachment.name,
        } satisfies BinaryInputContent;
      }),
    ];

    processMessage({
      role: "user",
      content,
    });

    dispatch({ type: "submitted" });
  };

  const handleCancel = () => {
    onCancel();
    dispatch({ type: "cancelled" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      className="image-composer"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div
        className="image-composer__input-wrapper"
        onClick={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLElement &&
            !target.closest("button, a, [role='button']")
          ) {
            textareaRef.current?.focus();
          }
        }}
      >
        {hasAttachments && (
          <div className="image-composer__attachments">
            {attachments.map((attachment) => (
              <div className="image-composer__attachment" key={attachment.id}>
                <ImagePreviewThumbnail
                  alt={attachment.name}
                  className="image-composer__attachment-preview"
                  src={attachment.dataUrl}
                />
                <button
                  aria-label={`Remove ${attachment.name}`}
                  className="image-composer__attachment-remove"
                  disabled={isDisabled}
                  onClick={() => handleRemoveImage(attachment.id)}
                  title="Remove image"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className={inputRowClassName}>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="image-composer__file-input"
            disabled={isDisabled}
            hidden
            multiple
            onChange={handleSelectImages}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />
          <button
            aria-label="Attach image"
            className="image-composer__icon-button"
            disabled={isDisabled || attachments.length >= maxImageCount}
            onClick={() => fileInputRef.current?.click()}
            title="Attach image"
            type="button"
          >
            <ImagePlus size={18} />
          </button>
          <textarea
            className="image-composer__input"
            disabled={isDisabled}
            onChange={(event) =>
              dispatch({
                type: "textChanged",
                textContent: event.target.value,
              })
            }
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            ref={textareaRef}
            rows={1}
            value={textContent}
          />
          <button
            aria-label={isRunning ? "Cancel message" : "Send message"}
            className="image-composer__send-button"
            disabled={!canSubmit && !isRunning}
            onClick={isRunning ? handleCancel : handleSubmit}
            title={isRunning ? "Cancel message" : "Send message"}
            type="button"
          >
            {isRunning ? (
              <Square fill="currentColor" size={14} />
            ) : (
              <ArrowUp size={18} />
            )}
          </button>
        </div>
      </div>

      {attachmentStatusMessage && (
        <p
          className={
            attachmentStatus === "failed"
              ? "image-composer__error"
              : "image-composer__status"
          }
          role="status"
        >
          {attachmentStatusMessage}
        </p>
      )}
      {isRunning && (
        <p className="image-composer__status" role="status">
          Streaming response...
        </p>
      )}
      {!isRunning && chatNotice === "cancelled" && (
        <p className="image-composer__status" role="status">
          Response cancelled.
        </p>
      )}
      {chatErrorMessage && (
        <p className="image-composer__error" role="status">
          {chatErrorMessage}
        </p>
      )}
    </form>
  );
}
