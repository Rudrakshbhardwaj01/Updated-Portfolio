export type Experience = {
  period: string;
  role: string;
  company: string;
  companyUrl?: string;
  description: string;
  image: string;
  imageAlt: string;
  serial: string;
};

export const experiences: Experience[] = [
  {
    period: "Apr 2026 – Jul 2026",
    role: "Summer Intern",
    company: "EY",
    companyUrl: "https://www.ey.com",
    description:
      "Built toolkits for internal treasury platforms and AI-assisted workflow automation.",
    image: "/assets/experience/1.jpg",
    imageAlt: "EY internship artwork — brutalist building under a sun",
    serial: "EXP-026-A",
  },
  {
    period: "Jan 2026 – Mar 2026",
    role: "ML Intern",
    company: "VertexPlus Technologies",
    description:
      "Developed an end-to-end YOLO-based fire detection pipeline spanning dataset engineering, model training, validation, and performance optimization.",
    image: "/assets/experience/2.jpg",
    imageAlt: "VertexPlus Technologies internship artwork — terrain scan with detection reticle",
    serial: "EXP-026-B",
  },
  {
    period: "Dec 2025 – Jan 2026",
    role: "Winter Intern",
    company: "Dotsquares",
    description:
      "Built agentic AI workflows using LangGraph, LangChain, and RAG architectures, enabling stateful multi-turn reasoning, document-grounded responses, and reusable LLM application development.",
    image: "/assets/experience/3.jpg",
    imageAlt: "DotSquares internship artwork — layered graph network diagram",
    serial: "EXP-025-C",
  },
];
