import { education } from "@/data/education";
import { experiences } from "@/data/experience";
import { projects } from "@/data/projects";
import { siteConfig, socialLinks } from "@/data/site";
import { getAllPosts } from "@/lib/posts";
import type { PageContext } from "./types";

type KnowledgeSection =
  | "about"
  | "experience"
  | "projects"
  | "education"
  | "writings"
  | "links";

const SECTION_KEYWORDS: Record<Exclude<KnowledgeSection, "about">, RegExp> = {
  experience:
    /\b(experience|intern|internship|job|work|employer|career|ey|vertex|dotsquares)\b/i,
  projects:
    /\b(project|built|build|github|demo|youtube|ballot|summarizer|app|rag|ai|ml|tool)\b/i,
  education:
    /\b(education|degree|university|college|school|manipal|b\.?tech|study)\b/i,
  writings:
    /\b(writing|writings|blog|article|post|read|rag-101|bitcoin|transferlearning)\b/i,
  links:
    /\b(resume|linkedin|github|email|contact|social|reach|hire)\b/i,
};

const OVERVIEW_KEYWORDS =
  /\b(first|start|look|overview|explore|introduce|who|about|summary|tell me)\b/i;

function detectRelevantSections(
  userQuery: string,
  pageContext?: PageContext,
): Set<KnowledgeSection> {
  const sections = new Set<KnowledgeSection>(["about"]);
  const query = userQuery.toLowerCase();

  for (const [section, pattern] of Object.entries(SECTION_KEYWORDS) as Array<
    [Exclude<KnowledgeSection, "about">, RegExp]
  >) {
    if (pattern.test(query)) {
      sections.add(section);
    }
  }

  if (pageContext?.pageType === "writing" || pageContext?.slug) {
    sections.add("writings");
  }

  if (pageContext?.pageType === "writings-index") {
    sections.add("writings");
  }

  if (OVERVIEW_KEYWORDS.test(query) && sections.size <= 2) {
    sections.add("projects");
    sections.add("experience");
    sections.add("writings");
  }

  if (sections.size === 1) {
    sections.add("projects");
    sections.add("experience");
  }

  return sections;
}

function formatAboutSection(): string {
  return [
    `Name: ${siteConfig.name}`,
    `Tagline: ${siteConfig.tagline}`,
    ...siteConfig.bio.map((paragraph) => `Bio: ${paragraph}`),
  ].join("\n");
}

function formatExperienceSection(): string {
  return experiences
    .map(
      (item) =>
        `[${item.period}] ${item.role} @ ${item.company} — ${item.description}`,
    )
    .join("\n");
}

function formatProjectsSection(): string {
  return projects
    .map((project) => `${project.name}: ${project.description}`)
    .join("\n");
}

function formatEducationSection(): string {
  return education
    .map((item) => `[${item.period}] ${item.degree} @ ${item.institution}`)
    .join("\n");
}

function formatWritingsSection(): string {
  return getAllPosts()
    .map(
      (post) =>
        `${post.title} (slug: ${post.slug}, ${post.category}): ${post.description}`,
    )
    .join("\n");
}

function formatLinksSection(): string {
  return socialLinks.map((link) => `${link.label}: ${link.href}`).join("\n");
}

export function buildRelevantKnowledge(
  userQuery: string,
  pageContext?: PageContext,
): { content: string; sections: KnowledgeSection[] } {
  const sections = [...detectRelevantSections(userQuery, pageContext)];
  const parts: string[] = [];

  for (const section of sections) {
    switch (section) {
      case "about":
        parts.push(`ABOUT:\n${formatAboutSection()}`);
        break;
      case "experience":
        parts.push(`EXPERIENCE:\n${formatExperienceSection()}`);
        break;
      case "projects":
        parts.push(`PROJECTS:\n${formatProjectsSection()}`);
        break;
      case "education":
        parts.push(`EDUCATION:\n${formatEducationSection()}`);
        break;
      case "writings":
        parts.push(`WRITINGS:\n${formatWritingsSection()}`);
        break;
      case "links":
        parts.push(`LINKS:\n${formatLinksSection()}`);
        break;
    }
  }

  return {
    content: parts.join("\n\n"),
    sections,
  };
}
