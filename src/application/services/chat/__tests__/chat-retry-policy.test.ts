import type { Message } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import { ChatResponseError } from "@/application/services/chat/chat-response-error";
import {
  getChatRetryControl,
  getIsAssistantMessageRetryTarget,
  getIsChatThreadErrorRetryable,
  getIsLatestUserMessageWithoutResponse,
  getIsUnansweredUserMessageRetryTarget,
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
    expect(
      getChatRetryControl(getLastUserMessageRetryPolicy(messages), {
        isRetryTarget: true,
      }),
    ).toEqual({
      canRetry: false,
      blockedMessage: "이미지는 다시 첨부해야 합니다.",
    });
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
    expect(
      getChatRetryControl(getLastUserMessageRetryPolicy(messages), {
        isRetryTarget: true,
      }),
    ).toEqual({
      canRetry: false,
      blockedMessage: null,
    });
  });

  it("재시도 대상이 아니면 재시도 버튼과 차단 문구를 숨긴다", () => {
    const messages = [
      {
        id: "user",
        role: "user",
        content: "질문",
      },
    ] satisfies Message[];

    expect(
      getChatRetryControl(getLastUserMessageRetryPolicy(messages), {
        isRetryTarget: false,
      }),
    ).toEqual({
      canRetry: false,
      blockedMessage: null,
    });
  });

  it("재시도 불가능한 API 에러는 재시도 버튼과 차단 문구를 숨긴다", () => {
    const error = new ChatResponseError({
      message: "채팅 요청이 올바르지 않습니다.",
      retryable: false,
    });
    const messages = [
      {
        id: "user",
        role: "user",
        content: "질문",
      },
    ] satisfies Message[];

    expect(getIsChatThreadErrorRetryable(error)).toBe(false);
    expect(
      getChatRetryControl(getLastUserMessageRetryPolicy(messages), {
        isRetryTarget: true,
        error,
      }),
    ).toEqual({
      canRetry: false,
      blockedMessage: null,
    });
  });

  it("재시도 가능한 에러는 마지막 사용자 메시지 재전송을 허용한다", () => {
    const error = new ChatResponseError({
      message: "응답을 생성하지 못했습니다. 재시도해 주세요.",
      retryable: true,
    });
    const messages = [
      {
        id: "user",
        role: "user",
        content: "질문",
      },
    ] satisfies Message[];

    expect(getIsChatThreadErrorRetryable(error)).toBe(true);
    expect(
      getChatRetryControl(getLastUserMessageRetryPolicy(messages), {
        isRetryTarget: true,
        error,
      }),
    ).toEqual({
      canRetry: true,
      blockedMessage: null,
    });
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

  it("최신 assistant 메시지만 재시도 대상으로 판단한다", () => {
    const messages = [
      { id: "user-1", role: "user", content: "처음 질문" },
      { id: "assistant-1", role: "assistant", content: "처음 답변" },
      { id: "user-2", role: "user", content: "두 번째 질문" },
      { id: "assistant-2", role: "assistant", content: "두 번째 답변" },
    ] satisfies Message[];

    expect(
      getIsAssistantMessageRetryTarget({
        assistantMessageId: "assistant-1",
        hasThreadError: false,
        isRunning: false,
        messages,
      }),
    ).toBe(false);
    expect(
      getIsAssistantMessageRetryTarget({
        assistantMessageId: "assistant-2",
        hasThreadError: false,
        isRunning: false,
        messages,
      }),
    ).toBe(true);
  });

  it("응답 중이거나 thread error가 있으면 assistant 메시지를 재시도 대상으로 보지 않는다", () => {
    const messages = [
      { id: "user", role: "user", content: "질문" },
      { id: "assistant", role: "assistant", content: "답변" },
    ] satisfies Message[];
    const baseOptions = {
      assistantMessageId: "assistant",
      messages,
    };

    expect(
      getIsAssistantMessageRetryTarget({
        ...baseOptions,
        hasThreadError: false,
        isRunning: true,
      }),
    ).toBe(false);
    expect(
      getIsAssistantMessageRetryTarget({
        ...baseOptions,
        hasThreadError: true,
        isRunning: false,
      }),
    ).toBe(false);
  });

  it("응답이 없는 최신 사용자 메시지는 running/thread error가 없을 때만 재시도 대상으로 판단한다", () => {
    expect(
      getIsUnansweredUserMessageRetryTarget({
        hasThreadError: false,
        isLatestUserMessageMissingResponse: true,
        isRunning: false,
      }),
    ).toBe(true);
    expect(
      getIsUnansweredUserMessageRetryTarget({
        hasThreadError: true,
        isLatestUserMessageMissingResponse: true,
        isRunning: false,
      }),
    ).toBe(false);
    expect(
      getIsUnansweredUserMessageRetryTarget({
        hasThreadError: false,
        isLatestUserMessageMissingResponse: true,
        isRunning: true,
      }),
    ).toBe(false);
    expect(
      getIsUnansweredUserMessageRetryTarget({
        hasThreadError: false,
        isLatestUserMessageMissingResponse: false,
        isRunning: false,
      }),
    ).toBe(false);
  });
});
