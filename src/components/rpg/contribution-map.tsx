import { terrainClass, terrainLabel, expandWeeksToDays } from "@/lib/utils";
import { RpgPanel } from "./rpg-panel";

type ContributionMapProps = {
  weeks: number[];
};

export function ContributionMap({ weeks }: ContributionMapProps) {
  const displayCells = expandWeeksToDays(weeks);
  const total = (weeks.length > 0 ? weeks.slice(-52) : []).reduce(
    (a, b) => a + b,
    0,
  );
  const cols = Math.min(Math.ceil(displayCells.length / 7), 52);

  return (
    <RpgPanel title="Contributions" compact>
      <div className="space-y-2">
        <div
          className="grid gap-[1px]"
          style={{
            gridTemplateRows: "repeat(7, 1fr)",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoFlow: "column",
          }}
        >
          {displayCells.map((count, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[1px] min-w-[3px] min-h-[3px] ${terrainClass(count)}`}
              title={`Day ${i + 1}: ${count} commits (${terrainLabel(count)})`}
            />
          ))}
        </div>
        <p className="text-[9px] text-text-muted font-display leading-none">
          {total.toLocaleString()} contributions in the last year
        </p>
        <div className="flex items-center gap-1.5 text-[8px] text-text-muted">
          <span>Less</span>
          {[0, 1, 3, 6, 10, 15].map((n) => (
            <div
              key={n}
              className={`w-[7px] h-[7px] rounded-[1px] ${terrainClass(n)}`}
              title={terrainLabel(n)}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </RpgPanel>
  );
}
