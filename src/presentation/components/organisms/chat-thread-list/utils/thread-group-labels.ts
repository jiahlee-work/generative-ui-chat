import type { ThreadGroupKey } from "@/application/selectors/chat/thread-groups";

export const threadGroupLabels = {
  today: "오늘",
  yesterday: "어제",
  last7Days: "최근 7일",
  last30Days: "최근 30일",
  thisYear: "올해",
  older: "이전",
} satisfies Record<ThreadGroupKey, string>;
