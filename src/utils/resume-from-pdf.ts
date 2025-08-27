// lib/get-resume-from-pdf.server.ts
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

/** Normalize: unify newlines, drop obvious noise, fix common LinkedIn-broken URLs. */
function normalize(text: string): string {
  let t = text.replace(/\r\n?/g, "\n");

  // drop obvious noise lines
  t = t
    .split("\n")
    .filter((line) => !NOISE_LINE_PATTERNS.some((re) => re.test(line.trim())))
    .join("\n");

  // fix broken "www." URLs split by newline: "www.linked...\n...in.com" -> single token
  t = t.replace(/(www\.\S+)[\n]+(\S+)/g, "$1$2");

  return t.trim();
}

/** Split sections but also retain exact [start,end) ranges in the original text. */
type SectionSlice = {
  key: SectionKey;
  start: number; // content start
  end: number; // content end (exclusive)
  content: string;
};

function splitSectionsWithRanges(text: string, sections: SectionConfig[]) {
  const found: { key: SectionKey; idx: number; len: number }[] = [];

  for (const s of sections) {
    const re = new RegExp(`^${escapeRegExp(s.label)}\\s*$`, "mi");
    const m = re.exec(text);
    if (m) {
      found.push({ key: s.key, idx: m.index, len: m[0].length });
    } else if (!s.optional) {
      // keep order stable even if required header is missing
      found.push({ key: s.key, idx: -1, len: 0 });
    }
  }

  const hits = found.filter((f) => f.idx >= 0).sort((a, b) => a.idx - b.idx);

  const out: Partial<Record<SectionKey, SectionSlice>> = {};
  for (let i = 0; i < hits.length; i++) {
    const cur = hits[i];
    const next = hits[i + 1];
    const start = cur.idx + cur.len;
    const end = next ? next.idx : text.length;
    out[cur.key] = {
      key: cur.key,
      start,
      end,
      content: text.slice(start, end).trim(),
    };
  }
  return out;
}

/** Get the three non-empty lines immediately before the "Summary" header. */
function getPreSummaryTrio(text: string): {
  trio?: string[];
  trioStartOffset?: number;
} {
  const lines = text.split("\n");

  // precompute line start offsets
  const offsets: number[] = new Array(lines.length);
  let acc = 0;
  for (let i = 0; i < lines.length; i++) {
    offsets[i] = acc;
    acc += lines[i].length + 1; // +1 for '\n'
  }

  const idxSummary = lines.findIndex((l) => l.trim() === "Summary");
  if (idxSummary < 0) return {};

  const trioIdxs: number[] = [];
  for (let i = idxSummary - 1; i >= 0 && trioIdxs.length < 3; i--) {
    if (lines[i].trim().length === 0) continue;
    trioIdxs.unshift(i);
  }
  if (trioIdxs.length !== 3) return {};

  const trio = trioIdxs.map((i) => lines[i].trim());
  const trioStartOffset = offsets[trioIdxs[0]];
  return { trio, trioStartOffset };
}

export function dedupeKeepOrder<T>(arr: T[]) {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

function extractList(block?: string): string[] | undefined {
  if (!block) return undefined;

  const items = block
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    // strip bullets
    .map((l) => l.replace(/^[•\-\*\u2022]+[\s\u00A0]*/, ""))
    // collapse extra spaces
    .map((l) => l.replace(/\s{2,}/g, " "))
    // trim trailing commas/semicolons
    .map((l) => l.replace(/[;,]\s*$/g, ""))
    // keep short one-liners
    .filter((l) => l.length > 0 && l.length <= 80);

  return items.length ? dedupeKeepOrder(items) : undefined;
}

function extractLinks(text: string): string[] {
  const hits = text.match(/\b(?:https?:\/\/|www\.)[^\s)]+/gi) || [];
  const clean = hits.map((raw) => {
    let url = raw.replace(/[)\].,;:!?]+$/g, "");
    if (url.startsWith("www.")) url = "https://" + url;
    return url;
  });
  return Array.from(new Set(clean));
}

// ---- Main -----------------------------------------------------------------

export const getResumeFromPdf = cache(
  async (fileName?: string): Promise<ResumeDraft> => {
    const filePath = resolvePdfPath(fileName ?? "Profile.pdf");

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

    const parts = splitSectionsWithRanges(normalized, LINKEDIN_SECTIONS);

    // Summary / Experience / Education
    const summary = parts.summary?.content;
    const experienceRaw = parts.experience?.content;
    const educationRaw = parts.education?.content;

    // Name = first line of the "pre-summary trio"
    const { trio, trioStartOffset } = getPreSummaryTrio(normalized);
    const name = trio?.[0];

    // Links (from whole doc)
    const links = extractLinks(normalized);

    // Top Skills: plain list from section content
    const topSkills = extractList(parts.topSkills?.content);

    // Languages: cut at the trio start (if trio lies after languages start)
    let languages: string[] | undefined;
    const langSlice = parts.languages;
    if (langSlice) {
      const end =
        trioStartOffset &&
        trioStartOffset > langSlice.start &&
        trioStartOffset <= langSlice.end
          ? trioStartOffset
          : langSlice.end;

      const raw = normalized.slice(langSlice.start, end);
      languages = extractList(raw);
    }

    return {
      name,
      summary,
      links,
      experienceRaw,
      educationRaw,
      topSkills,
      languages,
    };
  },
);
