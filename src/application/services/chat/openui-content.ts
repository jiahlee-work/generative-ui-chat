export function separateOpenUIContent(raw: string): {
  content: string;
  contextString: string | null;
} {
  const contextMatch = raw.match(/<context>([\s\S]*)<\/context>\s*$/);
  let content = raw;
  let contextString: string | null = null;

  if (contextMatch) {
    contextString = contextMatch[1] ?? null;
    content = raw.slice(0, contextMatch.index).trimEnd();
  }

  const contentMatch = content.match(/^<content[^>]*>([\s\S]*)<\/content>\s*$/);

  if (contentMatch) {
    content = contentMatch[1] ?? content;
  }

  return {
    content,
    contextString,
  };
}

export function wrapOpenUIContent(text: string) {
  return `<content>${text}</content>`;
}

export function wrapOpenUIContext(json: string) {
  return `<context>${json}</context>`;
}

export function getOpenUIDisplayText(raw: string) {
  return separateOpenUIContent(raw).content.trim();
}

export function getHasIncompleteDataImageSource(raw: string | null | undefined) {
  if (!raw) {
    return false;
  }

  let sourceStartIndex = raw.indexOf("data:image/");

  while (sourceStartIndex !== -1) {
    const sourceEndIndex = findDataImageSourceEndIndex(raw, sourceStartIndex);

    if (sourceEndIndex === -1) {
      return true;
    }

    const source = raw.slice(sourceStartIndex, sourceEndIndex);

    if (source.includes(";base64,") && !getHasValidBase64ImageBody(source)) {
      return true;
    }

    sourceStartIndex = raw.indexOf("data:image/", sourceEndIndex);
  }

  return false;
}

function findDataImageSourceEndIndex(raw: string, sourceStartIndex: number) {
  for (let index = sourceStartIndex; index < raw.length; index += 1) {
    const character = raw[index];

    if (
      character === '"' ||
      character === "'" ||
      character === "`" ||
      character === ")" ||
      /\s/.test(character ?? "")
    ) {
      return index;
    }
  }

  return -1;
}

function getHasValidBase64ImageBody(source: string) {
  const base64StartIndex = source.indexOf(";base64,") + ";base64,".length;
  const body = source.slice(base64StartIndex);

  if (!body || body.length % 4 === 1) {
    return false;
  }

  return /^[A-Za-z0-9+/]+=*$/.test(body);
}
