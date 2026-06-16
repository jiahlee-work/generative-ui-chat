"use client";

import { useEffect } from "react";
import { type Thread, useThreadList } from "@openuidev/react-headless";
import {
  Button,
  IconButton,
  Shell,
  useLayoutContext,
} from "@openuidev/react-ui";
import { PanelLeftClose, PanelLeftOpen, SquarePen, Trash2 } from "lucide-react";
import { cn } from "@/shared/cn";

const threadGroupLabels = {
  today: "오늘",
  yesterday: "어제",
  last7Days: "최근 7일",
  last30Days: "최근 30일",
  thisYear: "올해",
  older: "이전",
};

type ThreadGroupKey = keyof typeof threadGroupLabels;

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

export function ChatSidebarHeader() {
  const { agentName, isSidebarOpen, logoUrl, setIsSidebarOpen } =
    Shell.useShellStore((state) => ({
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
        <img
          alt={agentName}
          className="openui-shell-sidebar-header__logo"
          src={logoUrl}
        />
        <div className="openui-shell-sidebar-header__agent-name">
          {agentName}
        </div>
        <IconButton
          aria-label={isSidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
          className="openui-shell-sidebar-header__toggle-button"
          icon={
            showExpandedIcon ? (
              <PanelLeftClose size="1em" />
            ) : (
              <PanelLeftOpen size="1em" />
            )
          }
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

export function ChatNewButton() {
  const switchToNewThread = useThreadList((state) => state.switchToNewThread);
  const isSidebarOpen = Shell.useShellStore((state) => state.isSidebarOpen);
  const { layout } = useLayoutContext();
  const sidebarVisualState = Shell.useOptionalSidebarVisualState();
  const showExpandedButton = sidebarVisualState
    ? sidebarVisualState.visualState === "expanded"
    : isSidebarOpen;
  const isMobile = layout === "mobile";

  if (!showExpandedButton) {
    return (
      <IconButton
        aria-label="새 채팅"
        className="openui-shell-new-chat-button_collapsed"
        icon={<SquarePen size="1em" />}
        onClick={(event) => {
          event.stopPropagation();
          switchToNewThread();
        }}
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

export function ChatThreadList() {
  const threads = useThreadList((state) => state.threads);
  const loadThreads = useThreadList((state) => state.loadThreads);
  const groupedThreads = groupThreadsByCreatedAt(threads);
  const threadGroups = Object.entries(groupedThreads) as Array<
    [ThreadGroupKey, Thread[]]
  >;

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <div className="openui-shell-thread-list">
      {threadGroups
        .filter(([, groupThreads]) => groupThreads.length > 0)
        .map(([group, groupThreads]) => (
          <section key={group}>
            <div className="openui-shell-thread-list-group">
              {threadGroupLabels[group]}
            </div>
            {groupThreads.map((thread) => (
              <ChatThreadButton
                id={thread.id}
                key={thread.id}
                title={thread.title}
              />
            ))}
          </section>
        ))}
      {threads.length === 0 && (
        <div className="chat-thread-list-empty">채팅 기록이 없습니다.</div>
      )}
    </div>
  );
}

type ChatThreadButtonProps = {
  id: string;
  title: string;
};

function ChatThreadButton(props: ChatThreadButtonProps) {
  const { id, title } = props;
  const selectedThreadId = useThreadList((state) => state.selectedThreadId);
  const selectThread = useThreadList((state) => state.selectThread);
  const deleteThread = useThreadList((state) => state.deleteThread);
  const { isSidebarOpen, setIsSidebarOpen } = Shell.useShellStore((state) => ({
    isSidebarOpen: state.isSidebarOpen,
    setIsSidebarOpen: state.setIsSidebarOpen,
  }));
  const { layout } = useLayoutContext();

  return (
    <div
      className={cn(
        "openui-shell-thread-button",
        selectedThreadId === id && "openui-shell-thread-button--selected",
      )}
    >
      <button
        className="openui-shell-thread-button-title"
        onClick={() => {
          if (layout === "mobile") {
            setIsSidebarOpen(!isSidebarOpen);
          }

          selectThread(id);
        }}
        type="button"
      >
        {title}
      </button>
      <IconButton
        aria-label={`${title} 삭제`}
        className="openui-shell-thread-button-dropdown-trigger"
        icon={<Trash2 size="1em" />}
        onClick={() => deleteThread(id)}
        size={layout === "mobile" ? "small" : "extra-small"}
        title="채팅 삭제"
        variant="tertiary"
      />
    </div>
  );
}

type ThreadGroups = Record<ThreadGroupKey, Thread[]>;

function groupThreadsByCreatedAt(threads: Thread[]): ThreadGroups {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  const thisYear = new Date(today);
  thisYear.setMonth(0, 1);

  return threads.reduce<ThreadGroups>(
    (groups, thread) => {
      const threadDate = new Date(thread.createdAt);

      if (threadDate >= today) {
        groups.today = [...groups.today, thread];
      } else if (threadDate >= yesterday) {
        groups.yesterday = [...groups.yesterday, thread];
      } else if (threadDate >= last7Days) {
        groups.last7Days = [...groups.last7Days, thread];
      } else if (threadDate >= last30Days) {
        groups.last30Days = [...groups.last30Days, thread];
      } else if (threadDate >= thisYear) {
        groups.thisYear = [...groups.thisYear, thread];
      } else {
        groups.older = [...groups.older, thread];
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      last7Days: [],
      last30Days: [],
      thisYear: [],
      older: [],
    },
  );
}
