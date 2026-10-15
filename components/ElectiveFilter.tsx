"use client";

import { BookOpen, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import type { Course } from "@/lib/courses";

async function fetcher(url: string): Promise<Course[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<Course[]>;
}

export default function ElectiveFilter() {
  const [electivesOnly, setElectivesOnly] = useState(false);
  const query = electivesOnly ? "?is_elective=true" : "";
  const url = `${process.env.NEXT_PUBLIC_API_URL}/courses${query}`;
  const { data, error, isLoading } = useSWR<Course[]>(url, fetcher);

  return (
    <section className="mt-10" aria-labelledby="filter-results-heading">
      <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h2 id="filter-results-heading" className="font-bold text-foreground">
              Live API filter
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This list is requested directly from FastAPI in your browser.
            </p>
          </div>
        </div>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-foreground shadow-sm">
          <input
            type="checkbox"
            checked={electivesOnly}
            onChange={(event) => setElectivesOnly(event.target.checked)}
            className="h-5 w-5 accent-blue-700"
          />
          Electives only
        </label>
      </div>

      {isLoading ? (
        <p role="status" className="mt-6 rounded-xl border border-border bg-white p-5 text-muted-foreground">
          Loading courses…
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 font-semibold text-red-800">
          Failed to load courses.
        </p>
      ) : null}

      {data ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {data.map((course) => (
            <li key={course.id}>
              <Link
                href={`/courses/${course.id}`}
                className="group flex min-h-28 h-full items-start gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <BookOpen aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <span>
                  <span className="block font-bold tracking-tight text-foreground group-hover:text-blue-700">
                    {course.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    — {course.credits} cr.
                    {course.isElective ? " · elective" : ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
