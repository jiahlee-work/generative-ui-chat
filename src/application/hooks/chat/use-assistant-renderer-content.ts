"use client";

import type { AssistantMessage } from "@openuidev/react-headless";
import { useMemo } from "react";
import { getInitialRendererState } from "@/application/services/chat/genui-assistant-message";
import { separateOpenUIContent } from "@/application/services/chat/openui-content";

export function useAssistantRendererContent(content: AssistantMessage["content"]) {
  const openUIContent = useMemo(() => {
    return getAssistantOpenUIContent(content);
  }, [content]);

  const initialState = useMemo(() => {
    return getInitialRendererState(openUIContent.contextString);
  }, [openUIContent.contextString]);

  return {
    initialState,
    openuiCode: openUIContent.content,
  };
}

function getAssistantOpenUIContent(content: AssistantMessage["content"]) {
  if (!content) {
    return {
      content: null,
      contextString: null,
    };
  }

  return separateOpenUIContent(content);
}
