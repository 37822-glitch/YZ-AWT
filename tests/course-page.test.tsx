import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CoursePage from "@/app/courses/[id]/page";
import Loading from "@/app/courses/[id]/loading";
import CourseNotFound from "@/app/courses/not-found";

vi.mock("@/lib/courses", () => ({
  getCourse: vi.fn().mockImplementation(async (id: string) =>
    id === "modern-frontend"
      ? {
          id,
          title: "Modern Frontend: React & Next.js",
          description: "React 19, Server Components, and the App Router.",
          credits: 5,
          isElective: false,
          likes: 24,
        }
      : undefined,
  ),
}));

describe("dynamic course route", () => {
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
    expect(
      screen.getByRole("heading", { level: 2, name: "Enroll in this course" }),
    ).toBeInTheDocument();
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
