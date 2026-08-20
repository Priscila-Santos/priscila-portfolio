import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";

/**
 * Case study content, structured to feed both the Work page UI and, later,
 * potentially other consumers (an RSS feed, a sitemap entry, etc.).
 */
export type CaseStudyLink = {
  label: string;
  href: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  stack: string[];
  aiRole?: "AI-powered feature" | "AI-assisted development";
  problem: string;
  whatIDid: string[];
  outcome: string;
  link?: CaseStudyLink;
};

/**
 * Abstraction boundary so app/work/page.tsx never talks to a storage
 * mechanism directly — it only ever calls getCaseStudies(). Swapping the
 * content source later (Notion, Sanity, a Google Form -> Sheet export, any
 * headless CMS) means writing one new class that implements this interface
 * and pointing `caseStudyProvider` at it below. No component changes.
 *
 * Sketch of what that looks like later (not implemented, just the shape):
 *
 *   export class NotionCaseStudyProvider implements CaseStudyProvider {
 *     async getCaseStudies(): Promise<CaseStudy[]> {
 *       const pages = await notion.databases.query({ database_id: WORK_DB_ID });
 *       return pages.results.map(mapNotionPageToCaseStudy);
 *     }
 *   }
 *
 *   export const caseStudyProvider: CaseStudyProvider = new NotionCaseStudyProvider();
 */
export interface CaseStudyProvider {
  getCaseStudies(): Promise<CaseStudy[]>;
}

const WORK_DIR = path.join(process.cwd(), "content", "work");

/** Pulls the body text under a "## Heading" up to the next "## " heading or end of file. */
function extractSection(body: string, heading: string): string | undefined {
  const pattern = new RegExp(`##\\s+${heading}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "i");
  const match = body.match(pattern);
  return match ? match[1].trim() : undefined;
}

/** Parses "- bullet" lines out of a section's raw text, in order. */
function parseBulletList(section: string): string[] {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

type ParsedCaseStudyFile = CaseStudy & { order: number };

async function parseCaseStudyFile(file: string): Promise<ParsedCaseStudyFile> {
  const slug = file.replace(/\.md$/, "");
  const raw = await readFile(path.join(WORK_DIR, file), "utf-8");
  const { data, content } = matter(raw);
  const body = content.trim();

  const aiRole =
    data.aiRole === "AI-powered feature" || data.aiRole === "AI-assisted development"
      ? (data.aiRole as CaseStudy["aiRole"])
      : undefined;

  const link =
    data.link && typeof data.link === "object" && data.link.label && data.link.href
      ? { label: String(data.link.label), href: String(data.link.href) }
      : undefined;

  return {
    slug,
    title: String(data.title ?? slug),
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    aiRole,
    problem: extractSection(body, "Problem") ?? "",
    whatIDid: parseBulletList(extractSection(body, "What I Did") ?? ""),
    outcome: extractSection(body, "Outcome") ?? "",
    link,
    order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
  };
}

/**
 * Reads every content/work/*.md file, parses frontmatter + the three
 * standard sections (Problem / What I Did / Outcome), and returns them
 * sorted by the optional `order` field (files without one sort last, in
 * whatever order the filesystem returns them).
 */
export class MarkdownCaseStudyProvider implements CaseStudyProvider {
  async getCaseStudies(): Promise<CaseStudy[]> {
    const files = await readdir(WORK_DIR);
    const markdownFiles = files.filter((file) => file.endsWith(".md"));

    const studies = await Promise.all(markdownFiles.map(parseCaseStudyFile));

    return studies
      .sort((a, b) => a.order - b.order)
      .map(({ order: _order, ...rest }) => rest);
  }
}

/**
 * Single point of configuration for where case study content comes from —
 * same pattern already used in lib/ai/portfolio-chat.ts for the model
 * selection. Change this one line to switch providers later.
 */
export const caseStudyProvider: CaseStudyProvider = new MarkdownCaseStudyProvider();

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return caseStudyProvider.getCaseStudies();
}