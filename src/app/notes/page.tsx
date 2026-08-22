import type { Metadata } from "next";
import { NotesContent } from "./NotesContent";

export const metadata: Metadata = {
  title: "My Notes | Rudraksh Bhardwaj",
  description:
    "A collection of handwritten notes, diagrams, and technical explorations.",
};

export default function NotesPage() {
  return <NotesContent />;
}