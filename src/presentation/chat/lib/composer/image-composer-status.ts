export type AttachmentStatus = "idle" | "uploading" | "ready" | "failed";
export type ChatNotice = "cancelled" | null;

export function getAttachmentStatusMessage(
  status: AttachmentStatus,
  attachmentCount: number,
  errorMessage: string | null,
) {
  if (status === "uploading") {
    return "Uploading images...";
  }

  if (status === "ready" && attachmentCount > 0) {
    return `${attachmentCount} image${attachmentCount === 1 ? "" : "s"} ready.`;
  }

  if (status === "failed") {
    return errorMessage ?? "Image upload failed.";
  }

  return null;
}

export function getChatErrorMessage(error: Error) {
  return `LLM response failed: ${error.message}`;
}
