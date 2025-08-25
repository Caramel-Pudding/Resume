interface AboutProps {
  name?: string;
  summary?: string;
}

export const About = ({ name, summary }: AboutProps) => {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
      <h1
        id="about-title"
        className="text-3xl sm:text-4xl font-bold tracking-tight"
      >
        {name ?? ""}
      </h1>
      {summary && (
        <p className="mt-4 max-w-3xl whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
          {summary}
        </p>
      )}
    </section>
  );
};
