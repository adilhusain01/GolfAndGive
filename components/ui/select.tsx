"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect() {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select.");
  }
  return context;
}

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const triggerId = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, triggerId }}
    >
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerId } = useSelect();

  return (
    <button
      type="button"
      id={triggerId}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "inline-flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({
  placeholder = "Select an option",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { value } = useSelect();

  return (
    <span className={cn("block truncate text-left", className)} {...props}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, triggerId } = useSelect();
  if (!open) {
    return null;
  }

  return (
    <div
      role="listbox"
      aria-labelledby={triggerId}
      className={cn(
        "absolute right-0 z-20 mt-2 min-w-[220px] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function SelectItem({
  value,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: currentValue, onValueChange, setOpen } = useSelect();

  return (
    <button
      type="button"
      role="option"
      aria-selected={currentValue === value}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        "w-full px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none",
        currentValue === value ? "bg-muted font-semibold" : "",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
