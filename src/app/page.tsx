export const runtime = "nodejs"; // important for Vercel/Next edge vs node
import { getResumeFromPdf } from "@/utils/resume-from-pdf";

export default async function Page() {
  const data = await getResumeFromPdf(); // reads public/Profile.pdf

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">{data.name ?? "Your Name"}</h1>
        <p className="mt-2 text-slate-600">Senior Frontend Engineer</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="mt-2 whitespace-pre-wrap text-slate-700">
          {data.summary ?? "Add a Summary section to your PDF to auto-populate this block."}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Experience (raw)</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg border p-4 text-sm">
          {data.experienceRaw ?? "No Experience section found."}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Education (raw)</h2>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg border p-4 text-sm">
          {data.educationRaw ?? "No Education section found."}
        </pre>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Links</h2>
        <ul className="mt-2 flex flex-wrap gap-3 text-sm">
          {data.links.map((href) => (
            <li key={href}>
              <a className="underline underline-offset-4" href={href} target="_blank" rel="noreferrer">
                {href}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
