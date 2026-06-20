import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageComposerStatus } from "@/presentation/components/molecules/image-composer-status";

const meta = {
  title: "Chat/ImageComposerStatus",
  component: ImageComposerStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageComposerStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: {
    attachmentStatus: "ready",
    attachmentStatusMessage: "이미지 2개가 첨부되었습니다.",
  },
};

export const Failed: Story = {
  args: {
    attachmentStatus: "failed",
    attachmentStatusMessage: "지원하지 않는 이미지 형식입니다.",
  },
};

export const Hidden: Story = {
  args: {
    attachmentStatus: "idle",
    attachmentStatusMessage: null,
  },
};
