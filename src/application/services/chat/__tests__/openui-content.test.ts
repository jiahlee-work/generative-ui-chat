import { describe, expect, it } from "vitest";
import {
  getOpenUIDisplayText,
  separateOpenUIContent,
  wrapOpenUIContent,
  wrapOpenUIContext,
} from "@/application/services/chat/openui-content";

describe("OpenUI 콘텐츠 도우미", () => {
  it("보관된 문맥과 어시스턴트 콘텐츠를 분리한다", () => {
    expect(separateOpenUIContent('Render code\n<context>{"value":1}</context>')).toEqual({
      content: "Render code",
      contextString: '{"value":1}',
    });
  });

  it("사용자 콘텐츠 태그를 벗겨낸다", () => {
    expect(separateOpenUIContent("<content>사용자 입력</content>")).toEqual({
      content: "사용자 입력",
      contextString: null,
    });
  });

  it("콘텐츠와 문맥 태그를 감싼다", () => {
    expect(wrapOpenUIContent("계속")).toBe("<content>계속</content>");
    expect(wrapOpenUIContext("[]")).toBe("<context>[]</context>");
  });

  it("사용자에게 보여줄 텍스트에서 OpenUI 태그를 제거한다", () => {
    expect(
      getOpenUIDisplayText('<content>사용자 입력</content>\n<context>{"value":1}</context>'),
    ).toBe("사용자 입력");
  });
});
