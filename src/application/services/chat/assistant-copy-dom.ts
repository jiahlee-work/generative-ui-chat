export function getRenderedImageSources(renderedResponse: HTMLElement | null) {
  if (!renderedResponse) {
    return [];
  }

  return Array.from(renderedResponse.querySelectorAll("img"))
    .map((image) => image.currentSrc || image.src)
    .filter((source) => source.trim().length > 0);
}
