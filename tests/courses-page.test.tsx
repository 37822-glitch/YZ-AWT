import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CoursesPage from "@/app/courses/page";

vi.mock("@/lib/courses", () => ({
  getCourses: vi.fn().mockResolvedValue([
    {
      id: "web-security",
      title: "Web Security Essentials",
      description: "JWT/OAuth2, XSS, CSRF, and SQL injection defense.",
      credits: 4,
      isElective: false,
      likes: 21,
    },
  ]),
}));

describe("courses page", () => {
  it("uses the lab's mobile-first one, two, and three column grid", async () => {
    render(await CoursesPage());

    expect(
      screen.getByRole("region", { name: "Available courses" }),
    ).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
  });
});
