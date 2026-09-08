import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CoursePage, {
  generateStaticParams,
} from "@/app/courses/[id]/page";
import Loading from "@/app/courses/[id]/loading";
import CourseNotFound from "@/app/courses/not-found";

describe("dynamic course route", () => {
  it("generates a static parameter for every lab course", async () => {
    await expect(generateStaticParams()).resolves.toEqual([
      { id: "modern-frontend" },
      { id: "backend-fastapi" },
      { id: "databases-postgresql" },
      { id: "api-design" },
      { id: "web-security" },
      { id: "ai-integration" },
    ]);
  });

  it("awaits the route parameters and renders the selected course", async () => {
    render(
      await CoursePage({
        params: Promise.resolve({ id: "modern-frontend" }),
      }),
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Modern Frontend: React & Next.js",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("5 credits")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "24 likes" })).toBeInTheDocument();
  });

  it("throws the Next.js 404 signal for an unknown course", async () => {
    await expect(
      CoursePage({ params: Promise.resolve({ id: "does-not-exist" }) }),
    ).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });

  it("renders loading and not-found recovery states", () => {
    const { unmount } = render(<Loading />);
    expect(screen.getByText("Loading course…")).toBeInTheDocument();
    unmount();

    render(<CourseNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Course not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to courses" })).toHaveAttribute(
      "href",
      "/courses",
    );
  });
});
