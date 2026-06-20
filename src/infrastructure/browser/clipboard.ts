export type BrowserClipboardPayload = {
  imageBlob?: Blob;
  text?: string;
};

export async function writeBrowserClipboardText(text: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function writeBrowserClipboardPayload(payload: BrowserClipboardPayload) {
  if (payload.imageBlob && getCanWriteClipboardItems()) {
    try {
      await navigator.clipboard.write([new ClipboardItem(getClipboardItemParts(payload))]);
      return true;
    } catch {
      return false;
    }
  }

  if (payload.text) {
    return writeBrowserClipboardText(payload.text);
  }

  return false;
}

function getCanWriteClipboardItems() {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof ClipboardItem === "undefined" ||
    typeof navigator.clipboard.write !== "function"
  ) {
    return false;
  }

  const ClipboardItemWithSupports = ClipboardItem as typeof ClipboardItem & {
    supports?: (type: string) => boolean;
  };

  return !ClipboardItemWithSupports.supports || ClipboardItemWithSupports.supports("image/png");
}

function getClipboardItemParts(payload: BrowserClipboardPayload) {
  const parts: Record<string, Blob> = {};

  if (payload.imageBlob) {
    parts[payload.imageBlob.type] = payload.imageBlob;
  }

  if (payload.text) {
    parts["text/plain"] = new Blob([payload.text], {
      type: "text/plain",
    });
  }

  return parts;
}
