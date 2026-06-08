export type Project = {
  name: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
  previewImage?: string;
};

export const projects: Project[] = [
  {
    name: "LLM Consulate",
    description:
      "multi-model ai consensus platform that consults open-source llms in parallel and synthesizes answers when meaningful agreement exists.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/LLM-consulate",
    demoUrl: "https://llm-consulate.vercel.app/",
    previewImage: "/assets/LLMconsulate.png",
  },
  {
    name: "YouTubeGPT",
    description:
      "full-stack genai rag application that enables video-grounded q&a using youtube transcripts, embeddings, and contextual memory.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/YouTubeGPT",
  },
  {
    name: "Git Gallery",
    description:
      "desktop application that repurposes github repositories as a photo storage backend with oauth authentication, thumbnail generation, and multithreaded synchronization.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/GitGallery",
  },
];
