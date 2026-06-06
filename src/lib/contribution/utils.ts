import type {
  ContributionDay,
  ContributionHeatmapData,
  ContributionMonthLabel,
  ContributionWeek,
} from "./types";

export const HEATMAP_WEEK_COUNT = 53;
export const HEATMAP_CELL_SIZE_PX = 8;
export const HEATMAP_CELL_GAP_PX = 3;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getIntensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function contributionsToMap(
  contributions: ContributionDay[],
): Map<string, number> {
  return new Map(contributions.map(({ date, count }) => [date, count]));
}

export function getYearTotal(
  contributions: ContributionDay[],
  year = new Date().getFullYear(),
): number {
  const prefix = `${year}-`;
  return contributions.reduce(
    (total, { date, count }) =>
      date.startsWith(prefix) ? total + count : total,
    0,
  );
}

function startOfWeekSunday(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function buildHeatmapData(
  contributions: ContributionDay[],
  weekCount = HEATMAP_WEEK_COUNT,
): ContributionHeatmapData {
  const counts = contributionsToMap(contributions);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endWeekStart = startOfWeekSunday(today);
  const gridStart = new Date(endWeekStart);
  gridStart.setDate(gridStart.getDate() - (weekCount - 1) * 7);

  const weeks: ContributionWeek[] = [];
  const monthLabels: ContributionMonthLabel[] = [];
  let previousMonth = -1;

  for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
    const weekStart = new Date(gridStart);
    weekStart.setDate(weekStart.getDate() + weekIndex * 7);

    const month = weekStart.getMonth();
    if (month !== previousMonth) {
      monthLabels.push({
        label: MONTHS[month],
        weekIndex,
      });
      previousMonth = month;
    }

    const days: ContributionDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const current = new Date(weekStart);
      current.setDate(current.getDate() + dayIndex);

      if (current > today) {
        days.push({ date: formatDateKey(current), count: 0 });
        continue;
      }

      const dateKey = formatDateKey(current);
      days.push({
        date: dateKey,
        count: counts.get(dateKey) ?? 0,
      });
    }

    weeks.push({ days });
  }

  return {
    weeks,
    monthLabels,
    yearTotal: getYearTotal(contributions),
    weekCount,
  };
}
