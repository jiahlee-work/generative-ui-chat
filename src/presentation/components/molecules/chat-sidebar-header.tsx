"use client";

import { IconButton, Shell } from "@openuidev/react-ui";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import { cn } from "@/shared/cn";

export function ChatSidebarHeader() {
  const { agentName, isSidebarOpen, logoUrl, setIsSidebarOpen } = Shell.useShellStore((state) => ({
    agentName: state.agentName,
    isSidebarOpen: state.isSidebarOpen,
    logoUrl: state.logoUrl,
    setIsSidebarOpen: state.setIsSidebarOpen,
  }));
  const sidebarVisualState = Shell.useOptionalSidebarVisualState();
  const isCollapsedLayout = Boolean(sidebarVisualState?.isCollapsedLayout);
  const showExpandedIcon =
    sidebarVisualState?.visualState === "expanded" ||
    sidebarVisualState?.visualState === "collapsing";

  return (
    <div
      className={cn(
        "openui-shell-sidebar-header",
        isCollapsedLayout && "openui-shell-sidebar-header--collapsed",
      )}
    >
      <div className="openui-shell-sidebar-header__top-row">
        <Image
          alt={agentName}
          className="openui-shell-sidebar-header__logo"
          height={28}
          src={logoUrl}
          unoptimized
          width={28}
        />
        <div className="openui-shell-sidebar-header__agent-name">{agentName}</div>
        <IconButton
          aria-label={isSidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
          className="openui-shell-sidebar-header__toggle-button"
          icon={showExpandedIcon ? <PanelLeftClose size="1em" /> : <PanelLeftOpen size="1em" />}
          onClick={(event) => {
            event.stopPropagation();
            setIsSidebarOpen(!isSidebarOpen);
          }}
          size="small"
          variant="tertiary"
        />
      </div>
    </div>
  );
}
