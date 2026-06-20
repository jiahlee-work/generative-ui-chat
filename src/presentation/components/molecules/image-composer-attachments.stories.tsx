import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ImageComposerAttachments } from "@/presentation/components/molecules/image-composer-attachments";

const previewDataUrl =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><rect width='160' height='160' fill='%23e5e7eb'/><path d='M28 116l34-42 26 30 18-22 26 34H28z' fill='%239ca3af'/><circle cx='110' cy='48' r='14' fill='%23f9fafb'/></svg>";

const meta = {
  title: "Chat/ImageComposerAttachments",
  component: ImageComposerAttachments,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: {
    onRemoveImage: fn(),
  },
} satisfies Meta<typeof ImageComposerAttachments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AttachedImages: Story = {
  args: {
    attachments: [
      {
        id: "image-1",
        name: "math-question.png",
        dataUrl: previewDataUrl,
        mimeType: "image/png",
        size: 1200,
      },
      {
        id: "image-2",
        name: "solution.png",
        dataUrl: previewDataUrl,
        mimeType: "image/png",
        size: 980,
      },
    ],
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    ...AttachedImages.args,
    isDisabled: true,
  },
};
