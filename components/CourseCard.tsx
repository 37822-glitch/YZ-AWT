import Link from "next/link";

type CourseCardProps = {
  id: string;
  title: string;
  description: string;
  credits: number;
  likes: number;
};

export default function CourseCard({
  id,
  title,
  description,
  credits,
  likes,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
    >
      <div className="mb-5 flex items-center justify-between gap-4 text-sm font-semibold">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-brand">
          {credits} credits
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-blue-600"
          >
            <path d="M12 21s-7.2-4.35-9.6-8.53C.5 9.17 2.15 5 6.08 5A5.1 5.1 0 0 1 12 8.16 5.1 5.1 0 0 1 17.92 5c3.93 0 5.58 4.17 3.68 7.47C19.2 16.65 12 21 12 21Z" />
          </svg>
          {likes} likes
        </span>
      </div>
      <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-blue-700">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-muted">{description}</p>
      <span className="mt-auto pt-6 text-sm font-semibold text-blue-700">
        View course <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
