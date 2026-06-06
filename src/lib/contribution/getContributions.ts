import type { ContributionDay } from "./types";
import { generateMockContributions } from "./generateContributions";

const GITHUB_USERNAME = "Rudrakshbhardwaj01";

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

type GithubCalendarResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: Array<{
            contributionDays?: Array<{
              date?: string;
              contributionCount?: number;
            }>;
          }>;
        };
      };
    };
  };
  errors?: Array<{ message?: string }>;
  message?: string;
};

function getGithubToken(): string | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  return token ? token : null;
}

function logGithubFailure(reason: string): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[contributions] ${reason} — using mock data`);
  }
}

async function fetchGithubContributions(): Promise<ContributionDay[] | null> {
  const token = getGithubToken();
  if (!token) {
    logGithubFailure("GITHUB_TOKEN is not set");
    return null;
  }

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "rudraksh-portfolio-heatmap",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: { login: GITHUB_USERNAME },
      }),
      next: { revalidate: 3600 },
    });

    const payload = (await response.json()) as GithubCalendarResponse;

    if (!response.ok || payload.message) {
      logGithubFailure(payload.message ?? `GitHub API HTTP ${response.status}`);
      return null;
    }

    if (payload.errors?.length) {
      logGithubFailure(payload.errors[0]?.message ?? "GitHub GraphQL error");
      return null;
    }

    const weeks =
      payload.data?.user?.contributionsCollection?.contributionCalendar
        ?.weeks ?? [];

    const contributions: ContributionDay[] = [];

    for (const week of weeks) {
      for (const day of week.contributionDays ?? []) {
        if (!day.date) {
          continue;
        }

        contributions.push({
          date: day.date,
          count: day.contributionCount ?? 0,
        });
      }
    }

    if (contributions.length === 0) {
      logGithubFailure("GitHub returned no contribution days");
      return null;
    }

    return contributions;
  } catch (error) {
    logGithubFailure(
      error instanceof Error ? error.message : "GitHub request failed",
    );
    return null;
  }
}

export async function getContributions(): Promise<ContributionDay[]> {
  const githubContributions = await fetchGithubContributions();
  return githubContributions ?? generateMockContributions();
}
