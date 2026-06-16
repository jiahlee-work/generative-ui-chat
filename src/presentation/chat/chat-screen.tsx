"use client";

import {
  openAIMessageFormat,
  openAIReadableStreamAdapter,
} from "@openuidev/react-headless";
import { FullScreen } from "@openuidev/react-ui";
import { openuiLibrary } from "@openuidev/react-ui/genui-lib";
import {
  createLocalThread,
  deleteLocalThread,
  fetchLocalThreads,
  loadLocalThread,
  prepareMessagesForChatRequest,
  updateLocalThread,
} from "@/application/chat/chat-history";
import { ImageComposer } from "./components/image-composer";
import { ImageUserMessage } from "./components/image-user-message";
import { getChatResponseErrorMessage } from "./lib/chat-response-error";

export function ChatScreen() {
  return (
    <FullScreen
      agentName="OpenUI Chat"
      componentLibrary={openuiLibrary}
      composer={ImageComposer}
      createThread={createLocalThread}
      deleteThread={deleteLocalThread}
      fetchThreadList={fetchLocalThreads}
      loadThread={loadLocalThread}
      processMessage={async ({ messages, abortController }) => {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: openAIMessageFormat.toApi(
              prepareMessagesForChatRequest(messages),
            ),
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(await getChatResponseErrorMessage(response));
        }

        return response;
      }}
      streamProtocol={openAIReadableStreamAdapter()}
      updateThread={updateLocalThread}
      userMessage={ImageUserMessage}
    />
  );
}
