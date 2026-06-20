import { normalizeAssistantCopyText } from "@/application/services/chat/assistant-copy-text";

export function getRenderedImageSources(renderedResponse: HTMLElement | null) {
  if (!renderedResponse) {
    return [];
  }

  return Array.from(renderedResponse.querySelectorAll("img"))
    .map((image) => image.currentSrc || image.src)
    .filter((source) => source.trim().length > 0);
}

export function getShouldShowAssistantImageCopyButtons(renderedResponse: HTMLElement | null) {
  const renderedText = normalizeAssistantCopyText(renderedResponse?.innerText);
  const hasRenderedImage = getRenderedImageSources(renderedResponse).length > 0;

  return Boolean(renderedText && hasRenderedImage);
}
