interface LinksProps {
  links: string[];
}

export const Links = ({ links }: LinksProps) => {
  return (
    (links?.length ?? 0) > 0 && (
      <section
        id="links"
        aria-labelledby="links-title"
        className="scroll-mt-24"
      >
        <h2 id="links-title" className="text-2xl font-semibold">
          Links
        </h2>
        <ul className="mt-4 flex flex-wrap items-center gap-3">
          {links!.map((href) => (
            <li key={href}>
              <a
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/60"
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden>↗</span>
                {href.replace(/^mailto:/i, "")}
              </a>
            </li>
          ))}
        </ul>
      </section>
    )
  );
};
