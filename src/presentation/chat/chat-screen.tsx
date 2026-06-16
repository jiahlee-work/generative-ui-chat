"use client";

import {
  ChatProvider,
  openAIReadableStreamAdapter,
} from "@openuidev/react-headless";
import { Shell, ThemeProvider } from "@openuidev/react-ui";
import {
  createLocalThread,
  deleteLocalThread,
  fetchLocalThreads,
  loadLocalThread,
  updateLocalThread,
} from "@/application/services/chat/chat-history";
import { processChatMessage } from "@/application/services/chat/process-chat-message";
import { ChatComposer } from "@/presentation/chat/components/chat-composer";
import { ChatMessages } from "@/presentation/chat/components/chat-messages";
import { ChatMobileHeader } from "@/presentation/chat/components/chat-mobile-header";
import { ChatSidebar } from "@/presentation/chat/components/chat-sidebar";

export function ChatScreen() {
  return (
    <ThemeProvider>
      <ChatProvider
        createThread={createLocalThread}
        deleteThread={deleteLocalThread}
        fetchThreadList={fetchLocalThreads}
        loadThread={loadLocalThread}
        processMessage={processChatMessage}
        streamProtocol={openAIReadableStreamAdapter()}
        updateThread={updateLocalThread}
      >
        <Shell.Container
          agentName="OpenUI Chat"
          logoUrl="https://www.openui.com/favicon.svg"
        >
          <ChatSidebar />
          <Shell.ThreadContainer>
            <ChatMobileHeader />
            <Shell.ScrollArea scrollVariant="user-message-anchor">
              <ChatMessages />
            </Shell.ScrollArea>
            <ChatComposer />
          </Shell.ThreadContainer>
        </Shell.Container>
      </ChatProvider>
    </ThemeProvider>
  );
}
