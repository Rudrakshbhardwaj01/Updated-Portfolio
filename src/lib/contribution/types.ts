export type ContributionDay = {
  date: string;
  count: number;
};

export type ContributionWeek = {
  days: ContributionDay[];
};

export type ContributionMonthLabel = {
  label: string;
  weekIndex: number;
};

export type ContributionHeatmapData = {
  weeks: ContributionWeek[];
  monthLabels: ContributionMonthLabel[];
  yearTotal: number;
  weekCount: number;
};
