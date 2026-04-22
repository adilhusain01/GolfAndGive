import Image from "next/image";
import {
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type AvatarProps = HTMLAttributes<HTMLDivElement>;

type AvatarImageProps = {
  alt?: string;
  className?: string;
  src?: string;
};

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
  if (!props.src) return null;

  return (
    <Image
      src={props.src}
      alt={props.alt ?? ""}
      fill
      sizes="64px"
      className={cn("object-cover", className)}
      unoptimized
    />
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
