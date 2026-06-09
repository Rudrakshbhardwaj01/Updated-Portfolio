import { otherProjects } from "@/data/projects";
import { SectionHeading } from "./SectionHeading";
import { TextLink } from "./TextLink";

export function OtherProjects() {
  if (otherProjects.length === 0) return null;

  return (
    <section aria-labelledby="other-work-heading" className="section">
      <hr className="brutal-divider mb-12" />
      <SectionHeading id="other-work-heading">Other Work</SectionHeading>

      <ol className="space-y-5">
        {otherProjects.map((project) => (
          <li
            key={project.name}
            className="border-l-[3px] border-foreground pl-5"
          >
            <p className="brutal-project-title text-[1.75rem]">
              <TextLink href={project.githubUrl} external>
                {project.name}
              </TextLink>
            </p>
            <p className="brutal-label mt-1">{project.tagline}</p>
            <p className="brutal-body mt-3 max-w-2xl">{project.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
