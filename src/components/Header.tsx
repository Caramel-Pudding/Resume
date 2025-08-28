import { ResumeDraft } from "@/utils/resume-from-pdf";
interface HeaderProps {
  data: ResumeDraft;
}

export const Header = ({ data }: HeaderProps) => {
  const nav = [
    { id: "about", label: "About", show: Boolean(data.summary || data.name) },
    {
      id: "experience",
      label: "Experience",
      show: Boolean(data.experience),
    },
  ].filter((s) => s.show);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <>
          {/* Desktop nav */}
          {nav.length > 0 && (
            <nav aria-label="Primary" className="hidden sm:flex gap-4 text-sm">
              {nav.map((n) => (
                <a key={n.id} className="hover:underline" href={`#${n.id}`}>
                  {n.label}
                </a>
              ))}
            </nav>
          )}
          {/* Mobile menu (accessible fallback) */}
          {nav.length > 0 && (
            <details className="sm:hidden">
              <summary className="cursor-pointer text-sm px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40">
                Menu
              </summary>
              <nav
                aria-label="Primary mobile"
                className="mt-2 flex flex-col text-sm"
              >
                {nav.map((n) => (
                  <a
                    key={n.id}
                    className="py-1 hover:underline"
                    href={`#${n.id}`}
                  >
                    {n.label}
                  </a>
                ))}
              </nav>
            </details>
          )}
        </>
        <div className="flex items-center gap-3">
          <a
            href="/Profile.pdf"
            target="_blank"
            rel="noopener"
            className="text-sm leading-tight font-semibold hover:underline underline-offset-4"
          >
            Resume PDF
          </a>
        </div>
      </div>
    </header>
  );
};
