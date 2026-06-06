import knowledgeJson from "./rbsh-knowledge.json";
import type { CommandRegistryEntry } from "@/lib/rbsh/types";

export type RBSHProject = (typeof knowledgeJson.projects)[number];
export type RBSHExperience = (typeof knowledgeJson.experience)[number];
export type RBSHWriting = (typeof knowledgeJson.writings)[number];
export type RBSHSkillGroup = (typeof knowledgeJson.skills)[keyof typeof knowledgeJson.skills];
export type RBSHEducation = (typeof knowledgeJson.education)[number];
export type RBSHLeadership = (typeof knowledgeJson.leadership)[number];

export const knowledge = knowledgeJson;

export const shell = knowledge.shell;
export const identity = knowledge.identity;
export const commandRegistry = knowledge.command_registry as Record<
  string,
  CommandRegistryEntry
>;
export const autocompleteSources = knowledge.autocomplete;
export const navigation = knowledge.navigation;

const aliasMap = new Map<string, string>();

for (const [key, entry] of Object.entries(commandRegistry)) {
  aliasMap.set(entry.command.toLowerCase(), key);
  for (const alias of entry.aliases) {
    aliasMap.set(alias.toLowerCase(), key);
  }
}

export function resolveCommand(input: string): string | null {
  return aliasMap.get(input.toLowerCase()) ?? null;
}

export function getVisibleCommands(): CommandRegistryEntry[] {
  return Object.values(commandRegistry).filter((entry) => !entry.hidden);
}

export function findProject(query: string): RBSHProject | undefined {
  const normalized = query.toLowerCase();
  return knowledge.projects.find(
    (project) =>
      project.slug === normalized ||
      project.id === normalized ||
      project.alias.some((alias) => alias.toLowerCase() === normalized) ||
      project.name.toLowerCase() === normalized,
  );
}

export function findWriting(query: string): RBSHWriting | undefined {
  const normalized = query.toLowerCase();
  return knowledge.writings.find(
    (writing) =>
      writing.slug === normalized ||
      writing.id === normalized ||
      writing.alias.some((alias) => alias.toLowerCase() === normalized),
  );
}

export function findExperience(query: string): RBSHExperience | undefined {
  const normalized = query.toLowerCase();
  return knowledge.experience.find(
    (entry) =>
      entry.id === normalized ||
      entry.alias.some((alias) => alias.toLowerCase() === normalized) ||
      entry.company.toLowerCase().includes(normalized),
  );
}

export function findSkillGroup(query: string): RBSHSkillGroup | undefined {
  const normalized = query.toLowerCase();
  const groups = Object.entries(knowledge.skills);

  for (const [key, group] of groups) {
    if (
      key === normalized ||
      group.label.toLowerCase() === normalized ||
      group.alias.some((alias) => alias.toLowerCase() === normalized)
    ) {
      return group;
    }
  }

  return undefined;
}

export function flattenProjectTech(
  tech: RBSHProject["tech"],
): string[] {
  if (Array.isArray(tech)) {
    return tech;
  }

  return [
    ...(tech.frontend ?? []),
    ...(tech.backend ?? []),
    ...(tech.concepts ?? []),
  ];
}

export function sortedProjects(featuredOnly = false): RBSHProject[] {
  const projects = featuredOnly
    ? knowledge.projects.filter((project) => project.featured)
    : [...knowledge.projects];

  return projects.sort((a, b) => {
    if (featuredOnly) {
      return (a.featured_order ?? 99) - (b.featured_order ?? 99);
    }
    return a.display_order - b.display_order;
  });
}
