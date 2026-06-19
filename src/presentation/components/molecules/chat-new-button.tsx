"use client";

import { useThreadList } from "@openuidev/react-headless";
import { Button, IconButton, Shell, useLayoutContext } from "@openuidev/react-ui";
import { SquarePen } from "lucide-react";
import type { MouseEvent } from "react";

export function ChatNewButton() {
  const switchToNewThread = useThreadList((state) => state.switchToNewThread);
  const isSidebarOpen = Shell.useShellStore((state) => state.isSidebarOpen);
  const { layout } = useLayoutContext();
  const sidebarVisualState = Shell.useOptionalSidebarVisualState();
  const showExpandedButton = sidebarVisualState
    ? sidebarVisualState.visualState === "expanded"
    : isSidebarOpen;
  const isMobile = layout === "mobile";

  const handleCollapsedNewThreadClick = (event: MouseEvent) => {
    event.stopPropagation();
    switchToNewThread();
  };

  if (!showExpandedButton) {
    return (
      <IconButton
        aria-label="새 채팅"
        className="openui-shell-new-chat-button_collapsed"
        icon={<SquarePen size="1em" />}
        onClick={handleCollapsedNewThreadClick}
        size={isMobile ? "medium" : "small"}
        title="새 채팅"
        variant="secondary"
      />
    );
  }

  return (
    <Button
      className="openui-shell-new-chat-button"
      iconLeft={<SquarePen />}
      onClick={switchToNewThread}
      size={isMobile ? "medium" : "small"}
      type="button"
      variant="secondary"
    >
      새 채팅
    </Button>
  );
}
