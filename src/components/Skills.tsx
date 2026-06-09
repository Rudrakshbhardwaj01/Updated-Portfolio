import { skillGroups } from "@/data/skills";
import { SectionHeading } from "./SectionHeading";

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="section">
      <hr className="brutal-divider mb-12" />
      <SectionHeading id="skills-heading">Skills</SectionHeading>

      <div className="grid gap-6 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div
            key={group.label}
            className="border-2 border-foreground p-6 shadow-[5px_5px_0_var(--foreground)]"
          >
            <h3 className="brutal-role-title text-[1.35rem]">{group.label}</h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {group.items.map((skill) => (
                <span key={skill} className="brutal-tech-pill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
