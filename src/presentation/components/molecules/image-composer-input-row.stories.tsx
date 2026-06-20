import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ComponentProps, useRef } from "react";
import { fn } from "storybook/test";
import { ImageComposerInputRow } from "@/presentation/components/molecules/image-composer-input-row";

type StoryArgs = Omit<
  ComponentProps<typeof ImageComposerInputRow>,
  "fileInputRef" | "textareaRef"
>;

function ImageComposerInputRowStory(args: StoryArgs) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <ImageComposerInputRow
      {...args}
      fileInputRef={fileInputRef}
      textareaRef={textareaRef}
    />
  );
}

const meta = {
  title: "Chat/ImageComposerInputRow",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  render: (args) => <ImageComposerInputRowStory {...args} />,
  decorators: [
    (Story) => (
      <div className="w-[min(680px,calc(100vw-32px))] rounded-[14px] border border-current/15 bg-[color-mix(in_srgb,var(--background)_92%,currentColor_4%)] p-2.5">
        <Story />
      </div>
    ),
  ],
  args: {
    onCancel: fn(),
    onChangeText: fn(),
    onKeyDown: fn(),
    onPaste: fn(),
    onSelectImages: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    canSelectImages: true,
    canSubmit: false,
    hasMultilineInput: false,
    isDisabled: false,
    isRunning: false,
    textContent: "",
  },
};

export const WithText: Story = {
  args: {
    ...Empty.args,
    canSubmit: true,
    textContent: "이미지에 보이는 수식을 계산해줘",
  },
};

export const Multiline: Story = {
  args: {
    ...WithText.args,
    hasMultilineInput: true,
    textContent: "이미지에 보이는 수식을 계산하고\n풀이 과정을 짧게 설명해줘",
  },
};

export const Running: Story = {
  args: {
    ...WithText.args,
    canSubmit: false,
    isRunning: true,
  },
};

export const Disabled: Story = {
  args: {
    ...WithText.args,
    canSelectImages: false,
    canSubmit: false,
    isDisabled: true,
  },
};
