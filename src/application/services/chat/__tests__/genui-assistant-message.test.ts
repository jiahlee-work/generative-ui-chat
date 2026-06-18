import type { Message } from "@openuidev/react-headless";
import { describe, expect, it } from "vitest";
import {
  getFollowingToolMessages,
  getInitialRendererState,
  getIsStreamingAssistantMessage,
} from "@/application/services/chat/genui-assistant-message";

describe("GenUI assistant message helpers", () => {
  it("detects whether the assistant message is currently streaming", () => {
    const messages: Message[] = [
      { id: "user-1", role: "user", content: "hi" },
      { id: "assistant-1", role: "assistant", content: "" },
      { id: "assistant-2", role: "assistant", content: "" },
    ];

    expect(getIsStreamingAssistantMessage(messages, true, "assistant-2")).toBe(true);
    expect(getIsStreamingAssistantMessage(messages, true, "assistant-1")).toBe(false);
    expect(getIsStreamingAssistantMessage(messages, false, "assistant-2")).toBe(false);
  });

  it("parses renderer state from OpenUI context", () => {
    expect(getInitialRendererState('[{"count":1}]')).toEqual({ count: 1 });
    expect(getInitialRendererState('{"count":1}')).toEqual({ count: 1 });
    expect(getInitialRendererState("not-json")).toBeUndefined();
    expect(getInitialRendererState(null)).toBeUndefined();
  });

  it("returns tool messages immediately following an assistant message", () => {
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
