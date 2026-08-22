import type { ShelfItem, ShelfItemType } from "@/data/shelf";

export const notesItems: ShelfItem[] = [
  {
    id: "deep-learning",
    title: "DEEP LEARNING",
    author: "Handwritten Notes",
    type: "notes" as ShelfItemType,
    status: "Completed",
    image: "/assets/DLnotes.jpg",
    link: "/notes/deep-learning",
    description:
      "Handwritten deep learning notes from the perceptron up to encoder-decoder architecture.",
  },
];