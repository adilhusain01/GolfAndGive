import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value?: number;
  max?: number;
};

export function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const percent = Math.round((value / max) * 100);

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
      />
    </div>
  );
}
