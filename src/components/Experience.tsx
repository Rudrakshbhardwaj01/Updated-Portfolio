import { experiences } from "@/data/experience";
import { SectionHeading } from "./SectionHeading";

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="section section-featured"
    >
      <hr className="brutal-divider mb-14" />
      <SectionHeading id="experience-heading" featured>
        Experience
      </SectionHeading>

      <ol className="space-y-6">
        {experiences.map((item, index) => (
          <li
            key={`${item.company}-${item.period}`}
            className={
              index === 0 ? "experience-card experience-card-featured" : "experience-card"
            }
          >
            <p className="brutal-label">{item.period}</p>

            <p className="brutal-role-title mt-3">
              {item.role}
              <span className="font-mono text-[0.55em] font-normal tracking-widest text-secondary">
                {" "}
                @{" "}
              </span>
              {item.companyUrl ? (
                <a
                  href={item.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-display-link"
                >
                  {item.company}
                </a>
              ) : (
                item.company
              )}
            </p>

            <p className="brutal-body-lg mt-4 max-w-2xl">{item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
