import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Education } from "@/components/Education";
import { Projects } from "@/components/Projects";
import { WritingBanner } from "@/components/WritingBanner";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 sm:px-8 sm:py-16">
      <main>
        <Hero />
        <WritingBanner />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <Experience />
          <Projects />
          <Education />
        </div>
      </main>

      <Footer />
    </div>
  );
}
