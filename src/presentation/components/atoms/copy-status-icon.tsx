import { Check, Copy, Loader2, TriangleAlert } from "lucide-react";
import type { CopyActionState } from "@/application/hooks/chat/copy-action-state";

type CopyStatusIconProps = {
  copyState: CopyActionState;
  size?: number;
};

export function CopyStatusIcon(props: CopyStatusIconProps) {
  const { copyState, size = 16 } = props;

  if (copyState === "copying") {
    return <Loader2 className="animate-spin" size={size} />;
  }

  if (copyState === "copied") {
    return <Check size={size} />;
  }

  if (copyState === "failed") {
    return <TriangleAlert size={size} />;
  }

  return <Copy size={size} />;
}
