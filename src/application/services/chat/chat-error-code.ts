export type ChatErrorCode =
  | "invalid_request"
  | "missing_api_key"
  | "model_unavailable"
  | "rate_limited"
  | "request_failed"
  | "response_failed";

export type ChatApiErrorCode = Exclude<ChatErrorCode, "request_failed">;
