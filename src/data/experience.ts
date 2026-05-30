export type Experience = {
  period: string;
  role: string;
  company: string;
  companyUrl?: string;
  description: string;
};

export const experiences: Experience[] = [
  {
    period: "Apr 2026 - Present",
    role: "Summer Intern",
    company: "EY",
    companyUrl: "https://www.ey.com",
    description:
      "building toolkits for internal treasury platforms and ai-assisted workflow automation.",
  },
  {
    period: "Jan 2026 - Mar 2026",
    role: "ML Intern",
    company: "VertexPlus",
    description:
      "computer vision with yolo-based fire detection, data pipelines, and model optimization.",
  },
  {
    period: "Dec 2025 - Jan 2026",
    role: "Winter Intern",
    company: "Dotsquares",
    description:
      "llm chatbots, langgraph agents, and rag systems with langchain.",
  },
];
