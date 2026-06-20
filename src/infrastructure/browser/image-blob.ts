export async function fetchImageAsPngBlob(source: string) {
  const response = await fetch(source);

  if (!response.ok) {
    return null;
  }

  const sourceBlob = await response.blob();

  if (sourceBlob.type === "image/png") {
    return sourceBlob;
  }

  return convertImageBlobToPng(sourceBlob);
}

async function convertImageBlobToPng(sourceBlob: Blob) {
  try {
    const bitmap = await createImageBitmap(sourceBlob);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0);

      return await getCanvasPngBlob(canvas);
    } finally {
      bitmap.close();
    }
  } catch {
    return convertImageBlobToPngWithImageElement(sourceBlob);
  }
}

function getCanvasPngBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
}

function convertImageBlobToPngWithImageElement(sourceBlob: Blob) {
  return new Promise<Blob | null>((resolve) => {
    const objectUrl = URL.createObjectURL(sourceBlob);
    const image = new Image();

    image.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      URL.revokeObjectURL(objectUrl);
      resolve(await getCanvasPngBlob(canvas));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    image.src = objectUrl;
  });
}
