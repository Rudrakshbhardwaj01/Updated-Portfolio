"use client";

import { useState, type ReactNode } from "react";
import { projects, type Project } from "@/data/projects";
import { ProjectPreviewModal } from "./ProjectPreviewModal";
import { TextLink } from "./TextLink";

const linkButtonClass =
  "text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent";

const separator = (
  <span className="text-secondary" aria-hidden="true">
    {" "}
    •{" "}
  </span>
);

function ProjectLinks({
  project,
  onPreview,
}: {
  project: Project;
  onPreview: (src: string, alt: string) => void;
}) {
  const links: ReactNode[] = [
    <TextLink key="code" href={project.githubUrl} external>
      Code
    </TextLink>,
  ];

  if (project.demoUrl) {
    links.push(
      <TextLink key="site" href={project.demoUrl} external>
        View Site
      </TextLink>,
    );
  }

  if (project.previewImage) {
    links.push(
      <button
        key="preview"
        type="button"
        className={linkButtonClass}
        onClick={() => onPreview(project.previewImage!, project.name)}
      >
        Preview
      </button>,
    );
  }

  return (
    <span className="text-secondary">
      {" "}
      [
      {links.map((link, index) => (
        <span key={index}>
          {index > 0 && separator}
          {link}
        </span>
      ))}
      ]
    </span>
  );
}

export function Projects() {
  const [preview, setPreview] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <>
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
              <ProjectLinks
                project={project}
                onPreview={(src, alt) => setPreview({ src, alt })}
              />
            </li>
          ))}
        </ol>
      </section>

      <ProjectPreviewModal
        imageSrc={preview?.src ?? ""}
        imageAlt={preview?.alt ?? ""}
        isOpen={preview !== null}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
