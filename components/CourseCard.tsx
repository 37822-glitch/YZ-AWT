import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      className="group block h-full rounded-xl"
    >
      <Card className="h-full border border-transparent transition hover:border-blue-300 hover:shadow-md">
        <CardHeader>
          <CardTitle
            role="heading"
            aria-level={2}
            className="text-lg font-bold tracking-tight transition-colors group-hover:text-blue-700"
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <p className="leading-7 text-muted-foreground">{description}</p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-brand">
              {credits} credits
            </span>
            <Button variant="ghost" size="sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="fill-blue-600 text-blue-600"
              >
                <path d="M12 21s-7.2-4.35-9.6-8.53C.5 9.17 2.15 5 6.08 5A5.1 5.1 0 0 1 12 8.16 5.1 5.1 0 0 1 17.92 5c3.93 0 5.58 4.17 3.68 7.47C19.2 16.65 12 21 12 21Z" />
              </svg>
              {likes} likes
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
