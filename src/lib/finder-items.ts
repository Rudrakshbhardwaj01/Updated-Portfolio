/**
 * Server-side builder for the finder's searchable index.
 *
 * Lives apart from the CommandPalette component because it reads the local
 * filesystem (via src/lib/posts.ts) — it must never be imported from client
 * code. The root layout calls it at build time and passes the plain item
 * array down as props.
 *
 * Everything is derived from the existing data modules (site, experience,
 * notes, projects, posts). No second content registry is maintained here.
 */

import { navLinks, siteConfig } from "@/data/site";
import { notesItems } from "@/data/notes";
import { projects } from "@/data/projects";
import { getAllPosts } from "@/lib/posts";
import type { FinderItem } from "@/lib/finder";

function slugifyId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function buildFinderItems(): FinderItem[] {
  const items: FinderItem[] = [];

  items.push({
    id: "page-home",
    group: "Pages",
    title: "Home",
    description: siteConfig.tagline,
    href: "/",
    keywords: "home index start about bio hero introduction",
    meta: "/",
  });

  for (const link of navLinks) {
    items.push({
      id: `page-${slugifyId(link.label)}`,
      group: "Pages",
      title: link.label,
      description:
        link.label === "Experience"
          ? "Internship admission tickets — EY, VertexPlus, Dotsquares"
          : link.label === "Work"
            ? "Featured and other projects"
            : link.label === "Skills"
              ? "AI/ML, backend, frontend, and infrastructure stack"
              : undefined,
      href: link.href,
      keywords:
        link.label === "Writings"
          ? "blog articles essays posts writing"
          : link.label === "Shelf"
            ? "books papers reading library references"
            : link.label === "My Notes"
              ? "handwritten study notes pdf downloads"
              : undefined,
      meta: link.href,
    });
  }

  for (const note of notesItems) {
    if (!note.link) continue;
    items.push({
      id: `page-note-${note.id}`,
      group: "Pages",
      title: note.title,
      description: note.description,
      href: note.link,
      keywords: "notes pdf handwritten study download",
      meta: "PDF",
    });
  }

  for (const post of getAllPosts()) {
    items.push({
      id: `writing-${post.slug}`,
      group: "Writings",
      title: post.title,
      description: post.description,
      href: `/writings/${post.slug}`,
      keywords: `${post.category} writing blog article essay deep dive`,
      meta: post.category,
    });
  }

  for (const project of projects) {
    items.push({
      id: `project-${slugifyId(project.name)}`,
      group: "Projects",
      title: project.name,
      description: project.tagline,
      href: project.demoUrl ?? project.githubUrl,
      external: true,
      keywords: `${project.tech.join(" ")} project github repository open source`,
      meta: project.demoUrl ? "Live demo" : "GitHub",
    });
  }

  items.push(
    {
      id: "action-theme",
      group: "Actions",
      title: "Toggle Light / Dark Theme",
      description: "Switch the site's appearance",
      action: "toggle-theme",
      keywords: "dark mode light appearance theme color toggle",
    },
    {
      id: "action-terminal",
      group: "Actions",
      title: "Open RBSH Terminal",
      description: "Explore the portfolio from a shell",
      action: "open-terminal",
      keywords: "terminal shell rbsh cli command line prompt console",
    },
    {
      id: "action-bot",
      group: "Actions",
      title: "Open BhardwajBot",
      description: "Ask an AI about Rudraksh's work",
      action: "open-bot",
      keywords: "ai chat assistant chatbot ask questions bot",
    },
    {
      id: "action-resume",
      group: "Actions",
      title: "Open Résumé (PDF)",
      description: "View the resume in a new tab",
      href: siteConfig.resumeUrl,
      external: true,
      keywords: "resume cv pdf hiring recruiter experience",
      meta: "PDF",
    },
    {
      id: "action-email",
      group: "Actions",
      title: "Copy Email Address",
      description: "rudrakshbhardwaj01@gmail.com",
      action: "copy-email",
      value: siteConfig.email.replace(/^mailto:/i, ""),
      keywords: "email contact mail copy reach hire",
    },
  );

  return items;
}
