export type NavigationTarget = {
  path: string;
  label: string;
  description: string;
};

export const navigationTargets: NavigationTarget[] = [
  {
    path: "/",
    label: "Home",
    description: "Portfolio overview with experience, projects, and education",
  },
  {
    path: "/#experience",
    label: "Experience",
    description: "Work history and internships",
  },
  {
    path: "/#work",
    label: "Selected Work",
    description: "LLM-Consulate, YouTubeGPT, RoadDefect-Dodge",
  },
  {
    path: "/#skills",
    label: "Skills",
    description: "AI/ML, backend, and systems expertise",
  },
  {
    path: "/#education-heading",
    label: "Education",
    description: "Academic background",
  },
  {
    path: "/writings",
    label: "Writings",
    description: "Technical and non-technical blog posts",
  },
];

export const NAVIGATION_MARKER_REGEX = /<!--NAV:([^>]+)-->/g;

export function getWritingNavigationPath(slug: string): string {
  return `/writings/${slug}`;
}

function stripMarkdownHeadings(content: string): string {
  return content.replace(/^#{1,6}\s+/gm, "");
}

function stripHtmlComments(content: string): string {
  return content.replace(/<!--[\s\S]*?-->/g, "");
}

export function sanitizeAssistantResponse(content: string): string {
  return stripMarkdownHeadings(stripHtmlComments(content)).trim();
}

export function extractNavigation(content: string): {
  text: string;
  navigation: string | null;
} {
  const match = content.match(/<!--NAV:([^>]+)-->/);

  if (!match) {
    return {
      text: sanitizeAssistantResponse(content),
      navigation: null,
    };
  }

  const navigation = match[1].trim();
  const text = sanitizeAssistantResponse(
    content.replace(NAVIGATION_MARKER_REGEX, ""),
  );

  return { text, navigation };
}

export function isValidNavigationPath(path: string): boolean {
  if (path === "/") {
    return true;
  }

  if (path.startsWith("/#")) {
    const validHashes = [
      "/#experience",
      "/#work",
      "/#skills",
      "/#education-heading",
    ];
    return validHashes.includes(path);
  }

  if (path === "/writings") {
    return true;
  }

  if (path.startsWith("/writings/")) {
    const slug = path.slice("/writings/".length);
    return slug.length > 0 && !slug.includes("/");
  }

  return false;
}

export function formatNavigationTargetsForPrompt(): string {
  return navigationTargets
    .map((target) => `- ${target.path} (${target.label}): ${target.description}`)
    .join("\n");
}
