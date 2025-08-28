// components/Footer.tsx
import { ResumeDraft } from "@/utils/resume-from-pdf";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import * as React from "react";

type FooterProps = Pick<ResumeDraft, "name" | "links">;

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function parseLink(href: string): {
  label: string;
  icon: IconType;
  external: boolean;
} {
  if (/^mailto:/i.test(href)) {
    return {
      label: href.replace(/^mailto:/i, ""),
      icon: Mail,
      external: false,
    };
  }

  let host = "";
  try {
    host = new URL(href).hostname.replace(/^www\./i, "");
  } catch {
    // fall through; treat as generic
  }

  if (/(^|\.)github\.com$/i.test(host))
    return { label: "GitHub", icon: Github, external: true };
  if (/(^|\.)linkedin\.com$/i.test(host) || /^lnkd\.in$/i.test(host))
    return { label: "LinkedIn", icon: Linkedin, external: true };

  return { label: host || href, icon: LinkIcon, external: true };
}

export const Footer: React.FC<FooterProps> = ({ name, links = [] }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-sm text-slate-500 dark:text-slate-400">
        {links.length > 0 && (
          <nav aria-label="Links">
            <ul className="mb-4 flex flex-wrap items-center gap-3">
              {links.map((href) => {
                const { label, icon: Icon, external } = parseLink(href);
                return (
                  <li key={href}>
                    <a
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer noopener" : undefined}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    >
                      <Icon className="size-4" aria-hidden />
                      <span>{label}</span>
                      {external && (
                        <ExternalLink className="size-4" aria-hidden />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <p>
          © {year} {name ?? ""}. Built with Next.js & Tailwind.
        </p>
      </div>
    </footer>
  );
};
