import { describe, expect, it } from "vitest";
import {
  imageComposerReducer,
  initialImageComposerState,
} from "@/presentation/chat/lib/composer/image-composer-state";
import type { BrowserImageAttachment } from "@/infrastructure/browser/image-files";

const attachment: BrowserImageAttachment = {
  id: "attachment-1",
  name: "image.png",
  dataUrl: "data:image/png;base64,abc",
  mimeType: "image/png",
  size: 1200,
};

describe("이미지 입력창 상태 변경", () => {
  it("업로드한 이미지 첨부를 준비 완료 상태로 표시한다", () => {
    const uploadingState = imageComposerReducer(initialImageComposerState, {
      type: "imageSelectionStarted",
    });
    const readyState = imageComposerReducer(uploadingState, {
      type: "imageSelectionSucceeded",
      attachments: [attachment],
      errorMessage: null,
    });

    expect(readyState.attachments).toEqual([attachment]);
    expect(readyState.attachmentStatus).toBe("ready");
    expect(readyState.attachmentErrorMessage).toBeNull();
  });

  it("일부 선택 실패가 있어도 유효한 첨부는 유지한다", () => {
    const state = imageComposerReducer(initialImageComposerState, {
      type: "imageSelectionSucceeded",
      attachments: [attachment],
      errorMessage: "Only 3 images can be attached.",
    });

    expect(state.attachments).toEqual([attachment]);
    expect(state.attachmentStatus).toBe("failed");
    expect(state.attachmentErrorMessage).toBe("Only 3 images can be attached.");
  });

  it("전송 후 입력창 상태를 초기화한다", () => {
    const readyState = imageComposerReducer(
      {
        ...initialImageComposerState,
        textContent: "hello",
        attachments: [attachment],
        attachmentStatus: "ready",
      },
      { type: "submitted" },
    );

    expect(readyState).toEqual(initialImageComposerState);
  });
});
