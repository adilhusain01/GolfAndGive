import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        orientation === "vertical"
          ? "h-full w-px bg-border"
          : "h-px w-full bg-border",
        className,
      )}
      {...props}
    />
  );
}
