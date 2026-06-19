"use client";

import type { AssistantMessage } from "@openuidev/react-headless";
import { Renderer } from "@openuidev/react-lang";
import { openuiLibrary, Shell } from "@openuidev/react-ui";
import { useAssistantCopyAction } from "@/application/hooks/chat/use-assistant-copy-action";
import { useAssistantMessageState } from "@/application/hooks/chat/use-assistant-message-state";
import { useAssistantRendererActions } from "@/application/hooks/chat/use-assistant-renderer-actions";
import { useAssistantRendererContent } from "@/application/hooks/chat/use-assistant-renderer-content";
import { AssistantMessageActions } from "@/presentation/components/molecules/assistant-message-actions";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
import { GenUIToolActivity } from "@/presentation/components/molecules/genui-tool-activity";

type GenUIAssistantMessageProps = {
  message: AssistantMessage;
};

export function GenUIAssistantMessage(props: GenUIAssistantMessageProps) {
  const { message } = props;
  const { initialState, openuiCode } = useAssistantRendererContent(message.content);
  const { handleAction, handleStateUpdate } = useAssistantRendererActions({
    message,
    openuiCode,
  });
  const { handleCopy, renderedResponseRef } = useAssistantCopyAction();
  const {
    handleRetry,
    isRunning,
    isStreaming,
    retryControl,
    shouldShowInterruptedNotice,
    toolMessages,
  } = useAssistantMessageState(message);

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
