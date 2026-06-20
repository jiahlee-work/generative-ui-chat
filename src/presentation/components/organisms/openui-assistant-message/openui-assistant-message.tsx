"use client";

import type { AssistantMessage } from "@openuidev/react-headless";
import { Renderer } from "@openuidev/react-lang";
import { Shell } from "@openuidev/react-ui";
import { useEffect, useMemo, useState } from "react";
import { useAssistantCopyAction } from "@/application/hooks/chat/use-assistant-copy-action";
import { useAssistantMessageState } from "@/application/hooks/chat/use-assistant-message-state";
import { useAssistantRendererActions } from "@/application/hooks/chat/use-assistant-renderer-actions";
import { useAssistantRendererContent } from "@/application/hooks/chat/use-assistant-renderer-content";
import { getShouldShowAssistantImageCopyButtons } from "@/application/services/chat/assistant-copy-dom";
import { getHasIncompleteDataImageSource } from "@/application/services/chat/openui-content";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";
import { ChatMessageActions } from "@/presentation/components/molecules/chat-message-actions";
import { OpenUIToolActivity } from "@/presentation/components/molecules/openui-tool-activity";
import { createOpenUIAssistantMessageLibrary } from "@/presentation/components/organisms/openui-assistant-message/openui-assistant-message-library";

type OpenUIAssistantMessageProps = {
  message: AssistantMessage;
};

export function OpenUIAssistantMessage(props: OpenUIAssistantMessageProps) {
  const { message } = props;
  const { initialState, openuiCode } = useAssistantRendererContent(message.content);
  const { handleAction, handleStateUpdate } = useAssistantRendererActions({
    message,
    openuiCode,
  });
  const { handleCopy, renderedResponseRef } = useAssistantCopyAction();
  const [showIndividualImageCopyButton, setShowIndividualImageCopyButton] = useState(false);
  const {
    handleRetry,
    isRunning,
    isStreaming,
    retryControl,
    shouldShowInterruptedNotice,
    toolMessages,
  } = useAssistantMessageState(message);
  const shouldDeferRenderer = isStreaming && getHasIncompleteDataImageSource(openuiCode);
  const openuiAssistantMessageLibrary = useMemo(
    () => createOpenUIAssistantMessageLibrary({ showIndividualImageCopyButton }),
    [showIndividualImageCopyButton],
  );

  useEffect(() => {
    if (!openuiCode) {
      setShowIndividualImageCopyButton(false);
      return;
    }

    if (shouldDeferRenderer) {
      setShowIndividualImageCopyButton(false);
      return;
    }

    const shouldShowImageCopyButton = getShouldShowAssistantImageCopyButtons(
      renderedResponseRef.current,
    );

    setShowIndividualImageCopyButton(shouldShowImageCopyButton);
  }, [openuiCode, renderedResponseRef, shouldDeferRenderer]);

  return (
    <Shell.AssistantMessageContainer>
      <OpenUIToolActivity isStreaming={isStreaming} message={message} toolMessages={toolMessages} />
      <div ref={renderedResponseRef}>
        {!shouldDeferRenderer && (
          <Renderer
            initialState={initialState}
            isStreaming={isStreaming}
            library={openuiAssistantMessageLibrary}
            onAction={handleAction}
            onStateUpdate={handleStateUpdate}
            response={openuiCode}
          />
        )}
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
        <ChatMessageActions
          onCopy={openuiCode ? handleCopy : undefined}
          onRetry={!shouldShowInterruptedNotice && retryControl.canRetry ? handleRetry : undefined}
          retryBlockedMessage={!shouldShowInterruptedNotice ? retryControl.blockedMessage : null}
        />
      )}
    </Shell.AssistantMessageContainer>
  );
}
