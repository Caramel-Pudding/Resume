// lib/get-resume-from-pdf.server.ts
import { cache } from "react";
import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

export type ResumeDraft = {
  name?: string;
  summary?: string;
  links: string[];
  experience: Company[];
  educationRaw?: string;
  topSkills?: string[];
  languages?: string[];
};

type Role = { title: string; dates: string; location: string };
type Section =
  | { title: "The project"; paragraphs: string[] }
  | { title: "Tech-stack"; techs: string[] }
  | { title: "Highlights"; bullets: string[] };

export type Company = {
  name: string;
  tenureSummary?: string;
  roles: Role[];
  sections: Section[];
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
    const experience = experienceRaw ? parseExperience(experienceRaw) : [];

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
      experience,
      educationRaw,
      topSkills,
      languages,
    };
  },
);

/* ---------- Parser (date-anchored, minimal regex) ---------- */
export function parseExperience(raw: string): Company[] {
  const MONTH =
    "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";

  // 1) Normalize spaces (all Unicode Zs) and dashes (all hyphen/dash forms) to avoid misses
  // 2) Ensure labels are on their own lines
  // 3) Insert a break before inline "Month YYYY" so dates never ride inside bullets
  const normalized = raw
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]/g, " ") // all weird spaces -> space
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-") // all dashes -> "-"
    .replace(/\s+(The project:|Tech-stack:|Highlights:)\s*/g, "\n$1\n")
    .replace(
      new RegExp(`(?<!^)(?<!\\n)\\b${MONTH}\\s+\\d{4}\\b`, "gi"),
      (m) => `\n${m}`,
    );

  const lines = normalized.split(/\r?\n/).map((s) => s.trim());
  const blank = (t: string) => t === "";
  const nextNB = (i: number) => {
    while (i < lines.length && blank(lines[i])) i++;
    return i;
  };
  const prevNB = (i: number) => {
    while (i >= 0 && blank(lines[i])) i--;
    return i;
  };

  const labels = new Set(["The project:", "Tech-stack:", "Highlights:"]);
  const isBullet = (t: string) => t.startsWith("-");
  const isDate = (t: string) =>
    new RegExp(
      `^${MONTH}\\s+\\d{4}\\s*-\\s*(?:Present|${MONTH}\\s+\\d{4})(?:\\s*\\([^)]*\\))?$`,
      "i",
    ).test(t);
  const isTenure = (t: string) => /year|month/i.test(t) && !isDate(t);
  const isLocation = (t: string) =>
    t.includes(",") && !isDate(t) && !labels.has(t);

  // Build role blocks strictly around date anchors
  type Block = {
    companyIdx: number;
    tenureIdx: number | null;
    roleIdx: number;
    dateIdx: number;
    locationIdx: number | null;
  };
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!isDate(line) || isBullet(line)) continue;

    const roleIdx = prevNB(i - 1);
    let companyIdx = prevNB(roleIdx - 1);
    let tenureIdx: number | null = null;

    // allow optional tenure between company and role
    if (isTenure(lines[companyIdx] || "")) {
      tenureIdx = companyIdx;
      companyIdx = prevNB(companyIdx - 1);
    }

    const after = nextNB(i + 1);
    const locationIdx = isLocation(lines[after] || "") ? after : null;

    if (companyIdx >= 0 && roleIdx >= 0) {
      blocks.push({ companyIdx, tenureIdx, roleIdx, dateIdx: i, locationIdx });
    }
  }

  console.log(blocks);

  // Group by company order of first appearance
  const companyOrder = [...new Set(blocks.map((b) => b.companyIdx))];

  const companies: Company[] = [];

  for (let k = 0; k < companyOrder.length; k++) {
    const cIdx = companyOrder[k];
    const nextCIdx = companyOrder[k + 1] ?? lines.length;

    const own = blocks
      .filter((b) => b.companyIdx === cIdx)
      .sort((a, b) => a.dateIdx - b.dateIdx);
    const name = lines[cIdx];
    const tenureSummary =
      own[0]?.tenureIdx != null ? lines[own[0].tenureIdx] : undefined;
    const roles: Role[] = own.map((b) => ({
      title: lines[b.roleIdx] || "",
      dates: lines[b.dateIdx],
      location: b.locationIdx != null ? lines[b.locationIdx] : "",
    }));

    // Sections live after last role tail until the next company's header line
    const lastTail = own.length
      ? Math.max(...own.map((b) => b.locationIdx ?? b.dateIdx))
      : cIdx;
    const start = nextNB(lastTail + 1),
      end = nextCIdx;

    const sections: Section[] = [];
    let i = start;

    const untilNextLabel = (j: number) => {
      while (j < end && !labels.has(lines[j]))
        j = blank(lines[j]) ? nextNB(j + 1) : j + 1;
      return j;
    };

    while (i < end) {
      const tag = lines[i];
      if (!labels.has(tag)) {
        i++;
        continue;
      }

      if (tag === "The project:") {
        i = nextNB(i + 1);
        const stop = untilNextLabel(i),
          paras: string[] = [];
        let buf = "";
        for (; i < stop; i++) {
          const t = lines[i];
          if (blank(t)) {
            if (buf) {
              paras.push(buf);
              buf = "";
            }
            i = nextNB(i + 1) - 1;
            continue;
          }
          buf = buf ? `${buf} ${t}` : t;
        }
        if (buf) paras.push(buf);
        if (paras.length)
          sections.push({ title: "The project", paragraphs: paras });
        continue;
      }

      if (tag === "Tech-stack:") {
        i = nextNB(i + 1);
        const stop = untilNextLabel(i);
        const techs = lines
          .slice(i, stop)
          .filter((s) => !blank(s))
          .join(" ")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (techs.length) sections.push({ title: "Tech-stack", techs });
        i = stop;
        continue;
      }

      // Highlights
      i = nextNB(i + 1);
      const stop = untilNextLabel(i),
        bullets: string[] = [];
      let buf = "";
      for (; i < stop; i++) {
        const t = lines[i];
        if (blank(t)) {
          i = nextNB(i + 1) - 1;
          continue;
        }
        if (t.startsWith("-")) {
          if (buf) bullets.push(buf);
          buf = t.replace(/^-+\s*/, "");
        } else buf = buf ? `${buf} ${t}` : t;
      }
      if (buf) bullets.push(buf);
      if (bullets.length) sections.push({ title: "Highlights", bullets });
    }

    companies.push({ name, tenureSummary, roles, sections });
  }

  return companies;
}
