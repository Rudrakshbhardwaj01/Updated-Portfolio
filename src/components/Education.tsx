import { education } from "@/data/education";
import { ContributionHeatmapSection } from "./contribution/ContributionHeatmapSection";
import { TextLink } from "./TextLink";

export function Education() {
  return (
    <section aria-labelledby="education-heading">
      <h2
        id="education-heading"
        className="mb-4 text-S font-semibold tracking-[0.15em] text-primary uppercase"
      >
        Education
      </h2>

      <ol className="space-y-4 text-base leading-relaxed">
        {education.map((item) => (
          <li key={item.institution}>
            <span className="text-secondary">[{item.period}] </span>
            {item.degree}
            {" @ "}
            {item.institutionUrl ? (
              <TextLink href={item.institutionUrl} external>
                {item.institution}
              </TextLink>
            ) : (
              item.institution
            )}
          </li>
        ))}
      </ol>

      <ContributionHeatmapSection />
    </section>
  );
}
