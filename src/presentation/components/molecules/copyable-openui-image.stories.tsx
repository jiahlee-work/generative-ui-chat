import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CopyableOpenUIImage,
  CopyableOpenUIImageBlock,
} from "@/presentation/components/molecules/copyable-openui-image";

const previewImage =
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22600%22%20height%3D%22400%22%20viewBox%3D%220%200%20600%20400%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20rx%3D%2224%22%20fill%3D%22%23e8eef7%22/%3E%3Ccircle%20cx%3D%22170%22%20cy%3D%22155%22%20r%3D%2258%22%20fill%3D%22%2386a8d8%22/%3E%3Cpath%20d%3D%22M70%20320%20196%20220%20305%20292%20386%20220%20530%20320Z%22%20fill%3D%22%233d5f8f%22/%3E%3C/svg%3E";

const meta = {
  title: "Chat/CopyableOpenUIImage",
  component: CopyableOpenUIImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[420px] text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyableOpenUIImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Image: Story = {
  args: {
    alt: "미리보기 이미지",
    src: previewImage,
  },
};

export const ImageBlock: Story = {
  args: {
    alt: "미리보기 이미지",
    src: previewImage,
  },
  render: (args) => <CopyableOpenUIImageBlock {...args} />,
};
