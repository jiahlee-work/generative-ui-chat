"use client";

import { type AssistantMessage, useThread } from "@openuidev/react-headless";
import { BuiltinActionType, Renderer } from "@openuidev/react-lang";
import { openuiLibrary, Shell } from "@openuidev/react-ui";
import { useCallback, useMemo, useRef } from "react";
import { useChatRetry } from "@/application/hooks/chat/use-chat-retry";
import { normalizeAssistantCopyText } from "@/application/services/chat/assistant-copy-text";
import { getAssistantResponseStatus } from "@/application/services/chat/assistant-response-status";
import {
  getFollowingToolMessages,
  getInitialRendererState,
  getIsLatestAssistantResponseMessage,
  getIsStreamingAssistantMessage,
} from "@/application/services/chat/genui-assistant-message";
import {
  separateOpenUIContent,
  wrapOpenUIContent,
  wrapOpenUIContext,
} from "@/application/services/chat/openui-content";
import { AssistantMessageActions } from "@/presentation/components/molecules/assistant-message-actions";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
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
  const threadError = useThread((state) => state.threadError);
  const updateMessage = useThread((state) => state.updateMessage);

  const renderedResponseRef = useRef<HTMLDivElement>(null);

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
  const isLatestAssistantResponse = useMemo(
    () => getIsLatestAssistantResponseMessage(messages, message.id),
    [message.id, messages],
  );
  const responseStatus = getAssistantResponseStatus(message);
  const canRetryAssistantResponse = !isRunning && !threadError && isLatestAssistantResponse;
  const { retryControl, handleRetry } = useChatRetry({
    isRetryTarget: canRetryAssistantResponse,
  });
  const shouldShowInterruptedNotice = responseStatus === "interrupted";

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

  const handleCopy = useCallback(async () => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const copyText = normalizeAssistantCopyText(renderedResponseRef.current?.innerText);

    if (!copyText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <Shell.AssistantMessageContainer>
      <GenUIToolActivity isStreaming={isStreaming} message={message} toolMessages={toolMessages} />
      <div ref={renderedResponseRef}>
        <Renderer
          initialState={initialState}
          isStreaming={isStreaming}
          library={openuiLibrary}
          onAction={handleAction}
          onStateUpdate={handleStateUpdate}
          response={openuiCode}
        />
      </div>
      {shouldShowInterruptedNotice && (
        <div className="mt-3">
          <AssistantResponseNotice
            message="응답 생성이 중단되었습니다."
            onRetry={retryControl.canRetry ? handleRetry : undefined}
            retryBlockedMessage={retryControl.blockedMessage}
          />
        </div>
      )}
      {!isRunning && (
        <AssistantMessageActions
          onCopy={openuiCode ? handleCopy : undefined}
          onRetry={!shouldShowInterruptedNotice && retryControl.canRetry ? handleRetry : undefined}
          retryBlockedMessage={!shouldShowInterruptedNotice ? retryControl.blockedMessage : null}
        />
      )}
    </Shell.AssistantMessageContainer>
  );
}
