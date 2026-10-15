"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function CourseError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center px-5 py-16 sm:px-8">
      <section className="w-full rounded-3xl border border-red-200 bg-white p-8 shadow-xl shadow-red-950/5 sm:p-10">
        <span className="inline-flex rounded-2xl bg-red-50 p-3 text-red-700">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          The course API is unavailable
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          Start the FastAPI server, then retry this section without reloading
          the entire page.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-7 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-strong px-5 py-2.5 font-bold text-white transition hover:bg-blue-900 active:scale-[0.98]"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Try again
        </button>
      </section>
    </main>
  );
}
