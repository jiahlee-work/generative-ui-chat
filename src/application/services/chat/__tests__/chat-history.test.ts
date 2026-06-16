import { describe, expect, it } from "vitest";
import type { InputContent, Message } from "@openuidev/react-headless";
import {
  createThreadTitle,
  prepareMessagesForChatRequest,
} from "@/application/services/chat/chat-history";

describe("채팅 요청 메시지 변환", () => {
  it("최신 사용자 메시지의 새 이미지 데이터만 요청에 포함한다", () => {
    const messages = [
      {
        id: "older-user",
        role: "user",
        content: [
          { type: "text", text: "older image" },
          {
            type: "binary",
            mimeType: "image/png",
            filename: "older.png",
            url: "data:image/png;base64,older",
          },
        ],
      },
      {
        id: "latest-user",
        role: "user",
        content: [
          { type: "text", text: "latest image" },
          {
            type: "binary",
            mimeType: "image/png",
            filename: "latest.png",
            url: "data:image/png;base64,latest",
          },
        ],
      },
    ] satisfies Message[];

    const [olderMessage, latestMessage] =
      prepareMessagesForChatRequest(messages);

    expect(getContent(olderMessage)).toEqual([
      { type: "text", text: "older image" },
      {
        type: "text",
        text: "[로컬 히스토리에 보관된 이미지: older.png]",
      },
    ]);
    expect(getContent(latestMessage)).toEqual(messages[1].content);
  });

  it("복원된 blob 이미지는 LLM에 다시 보내지 않는다", () => {
    const messages = [
      {
        id: "latest-user",
        role: "user",
        content: [
          { type: "text", text: "restored image" },
          {
            type: "binary",
            mimeType: "image/png",
            filename: "restored.png",
            url: "blob:http://localhost/restored",
          },
        ],
      },
    ] satisfies Message[];

    const [preparedMessage] = prepareMessagesForChatRequest(messages);

    expect(getContent(preparedMessage)).toEqual([
      { type: "text", text: "restored image" },
      {
        type: "text",
        text: "[로컬 히스토리에 보관된 이미지: restored.png]",
      },
    ]);
  });
});

describe("채팅 제목 생성", () => {
  it("텍스트가 없는 이미지 메시지는 한글 기본 제목을 사용한다", () => {
    expect(
      createThreadTitle({
        id: "image-only",
        role: "user",
        content: [
          {
            type: "binary",
            mimeType: "image/png",
            filename: "image.png",
            url: "data:image/png;base64,image",
          },
        ],
      }),
    ).toBe("이미지 채팅");
  });
});

function getContent(message: Message | undefined) {
  if (!message || !Array.isArray(message.content)) {
    throw new Error("Expected message with input content.");
  }

  return message.content satisfies InputContent[];
}
