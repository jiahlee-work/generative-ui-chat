export async function getChatResponseErrorMessage(response: Response) {
  const fallbackMessage = `Chat request failed with status ${response.status}.`;

  try {
    const body = await response.json();

    if (isErrorResponseBody(body)) {
      return body.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export function isErrorResponseBody(
  value: unknown,
): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}
