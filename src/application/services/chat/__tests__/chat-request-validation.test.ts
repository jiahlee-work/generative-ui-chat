import { describe, expect, it } from "vitest";
import {
  getChatRequestMessages,
  validateChatRequestMessages,
} from "@/application/services/chat/chat-request-validation";

describe("채팅 요청 검증", () => {
  it("요청 본문에서 메시지 목록을 읽는다", () => {
    const messages = [{ role: "user", content: "안녕" }];

    expect(getChatRequestMessages({ messages })).toBe(messages);
    expect(getChatRequestMessages(null)).toBeUndefined();
  });

  it("텍스트만 있는 메시지를 허용한다", () => {
    expect(validateChatRequestMessages([{ role: "user", content: "안녕" }])).toBe(true);
  });

  it("지원하는 인라인 이미지 메시지를 허용한다", () => {
    expect(
      validateChatRequestMessages([
        {
          role: "user",
          content: [
            { type: "text", text: "이미지를 봐줘" },
            {
              type: "image_url",
              image_url: {
                url: "data:image/png;base64,aGVsbG8=",
              },
            },
          ],
        },
      ]),
    ).toBe(true);
  });

  it("지원하지 않는 인라인 이미지를 거부한다", () => {
    expect(
      validateChatRequestMessages([
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: "data:image/gif;base64,aGVsbG8=",
              },
            },
          ],
        },
      ]),
    ).toBe(false);
  });

  it("인라인 이미지가 3개를 넘으면 거부한다", () => {
    expect(
      validateChatRequestMessages([
        {
          role: "user",
          content: Array.from({ length: 4 }, () => {
            return {
              type: "image_url",
              image_url: {
                url: "data:image/png;base64,aGVsbG8=",
              },
            };
          }),
        },
      ]),
    ).toBe(false);
  });
});
