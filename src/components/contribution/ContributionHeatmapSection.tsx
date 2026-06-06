import { getContributions } from "@/lib/contribution/getContributions";
import { ContributionHeatmap } from "./ContributionHeatmap";

export async function ContributionHeatmapSection() {
  const contributions = await getContributions();
  return <ContributionHeatmap contributions={contributions} />;
}
