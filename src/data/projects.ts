export type Project = {
  name: string;
  description: string;
  githubUrl: string;
  demoUrl?: string;
};

export const projects: Project[] = [
  {
    name: "YouTubeGPT",
    description:
      "full-stack genai rag application that enables video-grounded q&a using youtube transcripts, embeddings, and contextual memory.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/YouTubeGPT",
  },
  {
    name: "BallotBox",
    description:
      "full-stack online voting platform with secure rest apis, candidate management, vote tracking, and responsive frontend architecture.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/BallotBox",
  },
  {
    name: "Research Paper Summarizer",
    description:
      "streamlit-based ai tool that generates structured research summaries using hugging face llms and langchain workflows.",
    githubUrl: "https://github.com/Rudrakshbhardwaj01/research-paper-summarizer",
  },
];
