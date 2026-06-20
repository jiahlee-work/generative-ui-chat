import type { UserMessage } from "@openuidev/react-headless";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { ChatUserMessage } from "@/presentation/components/organisms/chat-user-message/chat-user-message";

const previewDataUrl =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'><rect width='160' height='160' fill='%23f3f4f6'/><text x='80' y='86' text-anchor='middle' font-family='Arial' font-size='32' fill='%23111827'>1+1</text></svg>";

const createUserMessage = (content: UserMessage["content"]): UserMessage => {
  return {
    id: "user-message",
    role: "user",
    content,
  };
};

const meta = {
  title: "Chat/ChatUserMessage",
  component: ChatUserMessage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[min(560px,calc(100vw-32px))]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatUserMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextOnly: Story = {
  args: {
    message: createUserMessage("이미지에 보이는 수식 계산"),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("button", { name: "사용자 메시지 복사" })).toBeInTheDocument();
  },
};

export const ImageAndText: Story = {
  args: {
    message: createUserMessage([
      {
        type: "binary",
        mimeType: "image/svg+xml",
        filename: "formula.svg",
        url: previewDataUrl,
      },
      {
        type: "text",
        text: "이미지에 보이는 수식 계산",
      },
    ]),
  },
};

export const UnavailableImage: Story = {
  args: {
    message: createUserMessage([
      {
        type: "text",
        text: "[이미지를 불러올 수 없습니다: deleted-image.png]",
      },
      {
        type: "text",
        text: "이미지는 다시 첨부해야 합니다.",
      },
    ]),
  },
};

export const MixedImages: Story = {
  args: {
    message: createUserMessage([
      {
        type: "binary",
        mimeType: "image/svg+xml",
        filename: "formula.svg",
        url: previewDataUrl,
      },
      {
        type: "text",
        text: "[이미지를 불러올 수 없습니다: deleted-image.png]",
      },
      {
        type: "text",
        text: "첫 번째 이미지만 복원됐어.",
      },
    ]),
  },
};
