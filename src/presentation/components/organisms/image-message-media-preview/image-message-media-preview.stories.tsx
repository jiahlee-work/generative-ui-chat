import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageMessageMediaPreview } from "@/presentation/components/organisms/image-message-media-preview/image-message-media-preview";

const previewDataUrl =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><rect width='160' height='160' fill='%23f3f4f6'/><text x='80' y='86' text-anchor='middle' font-family='Arial' font-size='32' fill='%23111827'>1+1</text></svg>";

const meta = {
  title: "Chat/ImageMessageMediaPreview",
  component: ImageMessageMediaPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ImageMessageMediaPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    part: {
      imageIndex: 0,
      part: {
        type: "binary",
        mimeType: "image/svg+xml",
        filename: "formula.svg",
        url: previewDataUrl,
      },
      type: "image",
    },
    previewItems: [
      {
        alt: "formula.svg",
        src: previewDataUrl,
      },
    ],
  },
};

export const UnavailableImage: Story = {
  args: {
    part: {
      part: {
        filename: "deleted-image.png",
        key: "unavailable-image:0:deleted-image.png",
      },
      type: "unavailableImage",
    },
    previewItems: [],
  },
};
