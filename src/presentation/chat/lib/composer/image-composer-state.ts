import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";
import type {
  AttachmentStatus,
  ChatNotice,
} from "@/presentation/chat/lib/composer/image-composer-status";

export type ImageComposerState = {
  textContent: string;
  attachments: BrowserImageAttachment[];
  attachmentStatus: AttachmentStatus;
  attachmentErrorMessage: string | null;
  chatNotice: ChatNotice;
  hasMultilineInput: boolean;
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
    }
  | {
      type: "cancelled";
    }
  | {
      type: "inputLayoutChanged";
      hasMultilineInput: boolean;
    };

export const initialImageComposerState: ImageComposerState = {
  textContent: "",
  attachments: [],
  attachmentStatus: "idle",
  attachmentErrorMessage: null,
  chatNotice: null,
  hasMultilineInput: false,
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

  if (action.type === "cancelled") {
    return {
      ...state,
      chatNotice: "cancelled",
    };
  }

  if (action.type === "inputLayoutChanged") {
    if (state.hasMultilineInput === action.hasMultilineInput) {
      return state;
    }

    return {
      ...state,
      hasMultilineInput: action.hasMultilineInput,
    };
  }

  return state;
}
