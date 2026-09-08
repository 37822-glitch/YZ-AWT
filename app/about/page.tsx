export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
        Advanced Web Technologies
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        About this catalog
      </h1>
      <div className="mt-8 rounded-3xl border border-border bg-surface p-8 shadow-xl shadow-blue-950/5 sm:p-10">
        <p className="text-lg leading-8 text-muted">
          YZ-AWT is a course catalog built as the semester project for Advanced
          Web Technologies.
        </p>
        <p className="mt-5 text-lg leading-8 text-muted">
          It uses the Next.js 16 App Router to demonstrate file-based routing,
          Server and Client Components, dynamic routes, and TypeScript typing.
        </p>
        <p className="mt-5 text-lg leading-8 text-muted">
          Each lab will extend this same project with more production-ready web
          application capabilities.
        </p>
      </div>
    </main>
  );
}
