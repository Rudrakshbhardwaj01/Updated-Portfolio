import { autocompleteSources, resolveCommand } from "@/data/rbsh-knowledge";

export function getAutocompleteMatches(input: string): string[] {
  const trimmed = input.trimStart();

  if (!trimmed) {
    return [...autocompleteSources.commands];
  }

  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    const partial = trimmed.toLowerCase();
    return autocompleteSources.commands.filter((command) =>
      command.startsWith(partial),
    );
  }

  const commandPart = trimmed.slice(0, spaceIndex).toLowerCase();
  const argPart = trimmed.slice(spaceIndex + 1).toLowerCase();
  const canonical = resolveCommand(commandPart);

  if (!canonical) {
    return [];
  }

  let pool: string[] = [];

  switch (canonical) {
    case "project":
      pool = autocompleteSources.project_slugs;
      break;
    case "writing":
      pool = autocompleteSources.writing_slugs;
      break;
    case "skill":
      pool = autocompleteSources.skill_groups;
      break;
    case "experience":
      pool = autocompleteSources.experience_ids;
      break;
    default:
      return [];
  }

  return pool.filter((item) => item.startsWith(argPart));
}

export function applyAutocomplete(input: string, match: string): string {
  const leading = input.match(/^\s*/)?.[0] ?? "";
  const trimmed = input.trimStart();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return `${leading}${match} `;
  }

  const commandPart = trimmed.slice(0, spaceIndex);
  return `${leading}${commandPart} ${match} `;
}

export function longestCommonPrefix(matches: string[]): string {
  if (matches.length === 0) {
    return "";
  }

  const sorted = [...matches].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  let index = 0;

  while (index < first.length && first[index] === last[index]) {
    index += 1;
  }

  return first.slice(0, index);
}
