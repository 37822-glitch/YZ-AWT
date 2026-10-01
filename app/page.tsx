import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-14 sm:px-8 sm:py-20">
      <section className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
            Advanced Web Technologies
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            YZ-AWT Course Catalog
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Welcome to the course catalog. Explore a focused curriculum for
            building modern, reliable web applications.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-blue-600 px-7 py-3 font-bold text-white shadow-lg shadow-blue-700/20 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Browse courses
            <span aria-hidden="true" className="ml-2">
              →
            </span>
          </Link>
        </div>

        <div className="rounded-3xl bg-brand-strong px-7 py-10 text-white shadow-xl shadow-blue-950/10 sm:px-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
            Semester project
          </p>
          <p className="mt-6 text-6xl font-extrabold tracking-tight">6</p>
          <p className="mt-2 text-lg text-blue-100">courses in the catalog</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/15 pt-7">
            <div>
              <dt className="text-sm text-blue-200">Routes</dt>
              <dd className="mt-1 text-2xl font-bold">4</dd>
            </div>
            <div>
              <dt className="text-sm text-blue-200">Client components</dt>
              <dd className="mt-1 text-2xl font-bold">1</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
