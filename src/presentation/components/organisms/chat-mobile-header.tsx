"use client";

import { useThreadList } from "@openuidev/react-headless";
import { IconButton, Shell } from "@openuidev/react-ui";
import { Menu, Plus } from "lucide-react";
import Image from "next/image";

export function ChatMobileHeader() {
  const switchToNewThread = useThreadList((state) => state.switchToNewThread);
  const { agentName, logoUrl, setIsSidebarOpen } = Shell.useShellStore((state) => ({
    agentName: state.agentName,
    logoUrl: state.logoUrl,
    setIsSidebarOpen: state.setIsSidebarOpen,
  }));

  return (
    <div className="openui-shell-mobile-header">
      <IconButton
        aria-label="사이드바 열기"
        icon={<Menu size="1em" />}
        onClick={() => setIsSidebarOpen(true)}
        size="medium"
        variant="secondary"
      />
      <div className="openui-shell-mobile-header-logo-container">
        <Image
          alt="Logo"
          className="openui-shell-mobile-header-logo"
          height={28}
          src={logoUrl}
          unoptimized
          width={28}
        />
        <span className="openui-shell-mobile-header-agent-name">{agentName}</span>
      </div>
      <div className="openui-shell-mobile-header-actions">
        <IconButton
          aria-label="새 채팅"
          icon={<Plus size="1em" />}
          onClick={switchToNewThread}
          size="medium"
          variant="secondary"
        />
      </div>
    </div>
  );
}
