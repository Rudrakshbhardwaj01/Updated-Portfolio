import { siteConfig } from "@/data/site";

export function ResumeRibbon() {
  return (
    <a
      href={siteConfig.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="resume-btn"
      aria-label="Open resume PDF in new tab"
    >
      <span className="resume-btn-accent" aria-hidden="true" />
      <span className="resume-btn-content">
        <span className="resume-btn-title">Resume</span>
        <span className="resume-btn-meta">
          <span className="resume-btn-ext">.PDF</span>
          <span className="resume-btn-arrow" aria-hidden="true">
            ↗
          </span>
        </span>
      </span>
    </a>
  );
}
