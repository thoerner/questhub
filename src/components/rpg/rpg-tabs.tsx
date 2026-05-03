"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  count?: number;
  icon?: string;
  content: ReactNode;
};

type RpgTabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

export function RpgTabs({ tabs, defaultTab, className = "" }: RpgTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={className}>
      <div className="flex gap-0 border-b-2 border-accent-gold-dim" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`
                px-3 py-1.5 text-xs font-medium transition-colors relative
                ${
                  isActive
                    ? "text-text-primary bg-surface-overlay border-b-2 border-accent-gold -mb-[2px]"
                    : "text-text-muted hover:text-text-secondary hover:bg-surface-overlay/50"
                }
              `}
            >
              {tab.icon && <span className="mr-1">{tab.icon}</span>}
              {tab.label}
              {tab.count != null && (
                <span
                  className={`
                    ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums
                    ${isActive ? "bg-accent-gold/20 text-accent-gold" : "bg-surface-overlay text-text-muted"}
                  `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{activeTab?.content}</div>
    </div>
  );
}
