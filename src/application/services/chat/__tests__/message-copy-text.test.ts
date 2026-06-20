import type { UserMessage } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import {
  getUserMessageCopyText,
  normalizeCopyText,
} from "@/application/services/chat/message-copy-text";

describe("메시지 복사 텍스트", () => {
  it("공백과 과도한 줄바꿈을 정리한다", () => {
    expect(normalizeCopyText("  1+1  \n\n\n = 2  ")).toBe("1+1\n\n= 2");
  });

  it("OpenUI 문자열 콘텐츠에서 표시 텍스트만 복사한다", () => {
    const content = "<content>이미지에 보이는 수식 계산</content><context>{}</context>";

    expect(getUserMessageCopyText(content)).toBe("이미지에 보이는 수식 계산");
  });

  it("이미지 메시지에서는 텍스트 파트만 합쳐서 복사한다", () => {
    const content: UserMessage["content"] = [
      {
        type: "binary",
        mimeType: "image/png",
        filename: "formula.png",
        url: "data:image/png;base64,example",
      },
      {
        type: "text",
        text: "1+1",
      },
      {
        type: "text",
        text: "= 2",
      },
    ];

    expect(getUserMessageCopyText(content)).toBe("1+1\n= 2");
  });

  it("복사할 텍스트가 없으면 null을 반환한다", () => {
    const content: UserMessage["content"] = [
      {
        type: "binary",
        mimeType: "image/png",
        filename: "formula.png",
        url: "data:image/png;base64,example",
      },
    ];

    expect(getUserMessageCopyText(content)).toBeNull();
  });
});
