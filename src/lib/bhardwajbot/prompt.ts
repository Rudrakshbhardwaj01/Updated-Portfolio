import { buildRelevantKnowledge } from "./knowledge";
import type { PageContext } from "./types";

export type { PageContext };

function formatPageContext(context: PageContext): string {
  const parts = [context.pathname];

  if (context.title) {
    parts.push(context.title);
  }

  if (context.slug) {
    parts.push(`writing:${context.slug}`);
  }

  return parts.join(" · ");
}

export function buildSystemPrompt(
  userQuery: string,
  pageContext?: PageContext,
): { prompt: string; promptChars: number; sections: string[] } {
  const { content, sections } = buildRelevantKnowledge(userQuery, pageContext);
  const page = pageContext ? formatPageContext(pageContext) : "unknown";

  const prompt = `You are BhardwajBot, guide to Rudraksh Bhardwaj's portfolio. Be concise (under 80 words). Use only DATA. Never invent facts. If missing, say: "I couldn't find that information in Rudraksh's portfolio." To navigate, end with <!--NAV:/path--> (paths: /, /#projects-heading, /#experience-heading, /#education-heading, /writings, /writings/rag-101, /writings/transferlearning, /writings/how-bitcoin-is-mined). Visitor page: ${page}.

DATA:
${content}`;

  return {
    prompt,
    promptChars: prompt.length,
    sections,
  };
}
