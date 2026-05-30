import { experiences } from "@/data/experience";
import { TextLink } from "./TextLink";

export function Experience() {
  return (
    <section aria-labelledby="experience-heading">
      <h2
        id="experience-heading"
        className="mb-4 text-s font-semibold tracking-[0.15em] text-primary uppercase"
      >
        Experience
      </h2>

      <ol className="space-y-4 text-base leading-relaxed">
        {experiences.map((item) => (
          <li key={`${item.company}-${item.period}`}>
            <span className="text-secondary">[{item.period}] </span>
            {item.role}
            {" @ "}
            {item.companyUrl ? (
              <TextLink href={item.companyUrl} external>
                {item.company}
              </TextLink>
            ) : (
              item.company
            )}
            <span className="text-secondary"> — {item.description}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
