"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
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
  value?: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const selectedValue = value ?? internalValue;
  const [open, setOpen] = React.useState(false);
  const triggerId = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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
      value={{
        value: selectedValue,
        onValueChange: (val: string) => {
          if (value === undefined) {
            setInternalValue(val);
          }
          onValueChange(val);
        },
        open,
        setOpen,
        triggerId,
        triggerRef,
      }}
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
  const { open, setOpen, triggerId, triggerRef } = useSelect();

  return (
    <button
      type="button"
      id={triggerId}
      ref={triggerRef}
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

type SelectValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  placeholder?: string;
};

export function SelectValue({
  placeholder = "Select an option",
  className,
  ...props
}: SelectValueProps) {
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
  const { open, triggerId, triggerRef } = useSelect();
  const [position, setPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, triggerRef]);

  if (!open) {
    return null;
  }

  if (typeof document === "undefined" || !position) {
    return null;
  }

  return createPortal(
    <div
      role="listbox"
      aria-labelledby={triggerId}
      className={cn(
        "fixed z-[70] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl",
        className,
      )}
      style={{
        top: position.top,
        left: position.left,
        minWidth: Math.max(position.width, 220),
      }}
      {...props}
    />,
    document.body,
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
