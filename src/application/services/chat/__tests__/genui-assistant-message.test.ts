import type { Message } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import {
  getFollowingToolMessages,
  getInitialRendererState,
  getIsLatestAssistantResponseMessage,
  getIsStreamingAssistantMessage,
} from "@/application/services/chat/genui-assistant-message";

describe("GenUI 어시스턴트 메시지 도우미", () => {
  it("어시스턴트 메시지가 현재 스트리밍 중인지 판별한다", () => {
    const messages: Message[] = [
      { id: "user-1", role: "user", content: "hi" },
      { id: "assistant-1", role: "assistant", content: "" },
      { id: "assistant-2", role: "assistant", content: "" },
    ];

    expect(getIsStreamingAssistantMessage(messages, true, "assistant-2")).toBe(true);
    expect(getIsStreamingAssistantMessage(messages, true, "assistant-1")).toBe(false);
    expect(getIsStreamingAssistantMessage(messages, false, "assistant-2")).toBe(false);
  });

  it("마지막 사용자 질문에 대한 최신 어시스턴트 응답인지 판별한다", () => {
    const messages: Message[] = [
      { id: "user-1", role: "user", content: "hi" },
      { id: "assistant-1", role: "assistant", content: "" },
      { id: "tool-1", role: "tool", content: "a", toolCallId: "call-1" },
      { id: "user-2", role: "user", content: "again" },
      { id: "assistant-2", role: "assistant", content: "" },
      { id: "tool-2", role: "tool", content: "b", toolCallId: "call-2" },
    ];

    expect(getIsLatestAssistantResponseMessage(messages, "assistant-2")).toBe(true);
    expect(getIsLatestAssistantResponseMessage(messages, "assistant-1")).toBe(false);
  });

  it("마지막 사용자 질문 뒤에 어시스턴트 응답이 없으면 최신 응답이 없다고 판단한다", () => {
    const messages: Message[] = [
      { id: "user-1", role: "user", content: "hi" },
      { id: "assistant-1", role: "assistant", content: "" },
      { id: "user-2", role: "user", content: "again" },
    ];

    expect(getIsLatestAssistantResponseMessage(messages, "assistant-1")).toBe(false);
  });

  it("OpenUI 문맥에서 렌더러 상태를 파싱한다", () => {
    expect(getInitialRendererState('[{"count":1}]')).toEqual({ count: 1 });
    expect(getInitialRendererState('{"count":1}')).toEqual({ count: 1 });
    expect(getInitialRendererState("not-json")).toBeUndefined();
    expect(getInitialRendererState(null)).toBeUndefined();
  });

  it("어시스턴트 메시지 바로 뒤에 이어지는 도구 메시지를 반환한다", () => {
    const messages: Message[] = [
      { id: "assistant-1", role: "assistant", content: "" },
      { id: "tool-1", role: "tool", content: "a", toolCallId: "call-1" },
      { id: "tool-2", role: "tool", content: "b", toolCallId: "call-2" },
      { id: "user-1", role: "user", content: "next" },
      { id: "tool-3", role: "tool", content: "c", toolCallId: "call-3" },
    ];

    expect(getFollowingToolMessages(messages, "assistant-1").map((item) => item.id)).toEqual([
      "tool-1",
      "tool-2",
    ]);
  });
});
