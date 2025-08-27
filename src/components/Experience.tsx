import "server-only";

interface ExperienceProps {
  experienceRaw: string;
}

export const Experience = ({ experienceRaw }: ExperienceProps) => {
  return (
    <section
      id="experience"
      aria-labelledby="exp-title"
      className="scroll-mt-24"
    >
      <h2 id="exp-title" className="text-2xl font-semibold">
        Experience
      </h2>
      <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40 text-sm leading-relaxed">
        {experienceRaw}
      </pre>
    </section>
  );
};
