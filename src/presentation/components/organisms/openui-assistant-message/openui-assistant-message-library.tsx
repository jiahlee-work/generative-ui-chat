import { createLibrary, defineComponent } from "@openuidev/react-lang";
import { openuiLibrary } from "@openuidev/react-ui";
import { z } from "zod/v4";
import {
  CopyableOpenUIImage,
  CopyableOpenUIImageBlock,
} from "@/presentation/components/molecules/copyable-openui-image";

const ImagePropsSchema = z.object({
  alt: z.string(),
  src: z.string().optional(),
});

const ImageBlockPropsSchema = z.object({
  alt: z.string().optional(),
  src: z.string(),
});

const CopyableImage = defineComponent({
  name: "Image",
  props: ImagePropsSchema,
  description: "Image with alt text and optional URL",
  component: ({ props }) => <CopyableOpenUIImage alt={props.alt} src={props.src ?? ""} />,
});

const CopyableImageBlock = defineComponent({
  name: "ImageBlock",
  props: ImageBlockPropsSchema,
  description: "Image block with loading state",
  component: ({ props }) => <CopyableOpenUIImageBlock alt={props.alt} src={props.src} />,
});

export const openuiAssistantMessageLibrary = createLibrary({
  root: openuiLibrary.root,
  componentGroups: openuiLibrary.componentGroups,
  components: Object.values(openuiLibrary.components).map((component) => {
    if (component.name === "Image") {
      return CopyableImage;
    }

    if (component.name === "ImageBlock") {
      return CopyableImageBlock;
    }

    return component;
  }),
});
