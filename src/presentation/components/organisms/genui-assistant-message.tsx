"use client";

import { type AssistantMessage, useThread } from "@openuidev/react-headless";
import { BuiltinActionType, Renderer } from "@openuidev/react-lang";
import { openuiLibrary, Shell } from "@openuidev/react-ui";
import { useCallback, useMemo } from "react";
import {
  getFollowingToolMessages,
  getInitialRendererState,
  getIsStreamingAssistantMessage,
} from "@/application/services/chat/genui-assistant-message";
import {
  separateOpenUIContent,
  wrapOpenUIContent,
  wrapOpenUIContext,
} from "@/application/services/chat/openui-content";
import { GenUIToolActivity } from "@/presentation/components/molecules/genui-tool-activity";

type RendererAction =
  NonNullable<Parameters<typeof Renderer>[0]["onAction"]> extends (event: infer ActionEvent) => void
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
  const isStreaming = useMemo(
    () => getIsStreamingAssistantMessage(messages, isRunning, message.id),
    [isRunning, message.id, messages],
  );
  const { content: openuiCode, contextString } = useMemo(() => {
    if (!message.content) {
      return {
        content: null,
        contextString: null,
      };
    }

    return separateOpenUIContent(message.content);
  }, [message.content]);
  const initialState = useMemo(() => getInitialRendererState(contextString), [contextString]);
  const toolMessages = useMemo(
    () => getFollowingToolMessages(messages, message.id),
    [message.id, messages],
  );

  const handleStateUpdate = useCallback(
    (state: Record<string, unknown>) => {
      const contextJson = JSON.stringify([state]);
      const fullMessage = `${openuiCode ?? ""}\n${wrapOpenUIContext(contextJson)}`;

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
        const messageContext: unknown[] = [`User clicked: ${event.humanFriendlyMessage}`];

        if (event.formState) {
          messageContext.push(event.formState);
        }

        processMessage({
          role: "user",
          content: `${contentPart}${wrapOpenUIContext(JSON.stringify(messageContext))}`,
        });
        return;
      }

      if (event.type === BuiltinActionType.OpenUrl && typeof window !== "undefined") {
        const url = event.params?.url;

        if (url) {
          window.open(String(url), "_blank");
        }
      }
    },
    [processMessage],
  );

  return (
    <Shell.AssistantMessageContainer>
      <GenUIToolActivity isStreaming={isStreaming} message={message} toolMessages={toolMessages} />
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
