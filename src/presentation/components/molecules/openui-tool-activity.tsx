"use client";

import type { AssistantMessage, ToolMessage } from "@openuidev/react-headless";
import { BehindTheScenes, ToolCallComponent, ToolResult } from "@openuidev/react-ui";

type OpenUIToolActivityProps = {
  isStreaming: boolean;
  message: AssistantMessage;
  toolMessages: ToolMessage[];
};

export function OpenUIToolActivity(props: OpenUIToolActivityProps) {
  const { isStreaming, message, toolMessages } = props;
  const hasToolActivity = Boolean(message.toolCalls?.length) || toolMessages.length > 0;

  if (!hasToolActivity) {
    return null;
  }

  return (
    <BehindTheScenes isStreaming={isStreaming} toolCallsComplete={Boolean(message.content)}>
      {message.toolCalls?.map((toolCall, index) => (
        <ToolCallComponent
          isLast={index === (message.toolCalls?.length ?? 0) - 1 && toolMessages.length === 0}
          isStreaming={isStreaming}
          key={toolCall.id}
          toolCall={toolCall}
          toolsDone={Boolean(message.content)}
        />
      ))}
      {toolMessages.map((toolMessage) => (
        <ToolResult
          key={toolMessage.id}
          message={toolMessage}
          toolName={getToolName(message, toolMessage.toolCallId)}
        />
      ))}
    </BehindTheScenes>
  );
}

function getToolName(message: AssistantMessage, toolCallId: string) {
  const toolCall = message.toolCalls?.find((item) => item.id === toolCallId);

  return toolCall?.function.name;
}
