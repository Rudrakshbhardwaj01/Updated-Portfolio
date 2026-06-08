export type PrivateKnowledgeSection =
  | "experience"
  | "projects"
  | "education"
  | "leadership";

export const PRIVATE_EXPERIENCE = `Ernst & Young (EY)
Summer Intern, Treasury Management Team
Hybrid
Apr 2026 – Present

Key Contributions:
- Designed an end-to-end PDF processing pipeline for enterprise treasury documents with layout-aware field extraction, schema normalization, and structured handoff to downstream workflow systems.
- Reduced manual document review effort by approximately 50%.
- Engineered an LLM-powered project intelligence dashboard that parses enterprise email chains and extracts structured signals including go-live dates, testing status, dependencies, action items, milestones, and payment information.
- Built automated country-level and bank-level categorization systems for treasury project tracking.
- Enabled operations teams to filter and monitor project status across multiple entities without manual data entry.

VertexPlus Technologies
Machine Learning Intern
Remote
Jan 2026 – Mar 2026

Key Contributions:
- Owned the full computer vision development lifecycle for a YOLO-based fire detection system.
- Managed dataset sourcing, annotation, augmentation, training, evaluation, and inference pipeline testing.
- Improved detection reliability by 18%.
- Reduced false positive rate by 15%.
- Evaluated model robustness under varying lighting and occlusion conditions.
- Established validation procedures that improved out-of-distribution generalization.

Dotsquares
Winter Intern
On-site
Dec 2025 – Jan 2026

Key Contributions:
- Built stateful agentic workflows using LangGraph.
- Implemented tool-calling architectures, conditional branching, and session-aware memory management.
- Developed LangChain RAG systems to ground responses in retrieved documents.
- Improved response consistency by 25%.
- Built reusable ingestion, chunking, retrieval, and document processing components.`;

export const PRIVATE_PROJECTS = `LLM Consulate

Technologies:
Next.js 15, TypeScript, Tailwind CSS, Zustand, Framer Motion, shadcn/ui, FastAPI, Python, asyncio, httpx, Pydantic, NVIDIA Inference API, SSE

Details:
- Built a multi-model AI consensus engine that consults a council of open-source LLMs in parallel.
- Measures inter-model agreement and preserves dissenting viewpoints when consensus is weak.
- Synthesizes answers only when meaningful consensus exists.
- Streams results in real time via Server-Sent Events.
- Production-grade FastAPI backend with async orchestration and NVIDIA Inference API integration.

YouTubeGPT

Technologies:
Python, LangChain, RAG, Vector Embeddings, React, REST APIs

Details:
- Built a full-stack GenAI application using YouTube transcripts as a knowledge source.
- Generated dense embeddings and stored them in a vector index.
- Implemented semantic retrieval before generation.
- Improved answer relevance by approximately 30% over naive retrieval baselines.
- Separated retrieval quality from generation quality to enable independent optimization.

RoadDefect-Dodge

Technologies:
Python, YOLOv8, OpenCV, Computer Vision

Details:
- Trained a YOLOv8 multi-class road defect detector from scratch.
- Built the complete ML pipeline including annotation, augmentation, training, validation, and inference.
- Detected potholes, cracks, and manholes.
- Designed augmentation strategies to handle class imbalance and real-world lighting conditions.
- Implemented configurable confidence thresholding and NMS pipelines.

GitGallery

Technologies:
Python, PySide6, GitHub OAuth, Git CLI, Pillow, Multithreading

Details:
- Architected a desktop application using GitHub repositories as a photo storage backend.
- Implemented OAuth authentication and repository lifecycle management.
- Added thumbnail generation, synchronization, and folder organization.
- Offloaded Git operations to worker threads for a responsive UI.
- Built local caching and repository-tree indexing systems.`;

export const PRIVATE_EDUCATION = `Manipal University Jaipur
B.Tech, Computer and Communication Engineering
2023 – Present

Oxford International Public School
Class XII (CBSE)
2022 – 2023

Oxford International Public School
Class X (CBSE)
2020 – 2021`;

export const PRIVATE_LEADERSHIP = `IEEE WIE MUJ
Senior Coordinator – Editorial
May 2024 – May 2025

Responsibilities:
- Led technical content strategy for IEEE WIE initiatives.
- Managed editorial workflows across chapter activities and events.
- Coordinated outreach campaigns and promotional communications.
- Collaborated with organizers and design teams on student engagement initiatives.`;

export const PRIVATE_KNOWLEDGE_BY_SECTION: Record<
  PrivateKnowledgeSection,
  string
> = {
  experience: PRIVATE_EXPERIENCE,
  projects: PRIVATE_PROJECTS,
  education: PRIVATE_EDUCATION,
  leadership: PRIVATE_LEADERSHIP,
};
