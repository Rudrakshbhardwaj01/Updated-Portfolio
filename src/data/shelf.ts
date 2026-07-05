export type ShelfItemType = "book" | "paper";

export type ShelfStatus = "Reading" | "Completed";

export type ShelfItem = {
  id: string;
  title: string;
  author: string;
  type: ShelfItemType;
  status: ShelfStatus;
  year?: number;
  /** Optional cover image path. When omitted the placeholder cover is shown. */
  image?: string;
  /** Optional external link (e.g. publisher, arXiv, Goodreads). */
  link?: string;
  description: string;
};

export const shelfItems: ShelfItem[] = [
  {
    id: "designing-data-intensive-applications",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    type: "book",
    status: "Reading",
    image: "/assets/ddia_book.png",
    description:
      "Building scalable, reliable, and maintainable distributed systems.",
  },
  {
    id: "attention-is-all-you-need",
    title: "Attention Is All You Need",
    author: "Ashish Vaswani et al.",
    type: "paper",
    status: "Completed",
    image: "/assets/attention_paper.png",
    description: "The paper that introduced the Transformer architecture.",
  },
  {
    id: "the-google-file-system",
    title: "The Google File System",
    author: "Sanjay Ghemawat, Howard Gobioff, Shun-Tak Leung",
    type: "paper",
    status: "Completed",
    image: "/assets/gfs_paper.png",
    description: "Foundational distributed storage paper from Google.",
  },
];
