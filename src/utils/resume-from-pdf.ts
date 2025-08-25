// lib/get-resume-from-pdf.ts
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
  topSkills?: string[];
  languages?: string[];
};

// ---- Config ---------------------------------------------------------------

type SectionKey =
  | "contact"
  | "topSkills"
  | "languages"
  | "summary"
  | "experience"
  | "education";

type SectionConfig = { key: SectionKey; label: string; optional?: boolean };

/** LinkedIn PDF export is stable; keep all headers here (easy to tweak later). */
export const LINKEDIN_SECTIONS: SectionConfig[] = [
  { key: "contact", label: "Contact", optional: true },
  { key: "topSkills", label: "Top Skills", optional: true },
  { key: "languages", label: "Languages", optional: true },
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
];

const NOISE_LINE_PATTERNS = [
  /^\s*Page\s+\d+\s+of\s+\d+\s*$/i, // "Page 1 of 3"
];

// ---- Utils ----------------------------------------------------------------

function resolvePdfPath(fileName = "Profile.pdf") {
  return path.resolve(process.cwd(), "public", fileName);
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Normalize raw PDF text: unify newlines, remove noise, fix hyphenated breaks & broken URLs. */
function normalize(text: string): string {
  let t = text.replace(/\r\n?/g, "\n");

  // drop obvious noise lines
  t = t
    .split("\n")
    .filter((line) => !NOISE_LINE_PATTERNS.some((re) => re.test(line.trim())))
    .join("\n");

  // fix broken URLs across newlines (with or without hyphen)
  t = t.replace(/(www\.\S+)[\n]+(\S+)/g, "$1$2");

  // // collapse excessive blank lines but keep paragraphs
  // t = t.replace(/\n{3,}/g, "\n\n");

  return t.trim();
}

/** Split the whole doc by configured section headers. */
function splitSections(text: string, sections: SectionConfig[]) {
  type Found = {
    key: SectionKey;
    start: number;
    headerLen: number;
    label: string;
  };
  const found: Found[] = [];

  for (const s of sections) {
    const re = new RegExp(`^${escapeRegExp(s.label)}\\s*$`, "mi");
    const m = re.exec(text);
    if (m) {
      found.push({
        key: s.key,
        start: m.index,
        headerLen: m[0].length,
        label: s.label,
      });
    } else if (!s.optional) {
      // tolerate minor variance: return empty section instead of throwing
      found.push({ key: s.key, start: -1, headerLen: 0, label: s.label });
    }
  }

  // only keep real hits and sort by position
  const hits = found
    .filter((f) => f.start >= 0)
    .sort((a, b) => a.start - b.start);

  const out: Partial<Record<SectionKey, string>> = {};
  for (let i = 0; i < hits.length; i++) {
    const cur = hits[i];
    const next = hits[i + 1];
    const contentStart = cur.start + cur.headerLen;
    const contentEnd = next ? next.start : text.length;
    out[cur.key] = text.slice(contentStart, contentEnd).trim();
  }

  return out;
}

/** Get the first reasonable name-like line near the top (before other headers). */
function extractName(fullText: string): string | undefined {
  const headerLabels = new Set(LINKEDIN_SECTIONS.map((s) => s.label));
  const lines = fullText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // scan the top part; name is usually very early (before Summary/Experience)
  for (const line of lines.slice(0, 80)) {
    if (headerLabels.has(line)) continue; // skip headers
    // "Eric Kuznetsov", allow unicode letters, dots, apostrophes, dashes
    if (/^(?:[A-Z][\p{L}.'-]+(?:\s|$)){2,}$/u.test(line)) return line;
  }
  return undefined;
}

function extractLinks(text: string): string[] {
  const hits = text.match(/\b(?:https?:\/\/|www\.)[^\s)]+/gi) || [];
  const clean = hits.map((raw) => {
    let url = raw.replace(/[)\].,;:!?]+$/g, ""); // trim trailing punctuation
    if (url.startsWith("www.")) url = "https://" + url;
    return url;
  });
  return Array.from(new Set(clean));
}

// ---- Main -----------------------------------------------------------------

export const getResumeFromPdf = cache(async (): Promise<ResumeDraft> => {
  const filePath = resolvePdfPath();

  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`PDF not found at: ${filePath}`);
  }

  const buf = await fs.readFile(filePath);
  if (!buf?.length)
    throw new Error(`PDF at ${filePath} is empty or unreadable`);

  const { text } = await pdf(buf);
  const normalized = normalize(text);
  const sections = splitSections(normalized, LINKEDIN_SECTIONS);

  const summary = sections.summary;
  const experienceRaw = sections.experience;
  const educationRaw = sections.education;

  const name = extractName(normalized);
  const links = extractLinks(normalized);

  return { name, summary, links, experienceRaw, educationRaw };
});
