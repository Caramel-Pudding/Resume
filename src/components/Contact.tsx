interface ContactProps {
  email?: string;
  linkedIn?: string;
}

export const Contact = ({ email, linkedIn }: ContactProps) => {
  return (
    (email || linkedIn) && (
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
        </div>
      </section>
    )
  );
};
