// components/domain-view.tsx
"use client";

import clsx from "clsx";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

type DomainViewProps = {
  value: string;
  placeholder?: string;
  buttonCopy: {
    success: string;
    idle: string;
  };
  className?: string;
};

export function DomainView({ value, placeholder, buttonCopy, className }: DomainViewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={clsx("group relative flex items-center w-full max-w-sm transition-all", className)}>
      <div className="relative flex-1 flex items-center overflow-hidden">
        <input
          readOnly
          value={value}
          placeholder={placeholder}
          className={clsx(
            "w-full text-sm pl-4 pr-24 py-2 h-10 transition-all bg-muted/30 hover:bg-muted/50 border border-border rounded-full text-muted-foreground font-medium",
            "focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-default",
          )}
        />
        <button
          onClick={handleCopy}
          className={clsx(
            "absolute right-1 h-8 px-4 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
            isCopied ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 shadow-sm",
          )}
        >
          {isCopied ? (
            <>
              <Check className="size-3" />
              {buttonCopy.success}
            </>
          ) : (
            <>
              <Copy className="size-3" />
              {buttonCopy.idle}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
