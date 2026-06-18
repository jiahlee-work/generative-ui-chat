import type { Message } from "@openuidev/react-headless";
import { prepareMessagesForChatRequest } from "@/application/services/chat/chat-history";
import { getChatResponseErrorMessage } from "@/application/services/chat/chat-response-error";
import { postChatMessages } from "@/infrastructure/chat/chat-api-client";

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
