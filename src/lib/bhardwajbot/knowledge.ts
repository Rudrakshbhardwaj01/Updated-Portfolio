import { education } from "@/data/education";
import { experiences } from "@/data/experience";
import { projects } from "@/data/projects";
import { siteConfig, socialLinks } from "@/data/site";
import { getAllPosts } from "@/lib/posts";
import type { PageContext } from "./types";
import {
  PRIVATE_KNOWLEDGE_BY_SECTION,
  type PrivateKnowledgeSection,
} from "./privateKnowledge";

export type KnowledgeSection =
  | "about"
  | "experience"
  | "projects"
  | "education"
  | "writings"
  | "links"
  | "skills"
  | "leadership";

type WeightedPattern = {
  pattern: RegExp;
  weight: number;
};

const SECTION_PATTERNS: Record<
  Exclude<KnowledgeSection, "about">,
  WeightedPattern[]
> = {
  experience: [
    {
      pattern:
        /\b(experience|internship|intern|job|career|work history)\b/i,
      weight: 3,
    },
    {
      pattern:
        /\b(ey|ernst\s*&?\s*young|vertexplus|vertex|dotsquares|treasury)\b/i,
      weight: 10,
    },
  ],

  projects: [
    {
      pattern:
        /\b(project|projects|portfolio|built|developed|application|tool)\b/i,
      weight: 3,
    },
    {
      pattern:
        /\b(youtubegpt|roaddefect|gitgallery|ballotbox|research paper summarizer)\b/i,
      weight: 10,
    },
    {
      pattern:
        /\b(rag|langchain|langgraph|yolo|computer vision)\b/i,
      weight: 6,
    },
  ],

  education: [
    {
      pattern:
        /\b(education|degree|college|university|school|btech|b\.tech)\b/i,
      weight: 5,
    },
    {
      pattern: /\b(manipal)\b/i,
      weight: 10,
    },
  ],

  writings: [
    {
      pattern:
        /\b(blog|blogs|article|articles|writing|writings|post|posts)\b/i,
      weight: 4,
    },
    {
      pattern:
        /\b(rag|transfer learning|bitcoin|mining)\b/i,
      weight: 8,
    },
  ],

  links: [
    {
      pattern:
        /\b(linkedin|github|resume|contact|email|hire)\b/i,
      weight: 5,
    },
  ],

  skills: [
    {
      pattern:
        /\b(skill|skills|tech stack|technology stack|learning)\b/i,
      weight: 5,
    },
  ],

  leadership: [
    {
      pattern:
        /\b(leadership|ieee|coordinator|editorial|volunteer)\b/i,
      weight: 8,
    },
  ],
};

const PORTFOLIO_INTENT_TERMS = [
  "rudraksh",
  "portfolio",
  "experience",
  "internship",
  "ey",
  "ernst",
  "young",
  "vertex",
  "vertexplus",
  "dotsquares",
  "treasury",
  "education",
  "university",
  "manipal",
  "skill",
  "skills",
  "blog",
  "article",
  "writing",
  "writings",
  "resume",
  "linkedin",
  "github",
  "youtubegpt",
  "roaddefect",
  "gitgallery",
  "ballotbox",
  "leadership",
  "ieee",
];

const PORTFOLIO_INTENT = new RegExp(
  `\\b(${PORTFOLIO_INTENT_TERMS.join("|")})\\b`,
  "i",
);

const PORTFOLIO_PRONOUNS = /\b(he|his|him|rudraksh)\b/i;

const PORTFOLIO_RECOMMENDATION =
  /\b(what should i|where should i|look at first|best project|explore first|recommend|show me his|tell me about his)\b/i;

const FOLLOW_UP_PATTERN =
  /\b(more|that|those|it|them|which one|tell me more|what about|go on|elaborate|details?|explain further|the second|the first)\b/i;

const WRITING_PAGE_CONTEXT =
  /\b(this|here|article|post|writing|summarize|summary|main idea)\b/i;

const PRIVATE_SECTION_MAP: Partial<
  Record<KnowledgeSection, PrivateKnowledgeSection>
> = {
  experience: "experience",
  projects: "projects",
  education: "education",
  leadership: "leadership",
};

const POSTS = getAllPosts();

const ABOUT_CONTENT = [
  `Name: ${siteConfig.name}`,
  `Tagline: ${siteConfig.tagline}`,
  ...siteConfig.bio.map((paragraph) => `Bio: ${paragraph}`),
].join("\n");

const EXPERIENCE_CONTENT = experiences
  .map(
    (item) =>
      `[${item.period}] ${item.role} @ ${item.company} — ${item.description}`,
  )
  .join("\n");

const PROJECTS_CONTENT = projects
  .map((project) => `${project.name}: ${project.description}`)
  .join("\n");

const EDUCATION_CONTENT = education
  .map(
    (item) =>
      `[${item.period}] ${item.degree} @ ${item.institution}`,
  )
  .join("\n");

const WRITINGS_CONTENT = POSTS.map(
  (post) =>
    `${post.title} (slug: ${post.slug}, ${post.category}) — ${post.description}`,
).join("\n");

const LINKS_CONTENT = socialLinks
  .map((link) => `${link.label}: ${link.href}`)
  .join("\n");

const SKILLS_CONTENT = `
Languages:
Python, C++, C, JavaScript, TypeScript

AI / ML:
TensorFlow, Keras, Scikit-Learn, OpenCV, YOLOv8,
LangChain, LangGraph, Hugging Face, NumPy, Pandas

Web & Databases:
React, Node.js, Express.js,
Tailwind CSS, MongoDB,
PostgreSQL, MySQL

Tools:
Git, Streamlit,
Jupyter Notebook,
VS Code
`.trim();

const SECTION_CONTENT: Record<KnowledgeSection, string> = {
  about: ABOUT_CONTENT,
  experience: EXPERIENCE_CONTENT,
  projects: PROJECTS_CONTENT,
  education: EDUCATION_CONTENT,
  writings: WRITINGS_CONTENT,
  links: LINKS_CONTENT,
  skills: SKILLS_CONTENT,
  leadership: "",
};

function querySignalsPortfolioIntent(query: string): boolean {
  if (PORTFOLIO_INTENT.test(query)) {
    return true;
  }

  if (PORTFOLIO_PRONOUNS.test(query)) {
    return true;
  }

  if (PORTFOLIO_RECOMMENDATION.test(query)) {
    return true;
  }

  return false;
}

function isWritingPagePortfolioQuery(
  query: string,
  pageContext?: PageContext,
): boolean {
  if (
    pageContext?.pageType !== "writing" &&
    pageContext?.pageType !== "writings-index"
  ) {
    return false;
  }

  return WRITING_PAGE_CONTEXT.test(query);
}

export function isPortfolioQuery(
  query: string,
  pageContext?: PageContext,
  recentUserQueries: string[] = [],
): boolean {
  if (querySignalsPortfolioIntent(query)) {
    return true;
  }

  if (isWritingPagePortfolioQuery(query, pageContext)) {
    return true;
  }

  if (
    FOLLOW_UP_PATTERN.test(query) &&
    recentUserQueries.some((recentQuery) =>
      querySignalsPortfolioIntent(recentQuery),
    )
  ) {
    return true;
  }

  return false;
}

function buildRetrievalQuery(
  userQuery: string,
  recentUserQueries: string[],
): string {
  return [...recentUserQueries.slice(-2), userQuery].join(" ");
}

function scoreSections(
  query: string,
  pageContext?: PageContext,
): KnowledgeSection[] {
  const scores = new Map<KnowledgeSection, number>();

  for (const [section, patterns] of Object.entries(
    SECTION_PATTERNS,
  ) as [
    Exclude<KnowledgeSection, "about">,
    WeightedPattern[],
  ][]) {
    let score = 0;

    for (const { pattern, weight } of patterns) {
      if (pattern.test(query)) {
        score += weight;
      }
    }

    if (score > 0) {
      scores.set(section, score);
    }
  }

  if (
    pageContext?.pageType === "writing" ||
    pageContext?.pageType === "writings-index"
  ) {
    scores.set(
      "writings",
      (scores.get("writings") ?? 0) + 20,
    );
  }

  if (pageContext?.slug) {
    scores.set(
      "writings",
      (scores.get("writings") ?? 0) + 10,
    );
  }

  const sections = [...scores.entries()]
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([section]) => section);

  if (sections.length > 0) {
    return sections;
  }

  if (PORTFOLIO_RECOMMENDATION.test(query)) {
    return ["projects"];
  }

  return ["about"];
}

export function buildRelevantKnowledge(
  userQuery: string,
  pageContext?: PageContext,
  recentUserQueries: string[] = [],
): {
  content: string;
  sections: KnowledgeSection[];
  isPortfolio: boolean;
} {
  const query = userQuery.toLowerCase();
  const portfolio = isPortfolioQuery(query, pageContext, recentUserQueries);

  if (!portfolio) {
    return {
      content: "",
      sections: [],
      isPortfolio: false,
    };
  }

  const retrievalQuery = buildRetrievalQuery(query, recentUserQueries);
  const sections = scoreSections(retrievalQuery, pageContext);

  const contentParts: string[] = [];

  for (const section of sections) {
    const privateSection = PRIVATE_SECTION_MAP[section];
    const privateDetail = privateSection
      ? PRIVATE_KNOWLEDGE_BY_SECTION[privateSection]
      : undefined;

    if (privateDetail) {
      contentParts.push(
        `${section.toUpperCase()}:\n${privateDetail}`,
      );
      continue;
    }

    const publicContent = SECTION_CONTENT[section];

    if (publicContent.length > 0) {
      contentParts.push(
        `${section.toUpperCase()}:\n${publicContent}`,
      );
    }
  }

  return {
    content: contentParts.join("\n\n"),
    sections,
    isPortfolio: true,
  };
}
