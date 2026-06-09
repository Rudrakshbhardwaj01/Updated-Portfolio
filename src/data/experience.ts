export type Experience = {
  period: string;
  role: string;
  company: string;
  companyUrl?: string;
  description: string;
};

export const experiences: Experience[] = [
  {
    period: "Apr 2026 – Present",
    role: "Summer Intern",
    company: "EY",
    companyUrl: "https://www.ey.com",
    description:
      "Building toolkits for internal treasury platforms and AI-assisted workflow automation.",
  },
  {
    period: "Jan 2026 – Mar 2026",
    role: "ML Intern",
    company: "VertexPlus",
    description:
      "Computer vision with YOLO-based fire detection, data pipelines, and model optimization.",
  },
  {
    period: "Dec 2025 – Jan 2026",
    role: "Winter Intern",
    company: "Dotsquares",
    description:
      "LLM chatbots, LangGraph agents, and RAG systems with LangChain.",
  },
];
