import { Company } from "@/utils/resume-from-pdf";
import React from "react";

interface ExperienceProps {
  companies: Company[];
}
export function Experience({ companies }: ExperienceProps) {
  return (
    <section
      id="experience"
      aria-labelledby="exp-title"
      className="scroll-mt-24"
    >
      <h2 id="exp-title" className="text-2xl font-semibold">
        Experience
      </h2>
      <article className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
        <div className="space-y-8">
          {companies.map((c, i) => (
            <CompanyCard key={i} company={c} />
          ))}
        </div>
      </article>
    </section>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const locs = company.roles.map((r) => r.location).filter(Boolean);
  const uniq = [...new Set(locs)];
  const hoisted = uniq.length === 1 && locs.length >= 2 ? uniq[0] : undefined;
  const meta = [company.tenureSummary, hoisted].filter(Boolean).join(" • ");

  return (
    <div>
      <header className="mb-2">
        <h3 className="text-lg font-semibold tracking-tight">{company.name}</h3>
        {meta && (
          <p className="text-sm text-slate-600 dark:text-slate-300">{meta}</p>
        )}
      </header>

      <div className="space-y-3">
        {company.roles.map((r, i) => (
          <div key={i}>
            <p className="font-medium">{r.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {[r.dates, hoisted ? undefined : r.location]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>
        ))}
      </div>

      {company.sections.map((s, i) => (
        <section key={i} className="mt-4">
          <h4 className="font-semibold">{s.title}</h4>
          {s.title === "The project" &&
            s.paragraphs.map((p, k) => (
              <p key={k} className="mt-2 leading-relaxed">
                {p}
              </p>
            ))}
          {s.title === "Tech-stack" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {s.techs.map((t, k) => (
                <span
                  key={k}
                  className="rounded-full border px-2 py-0.5 text-xs leading-5 text-slate-700 dark:text-slate-200 border-slate-300/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-800/60"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {s.title === "Highlights" && (
            <ul className="mt-2 list-disc pl-6 space-y-1">
              {s.bullets.map((b, k) => (
                <li key={k} className="leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
