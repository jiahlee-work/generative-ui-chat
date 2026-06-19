"use client";

import { Shell } from "@openuidev/react-ui";
import { ChatNewButton } from "@/presentation/components/molecules/chat-new-button";
import { ChatSidebarHeader } from "@/presentation/components/molecules/chat-sidebar-header";
import { ChatThreadList } from "@/presentation/components/organisms/chat-thread-list/chat-thread-list";

export function ChatSidebar() {
  return (
    <Shell.SidebarContainer>
      <ChatSidebarHeader />
      <Shell.SidebarContent>
        <ChatNewButton />
        <Shell.SidebarSeparator />
        <ChatThreadList />
      </Shell.SidebarContent>
    </Shell.SidebarContainer>
  );
}
