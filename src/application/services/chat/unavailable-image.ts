const unavailableImageTextPrefix = "[이미지를 불러올 수 없습니다:";
const unavailableImageTextSuffix = "]";

export function createUnavailableImageText(filename?: string) {
  return `${unavailableImageTextPrefix} ${filename ?? "첨부 파일"}${unavailableImageTextSuffix}`;
}

export function getUnavailableImageFilename(text: string) {
  if (!text.startsWith(unavailableImageTextPrefix) || !text.endsWith(unavailableImageTextSuffix)) {
    return null;
  }

  return text.slice(unavailableImageTextPrefix.length, -unavailableImageTextSuffix.length).trim();
}
