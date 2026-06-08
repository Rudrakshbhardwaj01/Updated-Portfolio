export const siteConfig = {
  name: "Rudraksh Bhardwaj",
  tagline: "Applied AI Engineer · ML · Backends",
  bio: [
    "Applied ai engineer focused on machine learning, backend systems, ai agents, and developer tooling.",
    "Currently building internal treasury tooling as a summer intern at EY.",
  ],
  writing: {
    label: "WRITINGS",
    url: "/writings",
    description:
      "technical and non technical blogs",
  },
  lastUpdated: "June 08, 2026",
  email: "mailto:hello@rudrakshbhardwaj.com",
} as const;

export type SocialLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const socialLinks: SocialLink[] = [
  { label: "Resume", href: "https://drive.google.com/file/d/1iuoysXyKycYGElJW5xJAz0MfohSLvaiK/view?usp=sharing", external: true },
  {
    label: "Github",
    href: "https://github.com/Rudrakshbhardwaj01",
    external: true,
  },
  {
    label: "Linkedin",
    href: "https://www.linkedin.com/in/rudraksh-bhardwaj-55a337278/",
    external: true,
  },
  { label: "Email", href: siteConfig.email },
  {
    label: "X",
    href: "https://x.com/Rudrakshb01",
    external: true,
  },
];
