import { type Message, openAIMessageFormat } from "@openuidev/react-headless";

type PostChatMessagesParams = {
  messages: Message[];
  signal: AbortSignal;
};

export async function postChatMessages(params: PostChatMessagesParams) {
  const { messages, signal } = params;

  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: openAIMessageFormat.toApi(messages),
    }),
    signal,
  });
}
