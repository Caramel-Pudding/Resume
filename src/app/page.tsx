// app/page.tsx — One-page resume skeleton (Next.js App Router, TypeScript, Tailwind)
// Minimal, accessible, and easy to extend. No external UI deps.

// TIP: keep actual content in a separate data file or CMS later.

type Link = { label: string; href: string };
type Experience = {
  company: string;
  role: string;
  start: string; // YYYY-MM
  end?: string; // YYYY-MM or undefined for "Present"
  location?: string;
  items?: string[];
  links?: Link[];
};

type Project = {
  name: string;
  summary: string;
  tech?: string[];
  links?: Link[];
};

type Education = {
  school: string;
  degree: string;
  start: string;
  end: string;
};

type Resume = {
  name: string;
  title: string;
  blurb: string;
  location?: string;
  links: Link[];
  skills: Record<string, string[]>; // e.g., { "Frontend": ["React", "TypeScript"] }
  experience: Experience[];
  projects?: Project[];
  education?: Education[];
  email?: string;
};

const RESUME: Resume = {
  name: "Your Name",
  title: "Senior Frontend Engineer",
  blurb:
    "Brief one-liner that captures your focus and impact. Keep it tight; quantify outcomes when possible.",
  location: "Berlin, DE",
  links: [
    { label: "GitHub", href: "https://github.com/your-handle" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle" },
    { label: "X", href: "https://x.com/your-handle" },
  ],
  skills: {
    Frontend: ["React", "Next.js", "TypeScript", "Tailwind", "Vite", "Vitest"],
    "Design Systems": ["Storybook", "Radix", "Accessibility", "Theming"],
    "Performance": ["RSC", "Code-splitting", "Web Vitals", "PPR/ISR"],
    Tooling: ["CI/CD", "Playwright", "ESLint", "Biome/Prettier"],
  },
  experience: [
    {
      company: "Company A",
      role: "Senior Frontend Engineer",
      start: "2023-03",
      end: undefined, // Present
      location: "Remote",
      items: [
        "Led migration to Next.js App Router; improved LCP by 35%.",
        "Shipped design system adoption across 4 portals; reduced UI defects 25%.",
      ],
      links: [{ label: "Case study", href: "/work/company-a" }],
    },
    {
      company: "Company B",
      role: "Frontend Engineer",
      start: "2020-06",
      end: "2023-02",
      location: "Berlin, DE",
      items: [
        "Built high-traffic marketing stack with ISR & edge personalization.",
        "Introduced component libraries and testing strategy (RTL + Playwright).",
      ],
    },
  ],
  projects: [
    {
      name: "Project One",
      summary:
        "Short description of what it does and the outcome. Include a metric if possible.",
      tech: ["Next.js", "RSC", "Tailwind"],
      links: [
        { label: "Live", href: "https://example.com" },
        { label: "Source", href: "https://github.com/your-handle/project-one" },
      ],
    },
  ],
  education: [
    { school: "University X", degree: "B.Sc. in Computer Science", start: "2014", end: "2018" },
  ],
  email: "you@example.com",
};

function formatRange(start: string, end?: string) {
  const fmt = (s: string) => new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short" });
  return `${fmt(start)} — ${end ? fmt(end) : "Present"}`;
}

export default function Page() {
  const r = RESUME;
  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Skip link */}
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-md shadow">Skip to content</a>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500" aria-hidden />
            <div className="text-sm leading-tight">
              <div className="font-semibold">{r.name}</div>
              <div className="text-slate-500 dark:text-slate-400">{r.title}{r.location ? ` • ${r.location}` : null}</div>
            </div>
          </div>
          <nav aria-label="Primary" className="hidden sm:flex gap-4 text-sm">
            <a className="hover:underline" href="#about">About</a>
            <a className="hover:underline" href="#experience">Experience</a>
            <a className="hover:underline" href="#projects">Projects</a>
            <a className="hover:underline" href="#skills">Skills</a>
            <a className="hover:underline" href="#education">Education</a>
            <a className="hover:underline" href="#contact">Contact</a>
          </nav>
        </div>
      </header>

      {/* Content */}
      <div id="content" className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-16">
        {/* About */}
        <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
          <h1 id="about-title" className="text-3xl sm:text-4xl font-bold tracking-tight">{r.name}</h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">{r.title}</p>
          <p className="mt-4 max-w-3xl leading-relaxed text-slate-700 dark:text-slate-300">{r.blurb}</p>
          <ul className="mt-6 flex flex-wrap items-center gap-3">
            {r.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60" target="_blank" rel="noreferrer">
                  <span className="i" aria-hidden>↗</span>
                  <span className="sr-only">Open </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Experience */}
        <section id="experience" aria-labelledby="exp-title" className="scroll-mt-24">
          <h2 id="exp-title" className="text-2xl font-semibold">Experience</h2>
          <div className="mt-6 space-y-6">
            {r.experience.map((e) => (
              <article key={`${e.company}-${e.start}`} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <div>
                    <h3 className="text-lg font-semibold">{e.role}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{e.company}{e.location ? ` • ${e.location}` : ''}</p>
                  </div>
                  <time className="text-sm text-slate-500 dark:text-slate-400">{formatRange(e.start, e.end)}</time>
                </header>
                {e.items && (
                  <ul className="mt-3 list-disc pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {e.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                )}
                {e.links && e.links.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {e.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} className="text-sm underline underline-offset-4 hover:no-underline" target="_blank" rel="noreferrer">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Projects */}
        {r.projects && r.projects.length > 0 && (
          <section id="projects" aria-labelledby="projects-title" className="scroll-mt-24">
            <h2 id="projects-title" className="text-2xl font-semibold">Projects</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {r.projects.map((p) => (
                <article key={p.name} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{p.summary}</p>
                  {p.tech && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {p.tech.map((t) => (
                        <li key={t} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300">{t}</li>
                      ))}
                    </ul>
                  )}
                  {p.links && p.links.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-3 text-sm">
                      {p.links.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} className="underline underline-offset-4 hover:no-underline" target="_blank" rel="noreferrer">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24">
          <h2 id="skills-title" className="text-2xl font-semibold">Skills</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {Object.entries(r.skills).map(([group, list]) => (
              <div key={group} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40">
                <h3 className="font-semibold">{group}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {list.map((s) => (
                    <li key={s} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300">{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        {r.education && r.education.length > 0 && (
          <section id="education" aria-labelledby="edu-title" className="scroll-mt-24">
            <h2 id="edu-title" className="text-2xl font-semibold">Education</h2>
            <ul className="mt-6 space-y-4">
              {r.education.map((ed) => (
                <li key={ed.school} className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{ed.school}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{ed.degree}</p>
                    </div>
                    <time className="text-sm text-slate-500 dark:text-slate-400">{`${ed.start} — ${ed.end}`}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact */}
        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24">
          <h2 id="contact-title" className="text-2xl font-semibold">Contact</h2>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            Prefer email? {RESUME.email ? (
              <a className="underline underline-offset-4" href={`mailto:${RESUME.email}`}>{RESUME.email}</a>
            ) : (
              <span>Add your email in RESUME.email</span>
            )}
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-sm text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} {RESUME.name}. Built with Next.js & Tailwind. <span className="ml-2">Respecting
            <abbr title="Reduced Motion">PRM</abbr> and color contrast.</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
