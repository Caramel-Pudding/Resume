// components/About.tsx
type AboutProps = { name?: string; summary?: string };

function parseSummary(summary?: string) {
  if (!summary)
    return {
      intro: [] as string[],
      bullets: [] as string[],
      toolbox: [] as string[],
    };

  const text = summary.replace(/\r/g, "").trim();
  const WHAT = "What I bring:";
  const TOOLS = "Toolbox:";

  const iWhat = text.indexOf(WHAT);
  const iTools = text.indexOf(TOOLS);

  const endOfIntro =
    [iWhat, iTools].filter((i) => i >= 0).sort((a, b) => a - b)[0] ??
    text.length;
  const intro = text.slice(0, endOfIntro).trim();

  const whatBlock =
    iWhat >= 0
      ? text.slice(iWhat + WHAT.length, iTools >= 0 ? iTools : undefined).trim()
      : "";

  const bullets = whatBlock
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^[-–•]\s+/.test(l))
    .map((l) => l.replace(/^[-–•]\s+/, ""));

  const toolsBlock =
    iTools >= 0 ? text.slice(iTools + TOOLS.length).trim() : "";
  const toolbox = toolsBlock
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const introParagraphs = intro
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);

  return { intro: introParagraphs, bullets, toolbox };
}

export const About = ({ name, summary }: AboutProps) => {
  const { intro, bullets, toolbox } = parseSummary(summary);

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
      <h1
        id="about-title"
        className="text-4xl sm:text-5xl font-bold tracking-tight bg-clip-text text-transparent
                   bg-gradient-to-b from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400"
      >
        {name ?? ""}
      </h1>

      {/* Intro */}
      {intro.length > 0 && (
        <div className="mt-4 max-w-3xl space-y-4 text-slate-700 dark:text-slate-300">
          {intro.map((p, i) => (
            <p key={i} className="leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      )}

      {/* What I bring */}
      {bullets.length > 0 && (
        <div className="mt-6 max-w-3xl">
          <h2 className="text-base font-semibold">What I bring</h2>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
            {bullets.map((b, i) => (
              <li key={i} className="leading-relaxed">
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Toolbox */}
      {toolbox.length > 0 && (
        <div className="mt-6 max-w-3xl">
          <h2 className="text-base font-semibold">Toolbox</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {toolbox.map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-slate-200 dark:border-slate-800
                           bg-white/60 dark:bg-slate-900/40 px-3 py-1 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
