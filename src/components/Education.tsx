import { education } from "@/data/education";
import { ContributionHeatmapSection } from "./contribution/ContributionHeatmapSection";
import { SectionHeading } from "./SectionHeading";
import { TextLink } from "./TextLink";

export function Education() {
  return (
    <section aria-labelledby="education-heading" className="section">
      <hr className="brutal-divider mb-12" />
      <SectionHeading id="education-heading">Education</SectionHeading>

      <ol className="space-y-5">
        {education.map((item) => (
          <li key={item.institution}>
            <p className="brutal-label">{item.period}</p>
            <p className="brutal-role-title mt-2 text-[1.5rem]">
              {item.degree}
            </p>
            <p className="brutal-body mt-2">
              @{" "}
              {item.institutionUrl ? (
                <TextLink href={item.institutionUrl} external>
                  {item.institution}
                </TextLink>
              ) : (
                item.institution
              )}
            </p>
          </li>
        ))}
      </ol>

      <div className="contribution-heatmap-box mt-10 border-2 border-foreground p-5 shadow-[5px_5px_0_var(--foreground)] sm:p-6">
        <ContributionHeatmapSection />
      </div>
    </section>
  );
}
