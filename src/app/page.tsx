import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { OtherProjects } from "@/components/OtherProjects";
import { Skills } from "@/components/Skills";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 pb-16 pt-10 sm:px-10 sm:pb-20 sm:pt-14">
      <main>
        <Hero />
        <Experience />
        <FeaturedProjects />
        <Skills />
        <Education />
        <OtherProjects />
      </main>

      <Footer />
    </div>
  );
}
