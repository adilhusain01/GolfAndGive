import {
  type ImgHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement>;

type AvatarImageProps = ImgHTMLAttributes<HTMLImageElement>;

type AvatarFallbackProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <img className={cn("h-full w-full object-cover", className)} {...props} />
  );
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  );
}
