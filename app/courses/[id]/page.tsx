import Link from "next/link";
import { notFound } from "next/navigation";

import LikeButton from "@/components/LikeButton";
import { getCourse, getCourses } from "@/lib/courses";

type CoursePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const courses = await getCourses();

  return courses.map((course) => ({ id: course.id }));
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <Link
        href="/courses"
        className="inline-flex min-h-11 items-center text-sm font-bold text-blue-700 transition-colors hover:text-blue-900"
      >
        <span aria-hidden="true">←</span>
        <span className="ml-2">Back to courses</span>
      </Link>

      <article className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-blue-950/5">
        <div className="bg-brand-strong px-6 py-10 text-white sm:px-10 sm:py-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-200">
            Course details
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {course.title}
          </h1>
        </div>

        <div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-lg leading-8 text-muted">{course.description}</p>
            <p className="mt-6 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-brand">
              {course.credits} credits
            </p>
          </div>
          <LikeButton initialLikes={course.likes} />
        </div>
      </article>
    </main>
  );
}
