import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "destructive"
  | "secondary"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground shadow-[0_14px_30px_hsl(var(--primary)/0.18)] hover:bg-primary/92",
  outline:
    "border border-border/80 bg-background/80 hover:bg-secondary/70 backdrop-blur",
  ghost: "bg-transparent hover:bg-secondary/60",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  link: "text-primary underline-offset-4 hover:underline bg-transparent p-0",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-11 px-4 py-2",
  sm: "h-9 rounded-full px-3",
  lg: "h-12 rounded-full px-6",
  icon: "h-10 w-10 p-0",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = cn(
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(buttonClassName, children.props.className),
      ...props,
    });
  }

  return (
    <button className={buttonClassName} type="button" {...props}>
      {children}
    </button>
  );
}
