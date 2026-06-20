import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadLocalThread } from "@/application/services/chat/chat-history";
import { createBlobObjectUrl, revokeBlobObjectUrls } from "@/infrastructure/browser/image-files";
import { getStoredAttachment, getStoredMessages } from "@/infrastructure/storage/chat-history-db";

vi.mock("@/infrastructure/browser/image-files", () => {
  return {
    createBlobObjectUrl: vi.fn(),
    revokeBlobObjectUrls: vi.fn(),
  };
});

vi.mock("@/infrastructure/storage/chat-history-db", () => {
  return {
    deleteStoredThread: vi.fn(),
    getStoredAttachment: vi.fn(),
    getStoredMessages: vi.fn(),
    getStoredThread: vi.fn(),
    listStoredThreads: vi.fn(),
    replaceStoredMessages: vi.fn(),
    saveStoredThread: vi.fn(),
  };
});

describe("로컬 채팅 이미지 복원", () => {
  beforeEach(() => {
    vi.mocked(createBlobObjectUrl).mockReset();
    vi.mocked(getStoredAttachment).mockReset();
    vi.mocked(getStoredMessages).mockReset();
    vi.mocked(revokeBlobObjectUrls).mockReset();
  });

  it("저장된 이미지 blob이 삭제되었으면 깨진 이미지 안내로 복원한다", async () => {
    vi.mocked(getStoredMessages).mockResolvedValue([
      {
        id: "message-1",
        threadId: "thread-1",
        role: "user",
        content: [
          { type: "text", text: "이미지 설명" },
          {
            type: "binary",
            attachmentId: "missing-attachment",
            mimeType: "image/png",
            filename: "missing.png",
          },
        ],
        createdAt: 1,
        order: 0,
      },
    ]);
    vi.mocked(getStoredAttachment).mockResolvedValue(undefined);

    const [message] = await loadLocalThread("thread-1");

    expect(revokeBlobObjectUrls).toHaveBeenCalledOnce();
    expect(message?.content).toEqual([
      { type: "text", text: "이미지 설명" },
      { type: "text", text: "[이미지를 불러올 수 없습니다: missing.png]" },
    ]);
  });

  it("저장된 이미지 object URL 생성에 실패해도 thread 로드를 유지한다", async () => {
    vi.mocked(getStoredMessages).mockResolvedValue([
      {
        id: "message-1",
        threadId: "thread-1",
        role: "user",
        content: [
          {
            type: "binary",
            attachmentId: "broken-attachment",
            mimeType: "image/png",
            filename: "broken.png",
          },
        ],
        createdAt: 1,
        order: 0,
      },
    ]);
    vi.mocked(getStoredAttachment).mockResolvedValue({
      id: "broken-attachment",
      threadId: "thread-1",
      messageId: "message-1",
      blob: new Blob(["image"], { type: "image/png" }),
      mimeType: "image/png",
      filename: "broken.png",
      size: 5,
      createdAt: 1,
    });
    vi.mocked(createBlobObjectUrl).mockImplementation(() => {
      throw new Error("Object URL unavailable.");
    });

    const [message] = await loadLocalThread("thread-1");

    expect(message?.content).toEqual([
      { type: "text", text: "[이미지를 불러올 수 없습니다: broken.png]" },
    ]);
  });
});
