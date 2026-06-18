export const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
export const maxImageCount = 3;
export const maxImageSize = 4 * 1024 * 1024;

export type BrowserImageAttachment = {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
  size: number;
};

export function readImageFile(file: File): Promise<BrowserImageAttachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("이미지를 읽지 못했습니다."));
        return;
      }

      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        dataUrl: reader.result,
        mimeType: file.type,
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error("이미지를 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

const blobObjectUrls = new Set<string>();

export function createBlobObjectUrl(blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  blobObjectUrls.add(objectUrl);

  return objectUrl;
}

export function revokeBlobObjectUrls() {
  for (const objectUrl of blobObjectUrls) {
    URL.revokeObjectURL(objectUrl);
  }

  blobObjectUrls.clear();
}
