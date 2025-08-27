import "server-only";

interface EducationProps {
  educationData: string;
}

export const Eductaion = ({ educationData }: EducationProps) => {
  return (
    <section
      id="education"
      aria-labelledby="edu-title"
      className="scroll-mt-24"
    >
      <h2 id="edu-title" className="text-2xl font-semibold">
        Education
      </h2>
      <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white/60 dark:bg-slate-900/40 text-sm leading-relaxed">
        {educationData}
      </pre>
    </section>
  );
};
