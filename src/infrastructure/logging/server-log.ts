type ChatErrorLog = {
  code: string;
  internalMessage: string;
  status: number;
};

export function logChatError(error: ChatErrorLog) {
  // biome-ignore lint/suspicious/noConsole: Server-side errors should be visible in local and platform logs.
  console.error("[chat:error]", error);
}
