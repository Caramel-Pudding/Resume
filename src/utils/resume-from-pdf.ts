import { cache } from "react";
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

export type ResumeDraft = {
  name?: string;
  summary?: string;
  links: string[];
  experienceRaw?: string;
  educationRaw?: string;
};

function extractBetween(text: string, start: string, end?: string) {
  const s = text.indexOf(start);
  if (s === -1) return undefined;
  const e = end ? text.indexOf(end, s + start.length) : -1;
  return (
    e === -1 ? text.slice(s + start.length) : text.slice(s + start.length, e)
  ).trim();
}

function resolvePdfPath(input?: string) {
  // Prefer explicit absolute path; otherwise assume within project or /public
  if (input && path.isAbsolute(input)) return input;
  const candidate = input ?? "Resume.pdf";
  // If caller gave "public/foo.pdf" or "foo.pdf", normalize into project root
  const fromPublic = candidate.startsWith("public/")
    ? candidate
    : path.join("public", candidate);
  return path.resolve(process.cwd(), fromPublic);
}

export const getResumeFromPdf = cache(
  async (pdfPath?: string): Promise<ResumeDraft> => {
    const filePath = resolvePdfPath(pdfPath);
    try {
      await fs.access(filePath); // throws if missing
    } catch {
      throw new Error(
        `PDF not found at: ${filePath}\n` +
          `Place your file in /public and call getResumeFromPdf("Resume.pdf").`,
      );
    }

    const buf = await fs.readFile(filePath);
    if (!buf?.length)
      throw new Error(`PDF at ${filePath} is empty or unreadable`);

    const { text } = await pdf(buf);

    const links = Array.from(
      new Set(Array.from(text.matchAll(/https?:\/\/\\S+/g)).map((m) => m[0])),
    );
    const summary = extractBetween(text, "Summary", "Experience");
    const experienceRaw = extractBetween(text, "Experience", "Education");
    const educationRaw = extractBetween(text, "Education");
    const firstLines = text
      .split(/\\r?\\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const name = firstLines.find((l) =>
      /^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/.test(l),
    );

    return { name, summary, links, experienceRaw, educationRaw };
  },
);
