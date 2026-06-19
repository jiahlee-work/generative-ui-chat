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
