"use client";

import {
  type AssistantMessage,
  type Message,
  useThread,
  useThreadList,
} from "@openuidev/react-headless";
import { type ChangeEvent, type ClipboardEvent, useEffect, useReducer } from "react";
import {
  imageComposerReducer,
  initialImageComposerState,
} from "@/application/reducers/chat/image-composer-reducer";
import { setAssistantResponseStatus } from "@/application/services/chat/assistant-response-status";
import { saveLocalThreadMessages } from "@/application/services/chat/chat-history";
import { createImageInputContent } from "@/application/services/chat/image-composer-content";
import {
  getClipboardImageFiles,
  maxImageCount,
  readSelectedImageAttachments,
} from "@/application/services/chat/image-composer-selection";

type UseImageComposerProps = {
  onCancel: () => void;
  isRunning: boolean;
  isLoadingMessages: boolean;
};

export function useImageComposer(props: UseImageComposerProps) {
  const { onCancel, isRunning, isLoadingMessages } = props;
  const processMessage = useThread((state) => state.processMessage);
  const messages = useThread((state) => state.messages);
  const updateMessage = useThread((state) => state.updateMessage);
  const selectedThreadId = useThreadList((state) => state.selectedThreadId);
  const [composerState, dispatch] = useReducer(imageComposerReducer, initialImageComposerState);
  const { textContent, attachments, attachmentStatus, attachmentErrorMessage } = composerState;
  const hasTextContent = textContent.trim().length > 0;
  const hasAttachments = attachments.length > 0;
  const isDisabled = isRunning || isLoadingMessages;
  const canSubmit = !isDisabled && (hasTextContent || hasAttachments);
  const canSelectImages = !isDisabled && attachments.length < maxImageCount;

  useEffect(() => {
    if (!selectedThreadId || isRunning) {
      return;
    }

    void saveLocalThreadMessages(selectedThreadId, messages).catch(reportThreadSaveError);
  }, [isRunning, messages, selectedThreadId]);

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
    const latestAssistantMessage = getLatestAssistantMessage(messages);

    onCancel();

    if (latestAssistantMessage) {
      updateMessage(setAssistantResponseStatus(latestAssistantMessage, "interrupted"));
    }
  };

  return {
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
  };
}

function getLatestAssistantMessage(messages: Message[]) {
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

  return latestAssistantMessage;
}

function reportThreadSaveError(error: unknown) {
  const saveError = new Error("Failed to save local thread messages.", {
    cause: error,
  });

  if (typeof reportError === "function") {
    reportError(saveError);
    return;
  }

  window.dispatchEvent(
    new ErrorEvent("error", {
      error: saveError,
      message: saveError.message,
    }),
  );
}
