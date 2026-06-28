export type Project = {
  name: string;
  highlight?: string;
  tagline: string;
  description: string;
  highlights: string[];
  tech: string[];
  githubUrl: string;
  demoUrl?: string;
  previewImage?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    name: "LLM-Consulate",
    highlight: "Consulate",
    tagline: "Multi-model AI consensus platform",
    description:
      "Consults a council of open-source LLMs in parallel, measures inter-model agreement, preserves dissenting viewpoints, and synthesizes answers only when meaningful consensus exists.",
    highlights: [
      "Parallel multi-model orchestration with real-time SSE streaming",
      "Consensus scoring with dissent preservation when agreement is weak",
      "Production FastAPI backend with async inference coordination",
    ],
    tech: ["FastAPI", "Next.js", "TypeScript", "SSE", "NVIDIA AI"],
    githubUrl: "https://github.com/Rudrakshbhardwaj01/LLM-consulate",
    demoUrl: "https://llm-consulate.vercel.app/",
    previewImage: "/assets/LLMconsulate.png",
    featured: true,
  },
  {
    name: "CineCouch",
    highlight: "Couch",
    tagline: "Privacy-first synchronized watch party platform",
    description:
      "Real-time watch party platform that lets up to four people watch YouTube together with synchronized playback, live chat, and peer-to-peer WebRTC video calling — no signup or login required.",
    highlights: [
      "Real-time synchronized YouTube playback across up to four participants",
      "Peer-to-peer WebRTC video calling with privacy-first media routing",
      "Live Socket.IO chat, ephemeral rooms, and automatic host transfer",
    ],
    tech: [
      "Next.js",
      "React",
      "TypeScript",
      "Express",
      "Socket.IO",
      "WebRTC",
      "Tailwind CSS",
      "Zod",
    ],
    githubUrl: "https://github.com/Rudrakshbhardwaj01/CineCouch",
    demoUrl: "https://cinecouch.vercel.app/",
    previewImage: "/assets/cinecouch.png",
    featured: true,
  },
  {
    name: "YouTubeGPT",
    highlight: "GPT",
    tagline: "Video-grounded RAG for YouTube Q&A",
    description:
      "Full-stack GenAI application that ingests YouTube transcripts, indexes dense embeddings in ChromaDB, and serves context-aware answers through a REST API with structured evidence display.",
    highlights: [
      "30% answer relevance improvement over naive retrieval baselines",
      "Decoupled retrieval and generation for independent optimization",
      "Collapsible Q&A history with semantic transcript chunking",
    ],
    tech: ["React", "Flask", "LangChain", "ChromaDB", "NVIDIA AI"],
    githubUrl: "https://github.com/Rudrakshbhardwaj01/YouTubeGPT",
    featured: true,
  },
  {
    name: "GitGallery",
    highlight: "Gallery",
    tagline: "GitHub-backed photo vault",
    description:
      "Desktop application that repurposes GitHub repositories as a photo storage backend with OAuth authentication, thumbnail generation, multithreaded synchronization, and folder organization.",
    highlights: [
      "Background worker threads for non-blocking Git and sync operations",
      "Full GitHub OAuth flow with repository lifecycle management",
      "Local cache mapping folder hierarchies to Git tree structures",
    ],
    tech: ["Python", "PySide6", "GitHub OAuth", "Pillow", "Multithreading"],
    githubUrl:
      "https://github.com/Rudrakshbhardwaj01/GitGallery-Your-own-photo-vault",
    featured: false,
  },
  {
    name: "RoadDefect-Dodge",
    highlight: "Dodge",
    tagline: "YOLOv8 road defect detector trained from scratch",
    description:
      "End-to-end computer vision pipeline for pothole, crack, and manhole detection — dataset curation, bounding box annotation, augmentation, training, validation, and inference with no pretrained weights.",
    highlights: [],
    tech: ["Python", "YOLOv8", "OpenCV", "Computer Vision"],
    githubUrl: "https://github.com/Rudrakshbhardwaj01/RoadDefect-Dodge",
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
