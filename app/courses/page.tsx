import CourseCard from "@/components/CourseCard";
import { getCourses } from "@/lib/courses";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">
          Course catalog
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Explore the curriculum
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Browse the core and elective courses that shape the Advanced Web
          Technologies program.
        </p>
      </div>

      <section
        aria-label="Available courses"
        className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            credits={course.credits}
            likes={course.likes}
          />
        ))}
      </section>
    </main>
  );
}
