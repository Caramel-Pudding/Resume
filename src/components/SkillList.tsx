import React, { useMemo } from "react";
import { Code2, Languages as LanguagesIcon } from "lucide-react";

export type SkillsAndLanguagesProps = {
  skills?: string[];
  languages?: string[];
  heading?: string;
  className?: string;
  maxSkills?: number;
  maxLanguages?: number;
};

const Pill = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-800/60 px-2.5 py-1.5 text-sm text-slate-200 shadow-sm">
      {children}
    </span>
  );
};

export const SkillsAndLanguages = ({
  skills = [],
  languages = [],
  heading = "Skills & Languages",
  className = "",
}: SkillsAndLanguagesProps) => {
  return (
    <section
      aria-label={heading}
      className={[
        "relative overflow-hidden rounded-3xl border border-slate-800/30 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur",
        "dark:from-slate-900/60 dark:to-slate-900/20",
        className,
      ].join(" ")}
    >
      <header className="relative mb-5 flex items-center gap-3">
        <div className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-2">
          <Code2 className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
          {heading}
        </h2>
      </header>

      <div className="relative grid gap-6 md:grid-cols-2">
        {/* Skills */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5">
              <Code2 className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="text-sm font-medium text-slate-200">Top Skills</h3>
          </div>
          <ul className="flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((s) => (
                <li key={s}>
                  <Pill>{s}</Pill>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">No skills provided</li>
            )}
          </ul>
        </div>

        {/* Languages */}
        <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-1.5">
              <LanguagesIcon className="h-4 w-4" aria-hidden />
            </div>
            <h3 className="text-sm font-medium text-slate-200">Languages</h3>
          </div>
          <ul className="flex flex-wrap gap-2">
            {languages.length ? (
              languages.map((l) => (
                <li key={l}>
                  <Pill>{l}</Pill>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">No languages provided</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
};
