"use client";

import { useCallback, useRef } from "react";
import { normalizeAssistantCopyText } from "@/application/services/chat/assistant-copy-text";
import { getRenderedImageSources } from "@/application/services/chat/assistant-copy-dom";
import {
  writeBrowserClipboardPayload,
  writeBrowserClipboardText,
} from "@/infrastructure/browser/clipboard";
import { fetchImageAsPngBlob } from "@/infrastructure/browser/image-blob";

export function useAssistantCopyAction() {
  const renderedResponseRef = useRef<HTMLDivElement>(null);

  const handleCopy = useCallback(async () => {
    // 어시스턴트 메시지는 OpenUI 코드가 렌더링된 결과를 복사해야 하므로 DOM에서 텍스트와 이미지를 읽는다.
    const renderedResponse = renderedResponseRef.current;
    const renderedText = normalizeAssistantCopyText(renderedResponse?.innerText);

    if (renderedText) {
      return writeBrowserClipboardText(renderedText);
    }

    const imageSource = getRenderedImageSources(renderedResponse)[0];

    if (!imageSource) {
      return false;
    }

    const imageBlob = await fetchImageAsPngBlob(imageSource);

    if (!imageBlob) {
      return false;
    }

    return writeBrowserClipboardPayload({ imageBlob });
  }, []);

  return {
    handleCopy,
    renderedResponseRef,
  };
}
