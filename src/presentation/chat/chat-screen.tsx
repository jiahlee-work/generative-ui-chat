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
import { ImageComposer } from "@/presentation/chat/components/image-composer";
import { ImageUserMessage } from "@/presentation/chat/components/image-user-message";
import { OpenUITextLocalizer } from "@/presentation/chat/effects/openui-text-localizer";
import { getChatResponseErrorMessage } from "@/presentation/chat/lib/response/chat-response-error";

export function ChatScreen() {
  return (
    <>
      <OpenUITextLocalizer />
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
    </>
  );
}
