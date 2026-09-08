"use client";

import { useState } from "react";

type LikeButtonProps = {
  initialLikes: number;
};

export default function LikeButton({ initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(initialLikes);

  return (
    <button
      type="button"
      aria-label={`${likes} likes`}
      onClick={() => setLikes((currentLikes) => currentLikes + 1)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-base font-bold text-white shadow-sm transition duration-200 hover:bg-blue-700 active:scale-[0.98]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5 fill-current"
      >
        <path d="M12 21s-7.2-4.35-9.6-8.53C.5 9.17 2.15 5 6.08 5A5.1 5.1 0 0 1 12 8.16 5.1 5.1 0 0 1 17.92 5c3.93 0 5.58 4.17 3.68 7.47C19.2 16.65 12 21 12 21Z" />
      </svg>
      <span>{likes}</span>
    </button>
  );
}
