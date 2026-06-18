export function normalizeAssistantCopyText(renderedText: string | null | undefined) {
  if (!renderedText) {
    return null;
  }

  const normalizedText = renderedText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalizedText.length > 0 ? normalizedText : null;
}
