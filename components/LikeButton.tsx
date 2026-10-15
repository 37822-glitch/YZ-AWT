"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import type { Course } from "@/lib/courses";

type LikeButtonProps = {
  courseId: string;
  initialLikes: number;
};

export default function LikeButton({ courseId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLike() {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/like`,
        { method: "POST" },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const course = (await response.json()) as Course;
      setLikes(course.likes);
    } catch {
      setError("Could not save your like. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <button
        type="button"
        aria-label={`${likes} likes`}
        disabled={isPending}
        onClick={handleLike}
        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-base font-bold text-white shadow-sm transition duration-200 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
      >
        <Heart aria-hidden="true" className="h-5 w-5 fill-current" />
        <span>{isPending ? "Saving…" : likes}</span>
      </button>
      {error ? (
        <p role="alert" className="max-w-56 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
