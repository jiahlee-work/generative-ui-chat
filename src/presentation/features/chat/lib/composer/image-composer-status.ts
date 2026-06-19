export type AttachmentStatus = "idle" | "uploading" | "ready" | "failed";

export function getAttachmentStatusMessage(
  status: AttachmentStatus,
  attachmentCount: number,
  errorMessage: string | null,
) {
  if (status === "uploading") {
    return "이미지를 업로드하는 중입니다.";
  }

  if (status === "ready" && attachmentCount > 0) {
    return `${attachmentCount}개의 이미지가 준비됐습니다.`;
  }

  if (status === "failed") {
    return errorMessage ?? "이미지 업로드에 실패했습니다.";
  }

  return null;
}
