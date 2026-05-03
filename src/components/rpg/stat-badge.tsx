type StatBadgeProps = {
  icon: string;
  value: number | string;
  label: string;
  className?: string;
};

export function StatBadge({ icon, value, label, className = "" }: StatBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 text-xs py-0.5 ${className}`}
      title={label}
    >
      <span className="text-[10px] w-4 text-center shrink-0" role="img" aria-label={label}>
        {icon}
      </span>
      <span className="text-text-secondary flex-1">{label}</span>
      <span className="text-text-primary font-medium tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
