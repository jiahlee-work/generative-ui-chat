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
import { saveLocalThreadMessages } from "@/application/services/chat/chat-history";
import {
  allowedImageTypes,
  maxImageCount,
  maxImageSize,
  readImageFile,
} from "@/infrastructure/browser/image-files";
import { cn } from "@/shared/cn";
import {
  getAttachmentStatusMessage,
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

type ImageInputContentPart = BinaryInputContent & {
  attachmentId: string;
};

export function ImageComposer(props: ImageComposerProps) {
  const { onCancel, isRunning, isLoadingMessages } = props;
  const processMessage = useThread((state) => state.processMessage);
  const messages = useThread((state) => state.messages);
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
  const hasTextContent = textContent.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const isDisabled = isRunning || isLoadingMessages;
  const canSubmit = !isDisabled && (hasTextContent || hasAttachments);
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
        message: `이미지는 최대 ${maxImageCount}개까지 첨부할 수 있습니다.`,
      });
      return;
    }

    let selectionErrorMessage: string | null = null;

    if (selectedFiles.length > availableSlots) {
      selectionErrorMessage = `이미지는 최대 ${maxImageCount}개까지 첨부할 수 있습니다.`;
    } else if (invalidFiles.length > 0) {
      selectionErrorMessage = "JPG, PNG, WebP 이미지만 사용할 수 있습니다.";
    } else if (oversizedFiles.length > 0) {
      selectionErrorMessage = "이미지는 각각 4MB 이하여야 합니다.";
    }

    if (validFiles.length === 0) {
      dispatch({
        type: "imageSelectionFailed",
        message: selectionErrorMessage ?? "이미지 업로드에 실패했습니다.",
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
        message: "선택한 이미지 중 일부를 읽지 못했습니다.",
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
      : "첨부한 이미지를 설명해 주세요.";
    const content: InputContent[] = [
      { type: "text", text: promptText },
      ...attachments.map((attachment) => {
        return {
          type: "binary",
          mimeType: attachment.mimeType,
          url: attachment.dataUrl,
          filename: attachment.name,
          attachmentId: attachment.id,
        } satisfies ImageInputContentPart;
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
                  aria-label={`${attachment.name} 제거`}
                  className="image-composer__attachment-remove"
                  disabled={isDisabled}
                  onClick={() => handleRemoveImage(attachment.id)}
                  title="이미지 제거"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(
            "image-composer__input-row",
            hasMultilineInput && "image-composer__input-row--multiline",
          )}
        >
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
            aria-label="이미지 첨부"
            className="image-composer__icon-button"
            disabled={isDisabled || attachments.length >= maxImageCount}
            onClick={() => fileInputRef.current?.click()}
            title="이미지 첨부"
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
            placeholder="메시지를 입력하세요..."
            ref={textareaRef}
            rows={1}
            value={textContent}
          />
          <button
            aria-label={isRunning ? "응답 중단" : "메시지 전송"}
            className="image-composer__send-button"
            disabled={!canSubmit && !isRunning}
            onClick={isRunning ? handleCancel : handleSubmit}
            title={isRunning ? "응답 중단" : "메시지 전송"}
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
          className={cn(
            attachmentStatus === "failed"
              ? "image-composer__error"
              : "image-composer__status",
          )}
          role="status"
        >
          {attachmentStatusMessage}
        </p>
      )}
      {isRunning && (
        <p className="image-composer__status" role="status">
          응답을 생성하는 중입니다.
        </p>
      )}
      {!isRunning && chatNotice === "cancelled" && (
        <p className="image-composer__status" role="status">
          응답 생성을 중단했습니다.
        </p>
      )}
    </form>
  );
}
