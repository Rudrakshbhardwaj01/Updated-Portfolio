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
    company: "VertexPlus Technologies",
    description:
      "Developed an end-to-end YOLO-based fire detection pipeline spanning dataset engineering, model training, validation, and performance optimization.",
  },
  {
    period: "Dec 2025 – Jan 2026",
    role: "Winter Intern",
    company: "Dotsquares",
    description:
      "Built agentic AI workflows using LangGraph, LangChain, and RAG architectures, enabling stateful multi-turn reasoning, document-grounded responses, and reusable LLM application development.",
  },
];
