"use client";

import {
  type AssistantMessage,
  type ToolMessage,
  useThread,
} from "@openuidev/react-headless";
import { BuiltinActionType, Renderer } from "@openuidev/react-lang";
import {
  BehindTheScenes,
  Shell,
  ToolCallComponent,
  ToolResult,
  openuiLibrary,
} from "@openuidev/react-ui";
import { useCallback, useMemo } from "react";
import {
  separateOpenUIContent,
  wrapOpenUIContent,
  wrapOpenUIContext,
} from "@/presentation/chat/lib/message/openui-content";

type RendererAction = NonNullable<
  Parameters<typeof Renderer>[0]["onAction"]
> extends (event: infer ActionEvent) => void
  ? ActionEvent
  : never;

type GenUIAssistantMessageProps = {
  message: AssistantMessage;
};

export function GenUIAssistantMessage(props: GenUIAssistantMessageProps) {
  const { message } = props;
  const messages = useThread((state) => state.messages);
  const isRunning = useThread((state) => state.isRunning);
  const processMessage = useThread((state) => state.processMessage);
  const updateMessage = useThread((state) => state.updateMessage);
  const isStreaming = useMemo(() => {
    if (!isRunning) {
      return false;
    }

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "assistant") {
        return messages[index]?.id === message.id;
      }
    }

    return false;
  }, [isRunning, message.id, messages]);
  const { content: openuiCode, contextString } = useMemo(() => {
    if (!message.content) {
      return {
        content: null,
        contextString: null,
      };
    }

    return separateOpenUIContent(message.content);
  }, [message.content]);
  const initialState = useMemo(() => {
    if (!contextString) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(contextString);

      if (Array.isArray(parsed) && typeof parsed[0] === "object") {
        return parsed[0];
      }

      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return undefined;
    }

    return undefined;
  }, [contextString]);
  const toolMessages = useMemo(() => {
    const result: ToolMessage[] = [];
    const messageIndex = messages.findIndex((item) => item.id === message.id);

    if (messageIndex === -1) {
      return result;
    }

    for (let index = messageIndex + 1; index < messages.length; index += 1) {
      const item = messages[index];

      if (item?.role === "tool") {
        result.push(item);
        continue;
      }

      break;
    }

    return result;
  }, [message.id, messages]);

  const getToolName = (toolCallId: string) => {
    const toolCall = message.toolCalls?.find((item) => item.id === toolCallId);

    return toolCall?.function.name;
  };

  const handleStateUpdate = useCallback(
    (state: Record<string, unknown>) => {
      const contextJson = JSON.stringify([state]);
      const fullMessage = `${openuiCode ?? ""}\n${wrapOpenUIContext(
        contextJson,
      )}`;

      updateMessage({
        ...message,
        content: fullMessage,
      });
    },
    [message, openuiCode, updateMessage],
  );

  const handleAction = useCallback(
    (event: RendererAction) => {
      if (event.type === BuiltinActionType.ContinueConversation) {
        const contentPart = event.humanFriendlyMessage
          ? wrapOpenUIContent(event.humanFriendlyMessage)
          : "";
        const messageContext: unknown[] = [
          `User clicked: ${event.humanFriendlyMessage}`,
        ];

        if (event.formState) {
          messageContext.push(event.formState);
        }

        processMessage({
          role: "user",
          content: `${contentPart}${wrapOpenUIContext(
            JSON.stringify(messageContext),
          )}`,
        });
        return;
      }

      if (
        event.type === BuiltinActionType.OpenUrl &&
        typeof window !== "undefined"
      ) {
        const url = event.params?.url;

        if (url) {
          window.open(String(url), "_blank");
        }
      }
    },
    [processMessage],
  );
  const hasToolActivity =
    Boolean(message.toolCalls?.length) || toolMessages.length > 0;

  return (
    <Shell.AssistantMessageContainer>
      {hasToolActivity && (
        <BehindTheScenes
          isStreaming={isStreaming}
          toolCallsComplete={Boolean(message.content)}
        >
          {message.toolCalls?.map((toolCall, index) => (
            <ToolCallComponent
              isLast={
                index === (message.toolCalls?.length ?? 0) - 1 &&
                toolMessages.length === 0
              }
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
              toolName={getToolName(toolMessage.toolCallId)}
            />
          ))}
        </BehindTheScenes>
      )}
      <Renderer
        initialState={initialState}
        isStreaming={isStreaming}
        library={openuiLibrary}
        onAction={handleAction}
        onStateUpdate={handleStateUpdate}
        response={openuiCode}
      />
    </Shell.AssistantMessageContainer>
  );
}
