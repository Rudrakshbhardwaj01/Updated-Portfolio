import type { Metadata } from "next";
import { ShelfContent } from "./ShelfContent";

export const metadata: Metadata = {
  title: "Shelf | Rudraksh Bhardwaj",
  description:
    "A curated collection of books and papers that have influenced the way I think about engineering, systems, machine learning, and software.",
};

export default function ShelfPage() {
  return <ShelfContent />;
}
