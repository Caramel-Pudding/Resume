// app/page.tsx — One-page resume reading directly from a PDF
export const runtime = "nodejs"; // ensure Node runtime for pdf parsing
import { getResumeFromPdf } from "@/utils/resume-from-pdf";
import { Eductaion } from "@/components/Education";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { SkillsAndLanguages } from "@/components/SkillList";

export default async function Page() {
  const data = await getResumeFromPdf();

  const linkedIn = (data.links ?? []).find((l) => /linkedin\.com/i.test(l));
  const github = (data.links ?? []).find((l) => /github\.com/i.test(l));
  const email = (data.links ?? []).find((l) => /^mailto:/i.test(l));

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div
        id="content"
        className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-16"
      >
        {(data.summary || data.name) && (
          <About name={data.name} summary={data.summary} />
        )}
        {data.experience && <Experience companies={data.experience} />}
        {data.educationRaw && <Eductaion educationData={data.educationRaw} />}

        {/* Links extracted from the PDF */}
        {(data.links?.length ?? 0) > 0 && (
          <section
            id="links"
            aria-labelledby="links-title"
            className="scroll-mt-24"
          >
            <h2 id="links-title" className="text-2xl font-semibold">
              Links
            </h2>
            <ul className="mt-4 flex flex-wrap items-center gap-3">
              {data.links!.map((href) => (
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
        )}

        {(data.topSkills || data.topSkills) && (
          <SkillsAndLanguages
            skills={data.topSkills}
            languages={data.languages}
          />
        )}

        {/* Contact — prefer email; otherwise show primary social(s) */}
        {(email || linkedIn || github) && (
          <section
            id="contact"
            aria-labelledby="contact-title"
            className="scroll-mt-24"
          >
            <h2 id="contact-title" className="text-2xl font-semibold">
              Contact
            </h2>
            <div className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              {email && (
                <p>
                  Email:{" "}
                  <a className="underline underline-offset-4" href={email}>
                    {email.replace(/^mailto:/i, "")}
                  </a>
                </p>
              )}
              {!email && linkedIn && (
                <p>
                  Connect via LinkedIn:{" "}
                  <a
                    className="underline underline-offset-4"
                    href={linkedIn}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {linkedIn}
                  </a>
                </p>
              )}
              {!email && !linkedIn && github && (
                <p>
                  Reach me on GitHub:{" "}
                  <a
                    className="underline underline-offset-4"
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {github}
                  </a>
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
