import { describe, expect, it } from "vitest";
import type { InputContent, Message } from "@openuidev/react-headless";
import { prepareMessagesForChatRequest } from "@/application/chat/chat-history";

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
        text: "[Image kept in local history: older.png]",
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
        text: "[Image kept in local history: restored.png]",
      },
    ]);
  });
});

function getContent(message: Message | undefined) {
  if (!message || !Array.isArray(message.content)) {
    throw new Error("Expected message with input content.");
  }

  return message.content satisfies InputContent[];
}
