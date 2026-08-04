import { readdir, readFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";

/**
 * Adapted from lib/ai/sources.ts (Study-Grounded Study Notes Agent).
 * Same pattern, different content root: portfolio project/bio pages
 * instead of study material.
 */
const PORTFOLIO_DIR = path.join(process.cwd(), "content", "portfolio");

async function getAllowedSlugs(): Promise<string[]> {
  const files = await readdir(PORTFOLIO_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export async function listPortfolioSources(): Promise<
  { slug: string; title: string; topic: string; stack: string }[]
> {
  const files = await readdir(PORTFOLIO_DIR);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));

  return Promise.all(
    markdownFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = await readFile(path.join(PORTFOLIO_DIR, file), "utf-8");
      const { data } = matter(raw);

      return {
        slug,
        title: String(data.title ?? slug),
        topic: String(data.topic ?? ""),
        stack: String(data.stack ?? ""),
      };
    }),
  );
}

export async function readPortfolioSource(
  slug: string,
): Promise<{ slug: string; title: string; content: string } | null> {
  const allowedSlugs = await getAllowedSlugs();
  if (!allowedSlugs.includes(slug)) {
    return null;
  }

  const raw = await readFile(path.join(PORTFOLIO_DIR, `${slug}.md`), "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    content: content.trim(),
  };
}