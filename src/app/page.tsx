// app/page.tsx — One-page resume reading directly from a PDF
export const runtime = "nodejs"; // ensure Node runtime for pdf parsing
import { getResumeFromPdf } from "@/utils/resume-from-pdf";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";

export default async function Page() {
  const data = await getResumeFromPdf();

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      <div
        id="content"
        className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-16"
      >
        {(data.summary || data.name) && (
          <About
            name={data.name}
            career={data.career}
            location={data.location}
            summary={data.summary}
          />
        )}
        {data.experience && <Experience companies={data.experience} />}
      </div>
    </main>
  );
}
