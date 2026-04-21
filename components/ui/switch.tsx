import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SwitchProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Switch({
  className,
  checked = false,
  onCheckedChange,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border border-border bg-muted p-1 transition-colors",
        checked && "bg-primary",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "block h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
