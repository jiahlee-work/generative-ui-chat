import { describe, expect, it } from "vitest";
import { getLocalizedOpenUILabel } from "@/presentation/chat/lib/response/openui-label";

describe("OpenUI 기본 라벨", () => {
  it("에러 타이틀을 한글로 바꾼다", () => {
    expect(getLocalizedOpenUILabel("Something went wrong")).toBe(
      "문제가 발생했습니다.",
    );
  });

  it("새 채팅 버튼 라벨을 한글로 바꾼다", () => {
    expect(getLocalizedOpenUILabel("New Chat")).toBe("새 채팅");
  });

  it("사이드바 버튼 라벨을 한글로 바꾼다", () => {
    expect(getLocalizedOpenUILabel("Open sidebar")).toBe("사이드바 열기");
    expect(getLocalizedOpenUILabel("Collapse sidebar")).toBe("사이드바 접기");
  });

  it("알 수 없는 라벨은 그대로 둔다", () => {
    expect(getLocalizedOpenUILabel("Custom error")).toBe("Custom error");
  });
});
