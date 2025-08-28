import Image from "next/image";

import { ResumeDraft } from "@/utils/resume-from-pdf";
const AVATAR_PX = 32;
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
    { id: "education", label: "Education", show: Boolean(data.educationRaw) },
    { id: "links", label: "Links", show: (data.links?.length ?? 0) > 0 },
    // Contact is shown if we can route them to at least one profile link
    {
      id: "contact",
      label: "Contact",
      show: Boolean(
        (data.links ?? []).some((l) => /linkedin|github|mailto:/i.test(l)),
      ),
    },
  ].filter((s) => s.show);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/avatar.jpeg"
            alt={data.name ? `${data.name} avatar` : "Avatar"}
            width={AVATAR_PX}
            height={AVATAR_PX}
            className="rounded-full object-cover"
          />
          <div className="text-sm leading-tight">
            <div className="font-semibold">{data.name ?? "—"}</div>
            {/* Secondary line intentionally minimal; we avoid hard-coded stubs */}
          </div>
        </div>

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
      </div>
    </header>
  );
};
