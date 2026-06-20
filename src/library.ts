import { openuiLibrary, openuiPromptOptions } from "@openuidev/react-ui/genui-lib";

const appAdditionalRules = [
  "Never invent or guess external image URLs. Do not use placeholder hosts, random image hosts, or relative paths for Image/ImageBlock sources.",
  "Use Image/ImageBlock only when the user provided the exact image URL/data URL, or when you create a self-contained data:image/svg+xml image source in the response.",
  "For requests to create, draw, or generate a simple image, render a self-contained SVG data URL instead of linking to an external image service.",
  "For generated inline images, prefer Image and always use this exact argument order: Image(\"human-readable alt text\", \"data:image/svg+xml,...\"). Never put a data:image source in the first Image argument.",
  "Image and ImageBlock have different argument order: Image(alt, src) but ImageBlock(src, alt). Check the signature before emitting either component.",
  "If the requested image cannot be represented as a simple inline SVG, respond with TextContent explaining that this chat cannot generate a photorealistic image.",
];

export const library = openuiLibrary;
export const promptOptions = {
  ...openuiPromptOptions,
  additionalRules: [...(openuiPromptOptions.additionalRules ?? []), ...appAdditionalRules],
};
