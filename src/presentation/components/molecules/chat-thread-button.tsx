"use client";

import { useThreadList } from "@openuidev/react-headless";
import { IconButton, Shell, useLayoutContext } from "@openuidev/react-ui";
import { Trash2 } from "lucide-react";
import { cn } from "@/shared/cn";

type ChatThreadButtonProps = {
  id: string;
  title: string;
};

export function ChatThreadButton(props: ChatThreadButtonProps) {
  const { id, title } = props;
  const selectedThreadId = useThreadList((state) => state.selectedThreadId);
  const selectThread = useThreadList((state) => state.selectThread);
  const deleteThread = useThreadList((state) => state.deleteThread);
  const { isSidebarOpen, setIsSidebarOpen } = Shell.useShellStore((state) => ({
    isSidebarOpen: state.isSidebarOpen,
    setIsSidebarOpen: state.setIsSidebarOpen,
  }));
  const { layout } = useLayoutContext();
  const isMobile = layout === "mobile";
  const isSelected = selectedThreadId === id;

  const handleSelectThread = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }

    selectThread(id);
  };

  const handleDeleteThread = () => {
    deleteThread(id);
  };

  return (
    <div
      className={cn(
        "openui-shell-thread-button",
        isSelected && "openui-shell-thread-button--selected",
      )}
    >
      <button
        className="openui-shell-thread-button-title"
        onClick={handleSelectThread}
        type="button"
      >
        {title}
      </button>
      <IconButton
        aria-label={`${title} 삭제`}
        className="openui-shell-thread-button-dropdown-trigger"
        icon={<Trash2 size="1em" />}
        onClick={handleDeleteThread}
        size={isMobile ? "small" : "extra-small"}
        title="채팅 삭제"
        variant="tertiary"
      />
    </div>
  );
}
