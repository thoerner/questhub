import type { ReactNode } from "react";

type RpgPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "parchment";
  compact?: boolean;
};

export function RpgPanel({
  title,
  children,
  className = "",
  variant = "default",
  compact = false,
}: RpgPanelProps) {
  const bg = {
    default: "bg-surface-raised",
    dark: "bg-surface",
    parchment: "bg-panel bg-[url('/backgrounds/panel-parchment.webp')] bg-repeat bg-[length:256px]",
  }[variant];

  return (
    <div className={`ornate-border rounded-sm ${bg} ${className}`}>
      {title && (
        <div className="border-b border-accent-gold-dim px-3 py-1.5">
          <h3 className="font-display text-[10px] tracking-wider text-accent-gold uppercase leading-none">
            {title}
          </h3>
        </div>
      )}
      <div className={compact ? "p-2" : "p-3"}>{children}</div>
    </div>
  );
}
