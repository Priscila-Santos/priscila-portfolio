import { readFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";

import { getCaseStudies, type CaseStudy } from "@/lib/work/case-studies";

const ABOUT_PATH = path.join(process.cwd(), "content", "portfolio", "about.md");

export type PortfolioSourceSummary = {
  slug: string;
  title: string;
  topic: string;
  stack: string;
};

export type PortfolioSource = {
  slug: string;
  title: string;
  content: string;
};

/** Reassembles a CaseStudy's structured fields back into the same
 * Problem/What I Did/Outcome markdown shape the source file was written
 * in, so checkGrounding's word-overlap heuristic sees the same text a
 * human editing content/work/*.md would. */
function caseStudyToContent(study: CaseStudy): string {
  return [
    `## Problem\n${study.problem}`,
    `## What I Did\n${study.whatIDid.map((item) => `- ${item}`).join("\n")}`,
    `## Outcome\n${study.outcome}`,
  ].join("\n\n");
}

async function readAboutSource(): Promise<PortfolioSource | null> {
  try {
    const raw = await readFile(ABOUT_PATH, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug: "about",
      title: String(data.title ?? "About"),
      content: content.trim(),
    };
  } catch {
    return null;
  }
}

async function readAboutSummary(): Promise<PortfolioSourceSummary | null> {
  try {
    const raw = await readFile(ABOUT_PATH, "utf-8");
    const { data } = matter(raw);

    return {
      slug: "about",
      title: String(data.title ?? "About"),
      topic: String(data.topic ?? "Background"),
      stack: String(data.stack ?? ""),
    };
  } catch {
    return null;
  }
}

export async function listPortfolioSources(): Promise<PortfolioSourceSummary[]> {
  const [about, caseStudies] = await Promise.all([readAboutSummary(), getCaseStudies()]);

  const caseStudySummaries: PortfolioSourceSummary[] = caseStudies.map((study) => ({
    slug: study.slug,
    title: study.title,
    // Previously each content/portfolio file had its own hand-written
    // "topic" string (e.g. "React project"). Using the stack list here
    // instead is slightly less editorial but stays accurate automatically
    // as content/work/*.md changes, and is arguably more useful for the
    // model to match a query like "which project uses Java?".
    topic: study.stack.join(", "),
    stack: study.stack.join(", "),
  }));

  return about ? [about, ...caseStudySummaries] : caseStudySummaries;
}

export async function readPortfolioSource(slug: string): Promise<PortfolioSource | null> {
  if (slug === "about") {
    return readAboutSource();
  }

  const caseStudies = await getCaseStudies();
  const match = caseStudies.find((study) => study.slug === slug);

  if (!match) {
    return null;
  }

  return {
    slug: match.slug,
    title: match.title,
    content: caseStudyToContent(match),
  };
}