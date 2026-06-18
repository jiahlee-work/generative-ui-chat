"use client";

import { useThread } from "@openuidev/react-headless";
import { ImageComposer } from "@/presentation/components/organisms/image-composer";

export function ChatComposer() {
  const cancelMessage = useThread((state) => state.cancelMessage);
  const isLoadingMessages = useThread((state) => state.isLoadingMessages);
  const isRunning = useThread((state) => state.isRunning);

  return (
    <ImageComposer
      isLoadingMessages={isLoadingMessages}
      isRunning={isRunning}
      onCancel={cancelMessage}
    />
  );
}
