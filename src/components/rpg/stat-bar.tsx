import { statBarPercent, filledIconCount, formatCompact } from "@/lib/utils";

type StatBarProps = {
  label: string;
  current: number;
  max: number;
  color: "red" | "blue" | "purple" | "green" | "gold";
  icon?: string;
  className?: string;
};

const colorMap = {
  red: "bg-accent-red",
  blue: "bg-accent-blue",
  purple: "bg-accent-purple",
  green: "bg-accent",
  gold: "bg-accent-gold",
};

const iconMap: Record<string, string> = {
  red: "♥",
  blue: "◆",
  purple: "★",
  green: "●",
  gold: "◈",
};

export function StatBar({
  label,
  current,
  max,
  color,
  icon,
  className = "",
}: StatBarProps) {
  const pct = statBarPercent(current, max);
  const displayIcon = icon ?? iconMap[color] ?? "";
  const filled = filledIconCount(pct);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="font-display text-[8px] text-accent-gold w-7 shrink-0 leading-none">
        {label}
      </span>
      {color === "red" ? (
        <div className="flex-1 flex items-center gap-px">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className={`text-[8px] leading-none ${
                i < filled ? "text-accent-red" : "text-border-subtle"
              }`}
            >
              {displayIcon}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex-1 h-2 bg-surface rounded-sm overflow-hidden border border-border-subtle">
          <div
            className={`h-full ${colorMap[color]} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <span className="text-[9px] text-text-muted tabular-nums shrink-0 font-display leading-none">
        {formatCompact(current)}/{formatCompact(max)}
      </span>
    </div>
  );
}
