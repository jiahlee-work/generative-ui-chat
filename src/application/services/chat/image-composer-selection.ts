import {
  allowedImageTypes,
  type BrowserImageAttachment,
  maxImageCount,
  maxImageSize,
  readImageFile,
} from "@/infrastructure/browser/image-files";

export { maxImageCount };

type ImageSelectionResult =
  | {
      status: "succeeded";
      attachments: BrowserImageAttachment[];
      errorMessage: string | null;
    }
  | {
      status: "failed";
      message: string;
    };

export async function readSelectedImageAttachments(
  selectedFiles: File[],
  currentAttachmentCount: number,
): Promise<ImageSelectionResult> {
  const availableSlots = maxImageCount - currentAttachmentCount;
  const filesWithinLimit = selectedFiles.slice(0, Math.max(availableSlots, 0));
  const invalidFiles = filesWithinLimit.filter((file) => {
    return !allowedImageTypes.has(file.type);
  });
  const oversizedFiles = filesWithinLimit.filter((file) => {
    return file.size > maxImageSize;
  });
  const validFiles = filesWithinLimit.filter((file) => {
    return allowedImageTypes.has(file.type) && file.size <= maxImageSize;
  });
  const errorMessage = getImageSelectionErrorMessage({
    availableSlots,
    invalidFileCount: invalidFiles.length,
    oversizedFileCount: oversizedFiles.length,
    selectedFileCount: selectedFiles.length,
  });

  if (availableSlots <= 0 || validFiles.length === 0) {
    return {
      status: "failed",
      message: errorMessage ?? "이미지 업로드에 실패했습니다.",
    };
  }

  try {
    return {
      status: "succeeded",
      attachments: await Promise.all(validFiles.map(readImageFile)),
      errorMessage,
    };
  } catch {
    return {
      status: "failed",
      message: "선택한 이미지 중 일부를 읽지 못했습니다.",
    };
  }
}

export function getClipboardImageFiles(items: DataTransferItemList) {
  return Array.from(items).reduce<File[]>((imageFiles, item) => {
    if (item.kind !== "file" || !item.type.startsWith("image/")) {
      return imageFiles;
    }

    const file = item.getAsFile();

    if (file) {
      imageFiles.push(file);
    }

    return imageFiles;
  }, []);
}

function getImageSelectionErrorMessage(params: {
  availableSlots: number;
  invalidFileCount: number;
  oversizedFileCount: number;
  selectedFileCount: number;
}) {
  const { availableSlots, invalidFileCount, oversizedFileCount, selectedFileCount } = params;

  if (availableSlots <= 0 || selectedFileCount > availableSlots) {
    return `이미지는 최대 ${maxImageCount}개까지 첨부할 수 있습니다.`;
  }

  if (invalidFileCount > 0) {
    return "JPG, PNG, WebP 이미지만 사용할 수 있습니다.";
  }

  if (oversizedFileCount > 0) {
    return "이미지는 각각 4MB 이하여야 합니다.";
  }

  return null;
}
