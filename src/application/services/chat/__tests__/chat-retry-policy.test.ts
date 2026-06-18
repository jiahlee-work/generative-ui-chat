import type { Message } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import {
  getChatRetryBlockedMessage,
  getIsLatestUserMessageWithoutResponse,
  getLastUserMessageRetryPolicy,
} from "@/application/services/chat/chat-retry-policy";

describe("채팅 재전송 정책", () => {
  it("마지막 사용자 메시지를 다시 보낼 수 있는 계획을 만든다", () => {
    const messages = [
      {
        id: "first-user",
        role: "user",
        content: "처음 질문",
      },
      {
        id: "first-assistant",
        role: "assistant",
        content: "처음 답변",
      },
      {
        id: "retry-user",
        role: "user",
        content: "다시 보낼 질문",
      },
      {
        id: "partial-assistant",
        role: "assistant",
        content: "중단된 답변",
      },
    ] satisfies Message[];

    expect(getLastUserMessageRetryPolicy(messages)).toEqual({
      status: "allowed",
      retryMessage: {
        role: "user",
        content: "다시 보낼 질문",
      },
      messagesBeforeRetry: messages.slice(0, 2),
    });
  });

  it("직접 보낼 수 있는 이미지 데이터가 있으면 이미지 메시지도 다시 보낼 수 있다", () => {
    const messages = [
      {
        id: "image-user",
        role: "user",
        content: [
          { type: "text", text: "이미지 설명" },
          {
            type: "binary",
            mimeType: "image/png",
            filename: "image.png",
            url: "data:image/png;base64,abc",
          },
        ],
      },
    ] satisfies Message[];

    expect(getLastUserMessageRetryPolicy(messages)).toEqual({
      status: "allowed",
      retryMessage: {
        role: "user",
        content: messages[0].content,
      },
      messagesBeforeRetry: [],
    });
  });

  it("저장소에서 복원된 이미지는 다시 첨부하도록 막는다", () => {
    const messages = [
      {
        id: "restored-image-user",
        role: "user",
        content: [
          { type: "text", text: "이미지 설명" },
          {
            type: "binary",
            mimeType: "image/png",
            filename: "image.png",
            url: "blob:http://localhost/image",
          },
        ],
      },
    ] satisfies Message[];

    expect(getLastUserMessageRetryPolicy(messages)).toEqual({
      status: "blocked",
      reason: "imageRequiresReattach",
    });
    expect(getChatRetryBlockedMessage("imageRequiresReattach")).toBe(
      "이미지는 다시 첨부해야 합니다.",
    );
  });

  it("깨진 이미지 안내가 포함된 메시지는 다시 첨부하도록 막는다", () => {
    const messages = [
      {
        id: "unavailable-image-user",
        role: "user",
        content: [
          { type: "text", text: "이미지를 확인해줘" },
          { type: "text", text: "[이미지를 불러올 수 없습니다: image.png]" },
        ],
      },
    ] satisfies Message[];

    expect(getLastUserMessageRetryPolicy(messages)).toEqual({
      status: "blocked",
      reason: "imageRequiresReattach",
    });
  });

  it("사용자 메시지가 없으면 다시 보낼 수 없다", () => {
    const messages = [
      {
        id: "assistant",
        role: "assistant",
        content: "답변",
      },
    ] satisfies Message[];

    expect(getLastUserMessageRetryPolicy(messages)).toEqual({
      status: "blocked",
      reason: "noUserMessage",
    });
    expect(getChatRetryBlockedMessage("noUserMessage")).toBeNull();
  });

  it("최신 사용자 메시지 뒤에 응답이 없으면 미응답 메시지로 판단한다", () => {
    const messages = [
      { id: "user-1", role: "user", content: "처음 질문" },
      { id: "assistant-1", role: "assistant", content: "처음 답변" },
      { id: "user-2", role: "user", content: "실패한 질문" },
    ] satisfies Message[];

    expect(getIsLatestUserMessageWithoutResponse(messages, "user-2")).toBe(true);
    expect(getIsLatestUserMessageWithoutResponse(messages, "user-1")).toBe(false);
  });

  it("최신 사용자 메시지 뒤에 어시스턴트 응답이 있으면 미응답 메시지가 아니라고 판단한다", () => {
    const messages = [
      { id: "user-1", role: "user", content: "질문" },
      { id: "assistant-1", role: "assistant", content: "답변" },
    ] satisfies Message[];

    expect(getIsLatestUserMessageWithoutResponse(messages, "user-1")).toBe(false);
  });
});
