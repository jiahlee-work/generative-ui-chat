"use client";

import { useThreadList } from "@openuidev/react-headless";
import { useEffect } from "react";
import { ChatThreadButton } from "@/presentation/components/molecules/chat-thread-button";
import {
  groupThreadsByCreatedAt,
  threadGroupLabels,
  threadGroupOrder,
} from "@/presentation/features/chat/lib/sidebar/thread-groups";

export function ChatThreadList() {
  const threads = useThreadList((state) => state.threads);
  const loadThreads = useThreadList((state) => state.loadThreads);
  const groupedThreads = groupThreadsByCreatedAt(threads);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <div className="openui-shell-thread-list">
      {threadGroupOrder
        .filter((group) => groupedThreads[group].length > 0)
        .map((group) => (
          <section key={group}>
            <div className="openui-shell-thread-list-group">{threadGroupLabels[group]}</div>
            {groupedThreads[group].map((thread) => (
              <ChatThreadButton id={thread.id} key={thread.id} title={thread.title} />
            ))}
          </section>
        ))}
      {threads.length === 0 && (
        <div className="px-3 py-2 text-[var(--openui-text-neutral-tertiary)] text-sm">
          채팅 기록이 없습니다.
        </div>
      )}
    </div>
  );
}
