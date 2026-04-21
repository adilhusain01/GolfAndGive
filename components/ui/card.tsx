import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn("space-y-2 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardSectionProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardSectionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn("p-6", className)} {...props} />;
}
