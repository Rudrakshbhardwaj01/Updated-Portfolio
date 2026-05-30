import { projects } from "@/data/projects";
import { TextLink } from "./TextLink";

export function Projects() {
  return (
    <section aria-labelledby="projects-heading">
      <h2
        id="projects-heading"
        className="mb-4 text-s font-semibold tracking-[0.15em] text-primary uppercase"
      >
        Projects
      </h2>

      <ol className="space-y-4 text-base leading-relaxed">
        {projects.map((project) => (
          <li key={project.name}>
            <TextLink href={project.githubUrl} external>
              {project.name}
            </TextLink>
            <span className="text-secondary"> — {project.description}</span>
            <span className="text-secondary">
              {" "}
              [
              <TextLink href={project.githubUrl} external>
                code
              </TextLink>
              {project.demoUrl && (
                <>
                  {" "}
                  -{" "}
                  <TextLink href={project.demoUrl} external>
                    demo
                  </TextLink>
                </>
              )}
              ]
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
