import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";

export type AttachmentStatus = "idle" | "uploading" | "ready" | "failed";

export type ImageComposerState = {
  textContent: string;
  attachments: BrowserImageAttachment[];
  attachmentStatus: AttachmentStatus;
  attachmentErrorMessage: string | null;
};

export type ImageComposerAction =
  | {
      type: "textChanged";
      textContent: string;
    }
  | {
      type: "imageSelectionStarted";
    }
  | {
      type: "imageSelectionFailed";
      message: string;
    }
  | {
      type: "imageSelectionSucceeded";
      attachments: BrowserImageAttachment[];
      errorMessage: string | null;
    }
  | {
      type: "imageRemoved";
      attachmentId: string;
    }
  | {
      type: "submitted";
    };

export const initialImageComposerState: ImageComposerState = {
  textContent: "",
  attachments: [],
  attachmentStatus: "idle",
  attachmentErrorMessage: null,
};

export function imageComposerReducer(
  state: ImageComposerState,
  action: ImageComposerAction,
): ImageComposerState {
  if (action.type === "textChanged") {
    return {
      ...state,
      textContent: action.textContent,
    };
  }

  if (action.type === "imageSelectionStarted") {
    return {
      ...state,
      attachmentStatus: "uploading",
      attachmentErrorMessage: null,
    };
  }

  if (action.type === "imageSelectionFailed") {
    return {
      ...state,
      attachmentStatus: "failed",
      attachmentErrorMessage: action.message,
    };
  }

  if (action.type === "imageSelectionSucceeded") {
    return {
      ...state,
      attachments: [...state.attachments, ...action.attachments],
      attachmentStatus: action.errorMessage ? "failed" : "ready",
      attachmentErrorMessage: action.errorMessage,
    };
  }

  if (action.type === "imageRemoved") {
    const attachments = state.attachments.filter((attachment) => {
      return attachment.id !== action.attachmentId;
    });

    return {
      ...state,
      attachments,
      attachmentStatus: attachments.length > 0 ? "ready" : "idle",
      attachmentErrorMessage: null,
    };
  }

  if (action.type === "submitted") {
    return initialImageComposerState;
  }

  return state;
}
