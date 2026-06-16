import type { Message } from "@openuidev/react-headless";
import { postChatMessages } from "@/infrastructure/chat/chat-api-client";
import { getChatResponseErrorMessage } from "@/application/services/chat/chat-response-error";
import { prepareMessagesForChatRequest } from "@/application/services/chat/chat-history";

type ProcessChatMessageParams = {
  messages: Message[];
  abortController: AbortController;
};

export async function processChatMessage(params: ProcessChatMessageParams) {
  const { messages, abortController } = params;
  const response = await postChatMessages({
    messages: prepareMessagesForChatRequest(messages),
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error(await getChatResponseErrorMessage(response));
  }

  return response;
}
