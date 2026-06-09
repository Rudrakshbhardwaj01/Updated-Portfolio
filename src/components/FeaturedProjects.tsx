"use client";

import Image from "next/image";
import { useState } from "react";
import { featuredProjects, type Project } from "@/data/projects";
import { ProjectPreviewModal } from "./ProjectPreviewModal";
import { SectionHeading } from "./SectionHeading";

function ProjectCard({
  project,
  onPreview,
}: {
  project: Project;
  onPreview: (src: string, alt: string) => void;
}) {
  const content = project.previewImage ? (
    <button
      type="button"
      className="block h-full w-full"
      onClick={() => onPreview(project.previewImage!, project.name)}
      aria-label={`Preview ${project.name}`}
    >
      <Image
        src={project.previewImage}
        alt={`${project.name} screenshot`}
        width={640}
        height={480}
        className="h-full w-full object-cover object-top"
      />
    </button>
  ) : (
    <div className="brutal-card-placeholder">
      <p className="brutal-card-placeholder-title">{project.name}</p>
      <p className="brutal-card-placeholder-sub">{project.tagline}</p>
    </div>
  );

  return (
    <div className="brutal-card-stack">
      <div className="brutal-card">{content}</div>
    </div>
  );
}

function ProjectRow({
  project,
  index,
  onPreview,
}: {
  project: Project;
  index: number;
  onPreview: (src: string, alt: string) => void;
}) {
  const reversed = index % 2 === 1;

  return (
    <article
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${
        reversed ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      <ProjectCard project={project} onPreview={onPreview} />

      <div>
        <h3 className="brutal-project-title text-primary">{project.name}</h3>
        <p className="brutal-label mt-2">{project.tagline}</p>

        <p className="brutal-body-lg mt-5">{project.description}</p>

        {project.highlights.length > 0 && (
          <ul className="mt-5 space-y-2">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="brutal-body flex gap-2">
                <span className="shrink-0 text-secondary/50" aria-hidden="true">
                  —
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap gap-2.5">
          {project.tech.map((tech) => (
            <span key={tech} className="brutal-tech-pill">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-4">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn font-mono tracking-widest uppercase"
            >
              Visit ↗
            </a>
          )}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn font-mono tracking-widest uppercase"
          >
            Code ↗
          </a>
        </div>
      </div>
    </article>
  );
}

export function FeaturedProjects() {
  const [preview, setPreview] = useState<{
    src: string;
    alt: string;
  } | null>(null);

  return (
    <>
      <section id="work" aria-labelledby="work-heading" className="section">
        <hr className="brutal-divider mb-12" />
        <SectionHeading id="work-heading">Projects</SectionHeading>

        <div className="space-y-20 lg:space-y-28">
          {featuredProjects.map((project, index) => (
            <ProjectRow
              key={project.name}
              project={project}
              index={index}
              onPreview={(src, alt) => setPreview({ src, alt })}
            />
          ))}
        </div>
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
