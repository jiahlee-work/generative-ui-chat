export type OpenUIResponseStatus = "interrupted" | null;

const interruptedResponseMarker = "<!-- openui-chat:response-status=interrupted -->";

export function markOpenUIResponseInterrupted(raw: string) {
  if (raw.includes(interruptedResponseMarker)) {
    return raw;
  }

  return `${interruptedResponseMarker}\n${raw}`;
}

export function separateOpenUIContent(raw: string): {
  content: string;
  contextString: string | null;
  responseStatus: OpenUIResponseStatus;
} {
  const responseStatus = raw.includes(interruptedResponseMarker) ? "interrupted" : null;
  const normalizedRaw = raw.replaceAll(interruptedResponseMarker, "").trimStart();
  const contextMatch = normalizedRaw.match(/<context>([\s\S]*)<\/context>\s*$/);
  let content = normalizedRaw;
  let contextString: string | null = null;

  if (contextMatch) {
    contextString = contextMatch[1] ?? null;
    content = normalizedRaw.slice(0, contextMatch.index).trimEnd();
  }

  const contentMatch = content.match(/^<content[^>]*>([\s\S]*)<\/content>\s*$/);

  if (contentMatch) {
    content = contentMatch[1] ?? content;
  }

  return {
    content,
    contextString,
    responseStatus,
  };
}

export function wrapOpenUIContent(text: string) {
  return `<content>${text}</content>`;
}

export function wrapOpenUIContext(json: string) {
  return `<context>${json}</context>`;
}
