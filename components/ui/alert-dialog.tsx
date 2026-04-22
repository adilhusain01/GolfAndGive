"use client";

import * as React from "react";
import { type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type AlertDialogContextValue = {
  onOpenChange: (open: boolean) => void;
};

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(
  null,
);

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext);
  if (!context) {
    throw new Error(
      "AlertDialog components must be used within an AlertDialog.",
    );
  }
  return context;
}

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function AlertDialog({
  open,
  onOpenChange,
  children,
  ...props
}: AlertDialogProps) {
  if (!open) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <AlertDialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        <div
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]"
          {...props}
        >
          {children}
        </div>
      </div>
    </AlertDialogContext.Provider>,
    document.body,
  );
}

export function AlertDialogContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function AlertDialogHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-2xl font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

type AlertDialogButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export function AlertDialogAction({
  className,
  onClick,
  ...props
}: AlertDialogButtonProps) {
  const { onOpenChange } = useAlertDialog();

  return (
    <Button
      variant="destructive"
      onClick={(event) => {
        onOpenChange(false);
        onClick?.(event);
      }}
      className={cn(className)}
      {...props}
    />
  );
}

export function AlertDialogCancel({
  className,
  onClick,
  ...props
}: AlertDialogButtonProps) {
  const { onOpenChange } = useAlertDialog();

  return (
    <Button
      variant="outline"
      onClick={(event) => {
        onOpenChange(false);
        onClick?.(event);
      }}
      className={cn(className)}
      {...props}
    />
  );
}
