"use client";

import { type AssistantMessage, useThread } from "@openuidev/react-headless";
import { BuiltinActionType, Renderer } from "@openuidev/react-lang";
import { useCallback } from "react";
import { wrapOpenUIContent, wrapOpenUIContext } from "@/application/services/chat/openui-content";

type RendererAction =
  NonNullable<Parameters<typeof Renderer>[0]["onAction"]> extends (event: infer ActionEvent) => void
    ? ActionEvent
    : never;

type UseAssistantRendererActionsProps = {
  message: AssistantMessage;
  openuiCode: string | null;
};

export function useAssistantRendererActions(props: UseAssistantRendererActionsProps) {
  const { message, openuiCode } = props;
  const processMessage = useThread((state) => state.processMessage);
  const updateMessage = useThread((state) => state.updateMessage);

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

  return {
    handleAction,
    handleStateUpdate,
  };
}
