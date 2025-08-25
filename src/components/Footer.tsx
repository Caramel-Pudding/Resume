interface FooterProps {
  name?: string;
}

export const Footer = ({ name }: FooterProps) => {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-sm text-slate-500 dark:text-slate-400">
        <p>
          © {new Date().getFullYear()} {name ?? ""}. Built with Next.js &
          Tailwind.
        </p>
      </div>
    </footer>
  );
};
