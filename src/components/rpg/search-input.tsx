"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type SearchInputProps = {
  className?: string;
  placeholder?: string;
  size?: "sm" | "lg";
};

export function SearchInput({
  className = "",
  placeholder = "owner/repo",
  size = "sm",
}: SearchInputProps) {
  const [value, setValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    const match = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
    if (match) {
      router.push(`/repo/${match[1]}/${match[2]}`);
    }
  }

  const isSmall = size === "sm";

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={`
            ${isSmall ? "px-3 py-1 text-xs" : "px-4 py-3 text-base"}
            w-full
            bg-surface border border-border-subtle rounded-sm
            text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30
          `}
        />
        {isSmall && (
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-text-muted border border-border-subtle rounded px-1 py-px bg-surface-overlay leading-none">
            /
          </kbd>
        )}
      </div>
      <button
        type="submit"
        className={`
          ${isSmall ? "px-3 py-1 text-xs" : "px-5 py-3 text-sm"}
          bg-accent-gold/20 border border-accent-gold text-accent-gold rounded-sm
          hover:bg-accent-gold/30 transition-colors font-medium shrink-0
        `}
      >
        {isSmall ? "Go" : "Begin Quest"}
      </button>
    </form>
  );
}
