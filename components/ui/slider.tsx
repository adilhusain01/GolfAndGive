import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-muted transition duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      {...props}
    />
  );
}
