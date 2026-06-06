import type { CSSProperties } from "react";
import {
  buildHeatmapData,
  getIntensityLevel,
} from "@/lib/contribution/utils";
import type { ContributionDay } from "@/lib/contribution/types";
import "./contribution-heatmap.css";

type ContributionHeatmapProps = {
  contributions: ContributionDay[];
};

function formatCellLabel(date: string, count: number): string {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (count === 0) {
    return `No commits on ${formatted}`;
  }

  if (count === 1) {
    return `1 commit on ${formatted}`;
  }

  return `${count} commits on ${formatted}`;
}

export function ContributionHeatmap({ contributions }: ContributionHeatmapProps) {
  const { weeks, monthLabels, yearTotal, weekCount } =
    buildHeatmapData(contributions);
  const currentYear = new Date().getFullYear();
  const ariaLabel = `${yearTotal} commits in ${currentYear}. Contribution activity heatmap.`;

  return (
    <div
      className="contribution-heatmap"
      role="img"
      aria-label={ariaLabel}
      style={
        {
          "--heatmap-weeks": weekCount,
        } as CSSProperties
      }
    >
      <div className="contribution-heatmap-scroll">
        <div className="contribution-heatmap-chart">
          <div className="contribution-heatmap-months" aria-hidden="true">
            {monthLabels.map(({ label, weekIndex }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="contribution-heatmap-month"
                style={
                  {
                    "--week-index": weekIndex,
                  } as CSSProperties
                }
              >
                {label}
              </span>
            ))}
          </div>

          <div className="contribution-heatmap-grid" aria-hidden="true">
            {weeks.map((week, weekIndex) =>
              week.days.map((day, dayIndex) => {
                const level = getIntensityLevel(day.count);

                return (
                  <span
                    key={day.date}
                    className="contribution-heatmap-cell"
                    data-level={level}
                    title={formatCellLabel(day.date, day.count)}
                    style={{
                      gridColumn: weekIndex + 1,
                      gridRow: dayIndex + 1,
                    }}
                  />
                );
              }),
            )}
          </div>
        </div>
      </div>

      <div className="contribution-heatmap-footer">
        <p className="contribution-heatmap-summary">
          [+] {yearTotal.toLocaleString()} commits this year
        </p>

        <div className="contribution-heatmap-legend" aria-hidden="true">
          <span className="contribution-heatmap-legend-label">Less</span>
          <div className="contribution-heatmap-legend-cells">
            {[0, 1, 2, 3, 4].map((level) => (
              <span
                key={level}
                className="contribution-heatmap-legend-cell"
                data-level={level}
              />
            ))}
          </div>
          <span className="contribution-heatmap-legend-label">More</span>
        </div>
      </div>
    </div>
  );
}
