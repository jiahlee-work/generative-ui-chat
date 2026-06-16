import type {
  BinaryInputContent,
  InputContent,
  Message,
  Thread,
  UserMessage,
} from "@openuidev/react-headless";
import {
  createBlobObjectUrl,
  revokeBlobObjectUrls,
} from "@/infrastructure/browser/image-files";
import {
  deleteStoredThread,
  getStoredAttachment,
  getStoredMessages,
  getStoredThread,
  listStoredThreads,
  replaceStoredMessages,
  saveStoredThread,
  type StoredAttachmentRecord,
  type StoredInputContentPart,
  type StoredMessageRecord,
  type StoredThreadRecord,
} from "@/infrastructure/storage/chat-history-db";

type StoredBinaryInputContent = BinaryInputContent & {
  attachmentId?: string;
};

export async function fetchLocalThreads() {
  const threads = await listStoredThreads();

  return {
    threads: threads.map(toOpenUIThread),
  };
}

export async function createLocalThread(firstMessage: UserMessage) {
  const now = Date.now();
  const thread = {
    id: crypto.randomUUID(),
    title: createThreadTitle(firstMessage),
    createdAt: now,
    updatedAt: now,
  };

  await saveStoredThread(thread);
  await saveLocalThreadMessages(thread.id, [firstMessage]);

  return toOpenUIThread(thread);
}

export async function updateLocalThread(thread: Thread) {
  const existingThread = await getStoredThread(thread.id);
  const updatedThread = {
    id: thread.id,
    title: thread.title,
    createdAt: Number(thread.createdAt),
    updatedAt: existingThread?.updatedAt ?? Date.now(),
  };

  await saveStoredThread(updatedThread);

  return toOpenUIThread(updatedThread);
}

export async function deleteLocalThread(threadId: string) {
  await deleteStoredThread(threadId);
  revokeBlobObjectUrls();
}

export async function loadLocalThread(threadId: string) {
  revokeBlobObjectUrls();

  const storedMessages = await getStoredMessages(threadId);

  return Promise.all(storedMessages.map(fromStoredMessage));
}

export async function saveLocalThreadMessages(
  threadId: string,
  messages: Message[],
) {
  const existingThread = await getStoredThread(threadId);

  if (!existingThread) {
    return;
  }

  const now = Date.now();
  const storedMessages: StoredMessageRecord[] = [];
  const storedAttachments: StoredAttachmentRecord[] = [];

  for (const [order, message] of messages.entries()) {
    const { storedMessage, attachments } = await toStoredMessage(
      threadId,
      message,
      order,
      now,
    );

    storedMessages.push(storedMessage);
    storedAttachments.push(...attachments);
  }

  await replaceStoredMessages(threadId, storedMessages, storedAttachments);
  await saveStoredThread({
    ...existingThread,
    title: existingThread.title || createThreadTitleFromMessages(messages),
    updatedAt: now,
  });
}

export function prepareMessagesForChatRequest(messages: Message[]) {
  const latestUserMessageId = findLatestUserMessageId(messages);

  return messages.map((message) => {
    if (message.role !== "user" || typeof message.content === "string") {
      return message;
    }

    return {
      ...message,
      content: prepareInputContentForRequest(
        message.content,
        message.id === latestUserMessageId,
      ),
    };
  });
}

export function createThreadTitle(firstMessage: UserMessage) {
  const text = getMessageText(firstMessage);

  if (text.length > 0) {
    return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }

  return "이미지 채팅";
}

function createThreadTitleFromMessages(messages: Message[]) {
  const firstUserMessage = messages.find(
    (message): message is UserMessage => message.role === "user",
  );

  if (!firstUserMessage) {
    return "새 채팅";
  }

  return createThreadTitle(firstUserMessage);
}

function toOpenUIThread(thread: StoredThreadRecord): Thread {
  return {
    id: thread.id,
    title: thread.title,
    createdAt: thread.createdAt,
  };
}

async function toStoredMessage(
  threadId: string,
  message: Message,
  order: number,
  createdAt: number,
) {
  const attachments: StoredAttachmentRecord[] = [];
  const content = await getStoredMessageContent(threadId, message, attachments);
  const storedMessage: StoredMessageRecord = {
    id: message.id,
    threadId,
    role: message.role,
    content,
    createdAt,
    order,
  };

  if ("toolCallId" in message && typeof message.toolCallId === "string") {
    storedMessage.toolCallId = message.toolCallId;
  }

  if ("toolCalls" in message) {
    storedMessage.toolCalls = message.toolCalls;
  }

  return {
    storedMessage,
    attachments,
  };
}

async function getStoredMessageContent(
  threadId: string,
  message: Message,
  attachments: StoredAttachmentRecord[],
) {
  if (message.role === "user" && Array.isArray(message.content)) {
    return toStoredInputContent(
      threadId,
      message.id,
      message.content,
      attachments,
    );
  }

  return typeof message.content === "string" ? message.content : undefined;
}

async function toStoredInputContent(
  threadId: string,
  messageId: string,
  content: InputContent[],
  attachments: StoredAttachmentRecord[],
) {
  const storedParts: StoredInputContentPart[] = [];

  for (const [index, part] of content.entries()) {
    if (part.type === "text") {
      storedParts.push({
        type: "text",
        text: part.text,
      });
      continue;
    }

    const binaryPart = part as StoredBinaryInputContent;
    const attachmentId = binaryPart.attachmentId ?? `${messageId}-${index}`;
    const blob = await getBlobFromBinaryPart(binaryPart).catch(() => null);

    storedParts.push({
      type: "binary",
      attachmentId,
      mimeType: binaryPart.mimeType,
      filename: binaryPart.filename,
    });

    if (blob) {
      attachments.push({
        id: attachmentId,
        threadId,
        messageId,
        blob,
        mimeType: binaryPart.mimeType,
        filename: binaryPart.filename,
        size: blob.size,
        createdAt: Date.now(),
      });
    }
  }

  return storedParts;
}

async function getBlobFromBinaryPart(part: StoredBinaryInputContent) {
  if (part.url?.startsWith("data:") || part.url?.startsWith("blob:")) {
    const response = await fetch(part.url);

    return response.blob();
  }

  if (part.data) {
    const response = await fetch(`data:${part.mimeType};base64,${part.data}`);

    return response.blob();
  }

  if (part.attachmentId) {
    const storedAttachment = await getStoredAttachment(part.attachmentId);

    return storedAttachment?.blob ?? null;
  }

  return null;
}

async function fromStoredMessage(
  message: StoredMessageRecord,
): Promise<Message> {
  if (Array.isArray(message.content)) {
    return {
      id: message.id,
      role: "user",
      content: await fromStoredInputContent(message.content),
    };
  }

  if (message.role === "assistant") {
    return {
      id: message.id,
      role: "assistant",
      content: message.content,
      toolCalls: Array.isArray(message.toolCalls)
        ? message.toolCalls
        : undefined,
    };
  }

  if (message.role === "tool") {
    return {
      id: message.id,
      role: "tool",
      content: message.content ?? "",
      toolCallId: message.toolCallId ?? "",
    };
  }

  return {
    id: message.id,
    role: "user",
    content: message.content ?? "",
  };
}

async function fromStoredInputContent(content: StoredInputContentPart[]) {
  const restoredParts: InputContent[] = [];

  for (const part of content) {
    if (part.type === "text") {
      restoredParts.push({
        type: "text",
        text: part.text,
      });
      continue;
    }

    const attachment = await getStoredAttachment(part.attachmentId).catch(
      () => undefined,
    );

    if (!attachment) {
      restoredParts.push({
        type: "text",
        text: getUnavailableImageText(part.filename),
      });
      continue;
    }

    restoredParts.push({
      type: "binary",
      mimeType: part.mimeType,
      filename: part.filename,
      url: createBlobObjectUrl(attachment.blob),
      attachmentId: part.attachmentId,
    } as StoredBinaryInputContent);
  }

  return restoredParts;
}

function prepareInputContentForRequest(
  content: InputContent[],
  isLatestUserMessage: boolean,
) {
  return content.flatMap((part): InputContent[] => {
    if (part.type === "text") {
      return [part];
    }

    if (isLatestUserMessage && part.url?.startsWith("data:image/")) {
      return [part];
    }

    return [
      {
        type: "text",
        text: `[로컬 히스토리에 보관된 이미지: ${part.filename ?? "첨부 파일"}]`,
      },
    ];
  });
}

function getUnavailableImageText(filename?: string) {
  return `[이미지를 불러올 수 없습니다: ${filename ?? "첨부 파일"}]`;
}

function findLatestUserMessageId(messages: Message[]) {
  return messages.findLast((message) => message.role === "user")?.id;
}

function getMessageText(message: UserMessage) {
  if (typeof message.content === "string") {
    return message.content.trim();
  }

  return message.content
    .filter((part) => part.type === "text")
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ");
}
