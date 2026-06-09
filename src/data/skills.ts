export type SkillGroup = {
  label: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    label: "AI & ML",
    items: [
      "LLM Systems",
      "RAG",
      "LangChain",
      "LangGraph",
      "PyTorch",
      "YOLOv8",
      "Computer Vision",
      "Agentic Workflows",
    ],
  },
  {
    label: "Backend & Systems",
    items: [
      "FastAPI",
      "Flask",
      "Python",
      "Node.js",
      "SSE Streaming",
      "Async Orchestration",
      "REST APIs",
    ],
  },
  {
    label: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
  },
  {
    label: "Data & Infrastructure",
    items: ["ChromaDB", "PostgreSQL", "MongoDB", "Vector Databases", "Git"],
  },
];
