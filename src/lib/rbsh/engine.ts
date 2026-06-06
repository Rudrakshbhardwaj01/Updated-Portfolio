import { commandRegistry, resolveCommand } from "@/data/rbsh-knowledge";
import {
  formatAbout,
  formatAutocomplete,
  formatBanner,
  formatContact,
  formatEasterEgg,
  formatEducation,
  formatExperience,
  formatExperienceDetail,
  formatFeatured,
  formatGithub,
  formatHelp,
  formatHistory,
  formatLeadership,
  formatLinks,
  formatLinkedin,
  formatMotd,
  formatProject,
  formatProjects,
  formatResume,
  formatSearch,
  formatSkill,
  formatSkills,
  formatWhoami,
  formatWriting,
  formatWritings,
} from "./formatters";
import type { CommandResult, ExecuteContext } from "./types";

export function parseCommandInput(input: string): {
  command: string;
  args: string[];
} {
  const trimmed = input.trim();

  if (!trimmed) {
    return { command: "", args: [] };
  }

  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  return { command, args };
}

export function executeCommand(
  input: string,
  context: ExecuteContext,
): CommandResult | null {
  const { command, args } = parseCommandInput(input);

  if (!command) {
    return null;
  }

  const canonical = resolveCommand(command);

  if (!canonical) {
    return {
      type: "error",
      lines: [`rbsh: command not found: ${command}`, "Type 'help' for available commands."],
    };
  }

  const entry = commandRegistry[canonical];

  if (entry.response) {
    if (canonical === "exit") {
      return { type: "exit", message: entry.response };
    }
    return formatEasterEgg(entry.response);
  }

  switch (canonical) {
    case "help":
      return formatHelp();
    case "clear":
      return { type: "clear" };
    case "history":
      return formatHistory(context.history);
    case "banner":
      return formatBanner();
    case "motd":
      return formatMotd();
    case "whoami":
      return formatWhoami();
    case "about":
      return formatAbout();
    case "skills":
      return formatSkills();
    case "skill":
      return formatSkill(args);
    case "experience":
      return args.length > 0 ? formatExperienceDetail(args) : formatExperience();
    case "projects":
      return formatProjects();
    case "project":
      return formatProject(args);
    case "featured":
      return formatFeatured();
    case "education":
      return formatEducation();
    case "leadership":
      return formatLeadership();
    case "writings":
      return formatWritings();
    case "writing":
      return formatWriting(args);
    case "contact":
      return formatContact();
    case "links":
      return formatLinks();
    case "github":
      return formatGithub();
    case "linkedin":
      return formatLinkedin();
    case "resume":
      return formatResume();
    case "search":
      return formatSearch(args);
    case "autocomplete":
      return formatAutocomplete(args);
    default:
      return {
        type: "error",
        lines: [`rbsh: '${canonical}' is not implemented`],
      };
  }
}
