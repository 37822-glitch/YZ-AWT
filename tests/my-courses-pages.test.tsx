import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MyCoursesPage from "@/app/my-courses/page";
import MyCoursesRestPage from "@/app/my-courses-rest/page";
import { getJson } from "@/lib/api";
import { gql } from "@/lib/graphql";

vi.mock("@/lib/api", () => ({
  getJson: vi.fn(),
}));

vi.mock("@/lib/graphql", () => ({
  gql: vi.fn(),
}));

const courses = [
  {
    id: "modern-frontend",
    title: "Modern Frontend: React & Next.js",
    credits: 5,
    level: "intermediate",
  },
  {
    id: "backend-fastapi",
    title: "Backend Foundations: FastAPI",
    credits: 5,
    level: "intermediate",
  },
  {
    id: "ai-integration",
    title: "AI/LLM Integration",
    credits: 5,
    level: "beginner",
  },
];

describe("My courses pages", () => {
  it("renders the REST result after the two request rounds", async () => {
    vi.mocked(getJson)
      .mockResolvedValueOnce({ id: 2, name: "Daniyar Bekov", email: "daniyar@example.com" })
      .mockResolvedValueOnce(courses.map((course, index) => ({ id: index + 1, courseId: course.id })))
      .mockResolvedValueOnce(courses[0])
      .mockResolvedValueOnce(courses[1])
      .mockResolvedValueOnce(courses[2]);

    render(await MyCoursesRestPage());

    expect(screen.getByRole("heading")).toHaveTextContent("My courses: Daniyar Bekov");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(getJson).toHaveBeenCalledTimes(5);
  });

  it("renders the GraphQL result from one request", async () => {
    vi.mocked(gql).mockResolvedValue({
      student: {
        name: "Daniyar Bekov",
        enrollments: courses.map((course, index) => ({ id: String(index + 1), course })),
      },
    });

    render(await MyCoursesPage());

    expect(screen.getByRole("heading")).toHaveTextContent("My courses: Daniyar Bekov");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(gql).toHaveBeenCalledTimes(1);
  });
});
