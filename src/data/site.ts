export const siteConfig = {
  name: "Rudraksh Bhardwaj",
  displayName: ["RUDRAKSH", "BHARDWAJ"],
  tagline: "Applied AI Engineer",
  specialization: "ML · LLMs · Backends",
  ticker: [
  "APPLIED AI ENGINEER",
  "LLM ORCHESTRATION",
  "RAG PIPELINES",
  "INFORMATION EXTRACTION",
  "BACKEND SYSTEMS",
],
  resumeUrl:
    "https://drive.google.com/file/d/1SGKo28VxnhsG32YYUfcUV4HDh3pvhvPn/view?usp=sharing",
  ctaEmail: "mailto:rudrakshbhardwaj01@gmail.com",
  bio: {
    lead: "I'm an Applied AI Engineer building",
    highlight: "production-grade AI systems",
    middle:
      "— multi-model orchestration, RAG pipelines, and distributed backends — for",
    squiggle: "engineering teams shipping real products",
    tail: ".",
  },
  bioSecondary:
    "Currently a Summer Intern at EY, building internal treasury tooling and AI-assisted workflow automation.",
  writing: {
    label: "Writings",
    url: "/writings",
    description: "Technical & non-technical essays. ",
  },
  lastUpdated: "June 08, 2026",
  email: "mailto:rudrakshbhardwaj01@gmail.com",
} as const;

export type SocialLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/Rudrakshbhardwaj01",
    external: true,
  },
  {
    label: "X",
    href: "https://x.com/Rudrakshb01",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rudraksh-bhardwaj-55a337278/",
    external: true,
  },
  { label: "Email", href: siteConfig.email },
];

export const navLinks = [
  { label: "Experience", href: "#experience" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Writings", href: "/writings" },
] as const;
