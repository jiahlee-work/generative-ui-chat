export function getCanRenderImageSource(source: string | null | undefined) {
  const normalizedSource = source?.trim();

  if (!normalizedSource) {
    return false;
  }

  if (normalizedSource.startsWith("data:image/")) {
    return true;
  }

  if (normalizedSource.startsWith("blob:")) {
    return true;
  }

  try {
    const url = new URL(normalizedSource);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

type ImageSourceProps = {
  alt?: string;
  src: string;
};

export function normalizeRenderableImageProps(props: ImageSourceProps) {
  const { alt, src } = props;

  if (getCanRenderImageSource(src) || !getCanRenderImageSource(alt)) {
    return props;
  }

  const normalizedAlt = src.trim();

  return {
    alt: normalizedAlt || undefined,
    src: alt?.trim() ?? "",
  };
}
