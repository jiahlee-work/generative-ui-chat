import type { Thread } from "@openuidev/react-headless";

export const threadGroupOrder = [
  "today",
  "yesterday",
  "last7Days",
  "last30Days",
  "thisYear",
  "older",
] as const satisfies ThreadGroupKey[];

export type ThreadGroupKey =
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisYear"
  | "older";
export type ThreadGroups = Record<ThreadGroupKey, Thread[]>;

export function groupThreadsByCreatedAt(threads: Thread[], now = new Date()): ThreadGroups {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);
  const thisYear = new Date(today);
  thisYear.setMonth(0, 1);

  return threads.reduce<ThreadGroups>((groups, thread) => {
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
  }, createEmptyThreadGroups());
}

function createEmptyThreadGroups(): ThreadGroups {
  return {
    today: [],
    yesterday: [],
    last7Days: [],
    last30Days: [],
    thisYear: [],
    older: [],
  };
}
