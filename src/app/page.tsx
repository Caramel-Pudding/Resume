// app/page.tsx — One-page resume reading directly from a PDF
export const runtime = "nodejs"; // ensure Node runtime for pdf parsing
import { getResumeFromPdf } from "@/utils/resume-from-pdf";
import { Eductaion } from "@/components/Education";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";
import { SkillsAndLanguages } from "@/components/SkillList";
import { Contact } from "@/components/Contact";
import { Links } from "@/components/Links";

export default async function Page() {
  const data = await getResumeFromPdf();

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div
        id="content"
        className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-16"
      >
        {(data.summary || data.name) && (
          <About name={data.name} summary={data.summary} />
        )}
        <Contact />
        {data.experience && <Experience companies={data.experience} />}
        {data.educationRaw && <Eductaion educationData={data.educationRaw} />}
        <Links links={data.links} />
        {(data.topSkills || data.languages) && (
          <SkillsAndLanguages
            skills={data.topSkills}
            languages={data.languages}
          />
        )}
      </div>
    </main>
  );
}
