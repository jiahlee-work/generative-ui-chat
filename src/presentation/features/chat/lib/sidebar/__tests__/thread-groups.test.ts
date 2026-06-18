import type { Thread } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import { groupThreadsByCreatedAt } from "@/presentation/features/chat/lib/sidebar/thread-groups";

describe("스레드 그룹", () => {
  it("생성일 기준 최근성에 따라 스레드를 그룹화한다", () => {
    const groups = groupThreadsByCreatedAt(
      [
        thread("today", "2026-06-16T03:00:00.000Z"),
        thread("yesterday", "2026-06-15T03:00:00.000Z"),
        thread("last7Days", "2026-06-12T03:00:00.000Z"),
        thread("last30Days", "2026-05-25T03:00:00.000Z"),
        thread("thisYear", "2026-02-01T03:00:00.000Z"),
        thread("older", "2025-12-31T03:00:00.000Z"),
      ],
      new Date("2026-06-16T12:00:00.000Z"),
    );

    expect(groups.today.map((item) => item.id)).toEqual(["today"]);
    expect(groups.yesterday.map((item) => item.id)).toEqual(["yesterday"]);
    expect(groups.last7Days.map((item) => item.id)).toEqual(["last7Days"]);
    expect(groups.last30Days.map((item) => item.id)).toEqual(["last30Days"]);
    expect(groups.thisYear.map((item) => item.id)).toEqual(["thisYear"]);
    expect(groups.older.map((item) => item.id)).toEqual(["older"]);
  });
});

function thread(id: string, createdAt: string): Thread {
  return {
    id,
    title: id,
    createdAt: new Date(createdAt).getTime(),
  };
}
