import {
  autocompleteSources,
  commandRegistry,
  findExperience,
  findProject,
  findSkillGroup,
  findWriting,
  flattenProjectTech,
  getVisibleCommands,
  identity,
  knowledge,
  navigation,
  shell,
  sortedProjects,
} from "@/data/rbsh-knowledge";
import type { CommandResult, OutputLine } from "./types";

function text(value: string): OutputLine {
  return [{ kind: "text", value }];
}

function link(label: string, href: string): OutputLine {
  return [{ kind: "link", label, href }];
}

function blank(): OutputLine {
  return [{ kind: "text", value: "" }];
}

function isBlankLine(line: OutputLine | undefined): boolean {
  return (
    line?.length === 1 &&
    line[0].kind === "text" &&
    line[0].value === ""
  );
}

function trimTrailingBlank(lines: OutputLine[]): OutputLine[] {
  if (isBlankLine(lines.at(-1))) {
    lines.pop();
  }
  return lines;
}

function output(lines: OutputLine[]): CommandResult {
  return { type: "output", content: { lines } };
}

function error(lines: string[]): CommandResult {
  return { type: "error", lines };
}

export function formatHelp(): CommandResult {
  const lines: OutputLine[] = [
    text(`${shell.full_name} v${shell.version}`),
    blank(),
    text("Available commands:"),
    blank(),
  ];

  const grouped = new Map<string, typeof commandRegistry[string][]>();

  for (const entry of getVisibleCommands()) {
    const list = grouped.get(entry.category) ?? [];
    list.push(entry);
    grouped.set(entry.category, list);
  }

  for (const [, entries] of grouped) {
    for (const entry of entries) {
      const aliasNote =
        entry.aliases.length > 0
          ? ` (${entry.aliases.slice(0, 3).join(", ")})`
          : "";
      const argNote = entry.accepts_args
        ? ` ${entry.arg_description ?? "<arg>"}`
        : "";
      lines.push(
        text(
          `  ${entry.command}${argNote}`.padEnd(28) +
            `${entry.short_description}${aliasNote}`,
        ),
      );
    }
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  lines.push(text(`Type '${navigation.shell[0]}' or press Tab to autocomplete.`));

  return output(lines);
}

export function formatWhoami(): CommandResult {
  return output([
    text(identity.name),
    text(identity.title),
    blank(),
    text(identity.description),
    blank(),
    text(`location:     ${identity.location}`),
    text(`timezone:     ${identity.timezone}`),
    text(`availability: ${identity.availability}`),
    text(`email:        ${identity.email}`),
    text(`handle:       ${identity.handle}`),
  ]);
}

export function formatAbout(): CommandResult {
  return output([
    text(identity.name),
    text(identity.tagline),
    blank(),
    text(identity.description),
    blank(),
    text("focus:"),
    ...identity.keywords.map((keyword) => text(`  · ${keyword}`)),
  ]);
}

export function formatSkills(): CommandResult {
  const lines: OutputLine[] = [];

  for (const group of Object.values(knowledge.skills)) {
    lines.push(text(group.label));
    lines.push(text(`  ${group.items.join(", ")}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  lines.push(text("Use 'skill <name>' to inspect a group."));
  return output(lines);
}

export function formatSkill(args: string[]): CommandResult {
  const query = args.join(" ").trim();

  if (!query) {
    return error([
      "rbsh: skill: missing argument",
      `usage: skill <${autocompleteSources.skill_groups.join("|")}>`,
    ]);
  }

  const group = findSkillGroup(query);

  if (!group) {
    return error([`rbsh: skill: '${query}' not found`]);
  }

  return output([
    text(group.label),
    text(group.description),
    blank(),
    text(group.items.join(", ")),
  ]);
}

export function formatExperience(): CommandResult {
  const lines: OutputLine[] = [text("Experience:"), blank()];

  for (const entry of knowledge.experience) {
    lines.push(text(`  ${entry.period}  ·  ${entry.type}`));
    lines.push(text(`  ${entry.role} @ ${entry.company}`));
    lines.push(text(`  ${entry.short_description}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatExperienceDetail(args: string[]): CommandResult {
  const query = args.join(" ").trim();

  if (!query) {
    return error(["rbsh: experience: missing id", "usage: experience <id|alias>"]);
  }

  const entry = findExperience(query);

  if (!entry) {
    return formatExperience();
  }

  const lines: OutputLine[] = [
    text(`${entry.role} @ ${entry.company}`),
    text(`${entry.period}  ·  ${entry.type}`),
    blank(),
    text(entry.summary),
    blank(),
    text("highlights:"),
    ...entry.highlights.map((item) => text(`  · ${item}`)),
    blank(),
    text(`tech: ${entry.tech.join(", ")}`),
  ];

  if (entry.url) {
    lines.push(blank());
    lines.push(link("Company Website", entry.url));
  }

  return output(lines);
}

export function formatProjects(): CommandResult {
  const lines: OutputLine[] = [text("Projects:"), blank()];

  for (const project of sortedProjects()) {
    lines.push(text(`  ${project.slug}`));
    lines.push(text(`    ${project.name}`));
    lines.push(text(`    ${project.short_description}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  lines.push(text("Use 'project <name>' for details."));
  return output(lines);
}

export function formatFeatured(): CommandResult {
  const lines: OutputLine[] = [text("Featured projects:"), blank()];

  for (const project of sortedProjects(true)) {
    lines.push(text(`  ${project.name}`));
    lines.push(text(`    ${project.tagline}`));
    lines.push(text(`    stack: ${flattenProjectTech(project.tech).join(", ")}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatProject(args: string[]): CommandResult {
  const query = args.join(" ").trim();

  if (!query) {
    return error([
      "rbsh: project: missing argument",
      `usage: project <${autocompleteSources.project_slugs.join("|")}>`,
    ]);
  }

  const project = findProject(query);

  if (!project) {
    return error([`rbsh: project: '${query}' not found`]);
  }

  const lines: OutputLine[] = [
    text(project.name),
    blank(),
    text(project.description),
    blank(),
    text(`stack: ${flattenProjectTech(project.tech).join(", ")}`),
    blank(),
    text(`status: ${project.status}${project.featured ? " · featured" : ""}`),
  ];

  if (project.demo || project.repository) {
    lines.push(blank());
  }

  if (project.demo) {
    lines.push(link("Live Demo", project.demo));
  }

  if (project.repository) {
    if (project.demo) {
      lines.push(blank());
    }
    lines.push(link("GitHub Repository", project.repository));
  }

  return output(lines);
}

export function formatEducation(): CommandResult {
  const lines: OutputLine[] = [text("Education:"), blank()];

  for (const entry of knowledge.education) {
    const title = entry.degree
      ? `${entry.degree} — ${entry.field}`
      : (entry.level ?? entry.institution);
    lines.push(text(`  ${entry.institution}`));
    lines.push(text(`  ${title}`));
    lines.push(text(`  ${entry.period}  ·  ${entry.status}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatLeadership(): CommandResult {
  const lines: OutputLine[] = [text("Leadership:"), blank()];

  for (const entry of knowledge.leadership) {
    lines.push(text(`  ${entry.organization}`));
    lines.push(text(`  ${entry.role}`));
    lines.push(text(`  ${entry.period}`));
    lines.push(text(`  ${entry.short_description}`));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatWritings(): CommandResult {
  const lines: OutputLine[] = [text("Writings:"), blank()];

  for (const writing of knowledge.writings) {
    lines.push(text(`  ${writing.slug}`));
    lines.push(text(`    ${writing.title}`));
    lines.push(
      text(`    ${writing.published} · ${writing.category} · ${writing.read_time}`),
    );
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  lines.push(text("Use 'writing <slug>' to read details."));
  return output(lines);
}

export function formatWriting(args: string[]): CommandResult {
  const query = args.join(" ").trim();

  if (!query) {
    return error([
      "rbsh: writing: missing argument",
      `usage: writing <${autocompleteSources.writing_slugs.join("|")}>`,
    ]);
  }

  const writing = findWriting(query);

  if (!writing) {
    return error([`rbsh: writing: '${query}' not found`]);
  }

  const lines: OutputLine[] = [
    text(writing.title),
    text(`${writing.published} · ${writing.category} · ${writing.read_time}`),
    blank(),
    text(writing.summary),
    blank(),
    link("Read Article", writing.url),
  ];

  return output(lines);
}

export function formatContact(): CommandResult {
  const lines: OutputLine[] = [
    text("Contact:"),
    blank(),
    text(`  email: ${identity.email}`),
    text(`  location: ${identity.location}`),
    text(`  availability: ${identity.availability}`),
    blank(),
    text("actions:"),
    blank(),
  ];

  for (const action of Object.values(knowledge.contact_actions)) {
    lines.push(link(action.label, action.action));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatLinks(): CommandResult {
  const lines: OutputLine[] = [text("Links:"), blank()];

  for (const entry of Object.values(knowledge.links)) {
    lines.push(link(entry.label, entry.url));
    lines.push(blank());
  }

  trimTrailingBlank(lines);

  return output(lines);
}

export function formatGithub(): CommandResult {
  const profile = knowledge.github_profile;

  return output([
    text(`@${profile.username}`),
    blank(),
    text(`repositories: ${profile.total_repositories}`),
    text(`followers: ${profile.followers}  ·  following: ${profile.following}`),
    blank(),
    text("pinned:"),
    ...profile.pinned_repositories.map((repo) => text(`  · ${repo}`)),
    blank(),
    link("View Profile", profile.actions.view_profile),
    blank(),
    link("Browse Repositories", profile.actions.view_repos),
  ]);
}

export function formatLinkedin(): CommandResult {
  const linkedin = knowledge.links.linkedin;
  return output([
    text(linkedin.label),
    blank(),
    link("Open LinkedIn Profile", linkedin.url),
  ]);
}

export function formatResume(): CommandResult {
  return output([
    text(`${identity.name} — ${identity.title}`),
    blank(),
    text(identity.short_description),
    blank(),
    text(`email: ${identity.email}`),
    text(`location: ${identity.location}`),
    blank(),
    text("Use 'contact' for ways to reach out."),
  ]);
}

export function formatSearch(args: string[]): CommandResult {
  const query = args.join(" ").trim().toLowerCase();

  if (!query) {
    return error(["rbsh: search: missing query", "usage: search <query>"]);
  }

  const lines: OutputLine[] = [text(`search: ${query}`), blank()];
  let hits = 0;

  for (const project of knowledge.projects) {
    const haystack = [
      project.name,
      project.slug,
      project.short_description,
      ...project.tags,
      ...project.keywords,
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(query)) {
      hits += 1;
      lines.push(text(`  project  ${project.slug}  —  ${project.name}`));
    }
  }

  for (const writing of knowledge.writings) {
    const haystack = [writing.title, writing.slug, ...writing.tags, ...writing.keywords]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(query)) {
      hits += 1;
      lines.push(text(`  writing  ${writing.slug}  —  ${writing.title}`));
    }
  }

  for (const entry of knowledge.experience) {
    const haystack = [
      entry.company,
      entry.role,
      entry.short_description,
      ...entry.tags,
      ...entry.keywords,
    ]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(query)) {
      hits += 1;
      lines.push(text(`  experience  ${entry.id}  —  ${entry.company}`));
    }
  }

  for (const [key, group] of Object.entries(knowledge.skills)) {
    const haystack = [key, group.label, ...group.items, ...group.keywords]
      .join(" ")
      .toLowerCase();

    if (haystack.includes(query)) {
      hits += 1;
      lines.push(text(`  skill  ${key}  —  ${group.label}`));
    }
  }

  if (hits === 0) {
    lines.push(text("  no matches"));
  }

  return output(lines);
}

export function formatHistory(history: string[]): CommandResult {
  if (history.length === 0) {
    return output([text("(no commands in session)")]);
  }

  return output(history.map((entry, index) => text(`  ${index + 1}  ${entry}`)));
}

export function formatBanner(): CommandResult {
  return output(shell.startup.banner.map((line) => text(line)));
}

export function formatMotd(): CommandResult {
  const lines: OutputLine[] = [];

  if (shell.startup.welcome_message) {
    lines.push(text(shell.startup.welcome_message));
    lines.push(blank());
  }

  if (shell.startup.motd) {
    lines.push(text(shell.startup.motd));
  }

  return output(lines);
}

export function formatAutocomplete(args: string[]): CommandResult {
  const partial = args.join(" ").trim().toLowerCase();
  const matches = autocompleteSources.commands.filter((command) =>
    command.startsWith(partial),
  );

  if (matches.length === 0) {
    return output([text(`no completions for '${partial || "<empty>"}'`)]);
  }

  return output(matches.map((match) => text(`  ${match}`)));
}

export function formatEasterEgg(response: string): CommandResult {
  return output([text(response)]);
}
