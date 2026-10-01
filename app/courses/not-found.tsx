import Link from "next/link";

export default function CourseNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-20 sm:px-8">
      <div className="w-full rounded-3xl border border-border bg-surface p-8 text-center shadow-xl shadow-blue-950/5 sm:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">
          Course not found
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg leading-8 text-muted-foreground">
          The course you requested is not in the catalog. Choose another course
          to continue exploring the curriculum.
        </p>
        <Link
          href="/courses"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
        >
          Back to courses
        </Link>
      </div>
    </main>
  );
}
