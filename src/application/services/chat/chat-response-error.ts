export async function getChatResponseErrorMessage(response: Response) {
  const fallbackMessage = getFallbackErrorMessage(response.status);

  try {
    const body = await response.json();

    if (!isErrorResponseBody(body)) {
      return fallbackMessage;
    }

    if (typeof body.error === "string") {
      return getLegacyErrorMessage(body.error);
    }

    if (typeof body.error.message === "string") {
      return body.error.message;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export function isErrorResponseBody(
  value: unknown,
): value is { error: string | { message?: unknown } } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    (typeof value.error === "string" || (typeof value.error === "object" && value.error !== null))
  );
}

function getFallbackErrorMessage(status: number) {
  if (status === 400) {
    return "채팅 요청이 올바르지 않습니다.";
  }

  if (status === 429) {
    return "요청이 많아 잠시 응답할 수 없습니다. 나중에 다시 시도해 주세요.";
  }

  if (status === 503) {
    return "일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (status === 500) {
    return "응답을 생성하지 못했습니다. 다시 시도해 주세요.";
  }

  return "채팅 요청에 실패했습니다. 다시 시도해 주세요.";
}

function getLegacyErrorMessage(message: string) {
  if (message.includes("Missing GEMINI_API_KEY")) {
    return "서비스 설정에 문제가 있습니다. 담당자에게 문의해 주세요.";
  }

  if (message.includes("invalid")) {
    return "채팅 요청이 올바르지 않습니다.";
  }

  if (message.includes("rate limit")) {
    return "요청이 많아 잠시 응답할 수 없습니다. 나중에 다시 시도해 주세요.";
  }

  if (message.includes("temporarily unavailable")) {
    return "일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  }

  return "응답을 생성하지 못했습니다. 다시 시도해 주세요.";
}
