import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ChatMessageActions } from "@/presentation/components/molecules/chat-message-actions";

const meta = {
  title: "Chat/ChatMessageActions",
  component: ChatMessageActions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[320px] rounded-lg border border-current/10 p-4 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatMessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CopyAndRetry: Story = {
  args: {
    onCopy: fn(async () => true),
    onRetry: fn(),
  },
};

export const CopySuccessFeedback: Story = {
  args: {
    onCopy: fn(async () => true),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "응답 복사" }));
    await expect(canvas.getByRole("button", { name: "응답 복사 완료" })).toBeInTheDocument();
  },
};

export const CopyLoadingFeedback: Story = {
  args: {
    onCopy: fn(
      () =>
        new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(true), 2000);
        }),
    ),
  },
};

export const CopyFailureFeedback: Story = {
  args: {
    onCopy: fn(async () => false),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "응답 복사" }));
    await expect(canvas.getByRole("button", { name: "응답 복사 실패" })).toBeInTheDocument();
    await expect(canvas.getByText("복사를 실패했습니다.")).toBeInTheDocument();
  },
};

export const RetryBlocked: Story = {
  args: {
    retryBlockedMessage: "이미지는 다시 첨부해야 합니다.",
  },
};
