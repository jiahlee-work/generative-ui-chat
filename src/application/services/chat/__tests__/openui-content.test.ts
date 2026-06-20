import { describe, expect, it } from "vitest";
import {
  getHasIncompleteDataImageSource,
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

  it("스트리밍 중 닫히지 않은 이미지 data URL을 감지한다", () => {
    expect(
      getHasIncompleteDataImageSource(
        'Image(src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovLw',
      ),
    ).toBe(true);
  });

  it("명백히 깨진 base64 이미지 data URL을 감지한다", () => {
    expect(getHasIncompleteDataImageSource('Image(src="data:image/svg+xml;base64,abcde")')).toBe(
      true,
    );
  });

  it("완성된 이미지 data URL은 허용한다", () => {
    expect(
      getHasIncompleteDataImageSource('Image(src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")'),
    ).toBe(false);
  });

  it("일반 이미지 URL은 data URL 검사 대상에서 제외한다", () => {
    expect(getHasIncompleteDataImageSource('Image(src="https://example.com/preview.png")')).toBe(
      false,
    );
  });
});
