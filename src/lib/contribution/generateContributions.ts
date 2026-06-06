import type { ContributionDay } from "./types";
import { formatDateKey } from "./utils";

function seededCount(dateKey: string): number {
  let hash = 0;
  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) | 0;
  }

  const day = new Date(`${dateKey}T00:00:00`).getDay();
  const base = Math.abs(hash) % 100;

  if (day === 0 || day === 6) {
    if (base < 55) return 0;
    if (base < 75) return 1;
    if (base < 90) return 2;
    return 3;
  }

  if (base < 18) return 0;
  if (base < 42) return 1;
  if (base < 68) return 2;
  if (base < 86) return 3;
  if (base < 96) return 5;
  return 8;
}

export function generateMockContributions(
  daysBack = 365,
): ContributionDay[] {
  const contributions: ContributionDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = daysBack; offset >= 0; offset -= 1) {
    const current = new Date(today);
    current.setDate(current.getDate() - offset);
    const dateKey = formatDateKey(current);
    contributions.push({
      date: dateKey,
      count: seededCount(dateKey),
    });
  }

  return contributions;
}
