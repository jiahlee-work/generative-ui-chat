export function getDisplayText(content: string) {
  const contentMatch = content.match(/^<content[^>]*>([\s\S]*)<\/content>/);

  if (contentMatch?.[1]) {
    return contentMatch[1];
  }

  return content.replace(/<context>[\s\S]*<\/context>\s*$/, "").trim();
}
