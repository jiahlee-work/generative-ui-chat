import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AssistantResponseNotice } from "@/presentation/components/molecules/assistant-response-notice";

const meta = {
  title: "Chat/AssistantResponseNotice",
  component: AssistantResponseNotice,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(680px,calc(100vw-32px))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AssistantResponseNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interrupted: Story = {
  args: {
    message: "응답 생성이 중단되었습니다.",
    onRetry: fn(),
  },
};

export const RetryBlocked: Story = {
  args: {
    message: "응답 생성이 중단되었습니다.",
    retryBlockedMessage: "이미지는 다시 첨부해야 합니다.",
  },
};

export const ErrorNotice: Story = {
  args: {
    message: "응답을 생성하지 못했습니다.",
    onRetry: fn(),
    tone: "error",
  },
};
