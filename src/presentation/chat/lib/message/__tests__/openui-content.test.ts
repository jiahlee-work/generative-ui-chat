import { describe, expect, it } from "vitest";
import {
  separateOpenUIContent,
  wrapOpenUIContent,
  wrapOpenUIContext,
} from "@/presentation/chat/lib/message/openui-content";

describe("openui content helpers", () => {
  it("separates persisted context from assistant content", () => {
    expect(
      separateOpenUIContent("Render code\n<context>{\"value\":1}</context>"),
    ).toEqual({
      content: "Render code",
      contextString: "{\"value\":1}",
    });
  });

  it("unwraps human content tags", () => {
    expect(separateOpenUIContent("<content>사용자 입력</content>")).toEqual({
      content: "사용자 입력",
      contextString: null,
    });
  });

  it("wraps content and context tags", () => {
    expect(wrapOpenUIContent("계속")).toBe("<content>계속</content>");
    expect(wrapOpenUIContext("[]")).toBe("<context>[]</context>");
  });
});
