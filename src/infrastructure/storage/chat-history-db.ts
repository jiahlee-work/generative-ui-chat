export type StoredThreadRecord = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
};

export type StoredAttachmentRecord = {
  id: string;
  threadId: string;
  messageId: string;
  blob: Blob;
  mimeType: string;
  filename?: string;
  size: number;
  createdAt: number;
};

export type StoredTextContentPart = {
  type: "text";
  text: string;
};

export type StoredBinaryContentPart = {
  type: "binary";
  attachmentId: string;
  mimeType: string;
  filename?: string;
};

export type StoredInputContentPart = StoredTextContentPart | StoredBinaryContentPart;

export type StoredMessageRecord = {
  id: string;
  threadId: string;
  role: string;
  content?: string | StoredInputContentPart[];
  toolCallId?: string;
  toolCalls?: unknown;
  createdAt: number;
  order: number;
};

const databaseName = "generative-ui-chat";
const databaseVersion = 1;
const threadsStoreName = "threads";
const messagesStoreName = "messages";
const attachmentsStoreName = "attachments";

let databasePromise: Promise<IDBDatabase> | null = null;

export async function listStoredThreads() {
  const database = await openDatabase();
  const threads = await getAllRecords<StoredThreadRecord>(database, threadsStoreName);

  return threads.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getStoredThread(threadId: string) {
  const database = await openDatabase();

  return requestToPromise<StoredThreadRecord | undefined>(
    database.transaction(threadsStoreName).objectStore(threadsStoreName).get(threadId),
  );
}

export async function saveStoredThread(thread: StoredThreadRecord) {
  const database = await openDatabase();
  const transaction = database.transaction(threadsStoreName, "readwrite");
  transaction.objectStore(threadsStoreName).put(thread);

  await transactionDone(transaction);
}

export async function getStoredMessages(threadId: string) {
  const database = await openDatabase();
  const messages = await getAllFromIndex<StoredMessageRecord>(
    database,
    messagesStoreName,
    "threadId",
    threadId,
  );

  return messages.sort((a, b) => a.order - b.order);
}

export async function replaceStoredMessages(
  threadId: string,
  messages: StoredMessageRecord[],
  attachments: StoredAttachmentRecord[],
) {
  const database = await openDatabase();
  const transaction = database.transaction([messagesStoreName, attachmentsStoreName], "readwrite");
  const messageStore = transaction.objectStore(messagesStoreName);
  const attachmentStore = transaction.objectStore(attachmentsStoreName);
  const currentMessages = await requestToPromise<StoredMessageRecord[]>(
    messageStore.index("threadId").getAll(threadId),
  );
  const currentAttachments = await requestToPromise<StoredAttachmentRecord[]>(
    attachmentStore.index("threadId").getAll(threadId),
  );
  const retainedAttachmentIds = getRetainedAttachmentIds(messages, attachments);

  for (const message of currentMessages) {
    messageStore.delete(message.id);
  }

  for (const attachment of currentAttachments) {
    if (!retainedAttachmentIds.has(attachment.id)) {
      attachmentStore.delete(attachment.id);
    }
  }

  for (const message of messages) {
    messageStore.put(message);
  }

  for (const attachment of attachments) {
    attachmentStore.put(attachment);
  }

  await transactionDone(transaction);
}

function getRetainedAttachmentIds(
  messages: StoredMessageRecord[],
  attachments: StoredAttachmentRecord[],
) {
  const attachmentIds = new Set(attachments.map((attachment) => attachment.id));

  for (const message of messages) {
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const part of message.content) {
      if (part.type === "binary") {
        attachmentIds.add(part.attachmentId);
      }
    }
  }

  return attachmentIds;
}

export async function getStoredAttachment(attachmentId: string) {
  const database = await openDatabase();

  return requestToPromise<StoredAttachmentRecord | undefined>(
    database.transaction(attachmentsStoreName).objectStore(attachmentsStoreName).get(attachmentId),
  );
}

export async function deleteStoredThread(threadId: string) {
  const database = await openDatabase();
  const transaction = database.transaction(
    [threadsStoreName, messagesStoreName, attachmentsStoreName],
    "readwrite",
  );
  const threadStore = transaction.objectStore(threadsStoreName);
  const messageStore = transaction.objectStore(messagesStoreName);
  const attachmentStore = transaction.objectStore(attachmentsStoreName);
  const messages = await requestToPromise<StoredMessageRecord[]>(
    messageStore.index("threadId").getAll(threadId),
  );
  const attachments = await requestToPromise<StoredAttachmentRecord[]>(
    attachmentStore.index("threadId").getAll(threadId),
  );

  threadStore.delete(threadId);

  for (const message of messages) {
    messageStore.delete(message.id);
  }

  for (const attachment of attachments) {
    attachmentStore.delete(attachment.id);
  }

  await transactionDone(transaction);
}

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion);

      request.onupgradeneeded = () => {
        const database = request.result;

        if (!database.objectStoreNames.contains(threadsStoreName)) {
          database.createObjectStore(threadsStoreName, { keyPath: "id" });
        }

        if (!database.objectStoreNames.contains(messagesStoreName)) {
          const messageStore = database.createObjectStore(messagesStoreName, {
            keyPath: "id",
          });
          messageStore.createIndex("threadId", "threadId");
        }

        if (!database.objectStoreNames.contains(attachmentsStoreName)) {
          const attachmentStore = database.createObjectStore(attachmentsStoreName, {
            keyPath: "id",
          });
          attachmentStore.createIndex("threadId", "threadId");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return databasePromise;
}

function getAllRecords<TRecord>(database: IDBDatabase, storeName: string): Promise<TRecord[]> {
  const transaction = database.transaction(storeName);

  return requestToPromise<TRecord[]>(transaction.objectStore(storeName).getAll());
}

function getAllFromIndex<TRecord>(
  database: IDBDatabase,
  storeName: string,
  indexName: string,
  query: IDBValidKey,
): Promise<TRecord[]> {
  const transaction = database.transaction(storeName);

  return requestToPromise<TRecord[]>(
    transaction.objectStore(storeName).index(indexName).getAll(query),
  );
}

function requestToPromise<TResult>(request: IDBRequest): Promise<TResult> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as TResult);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
