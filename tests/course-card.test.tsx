import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CourseCard from "@/components/CourseCard";

describe("CourseCard", () => {
  it("links the complete course summary to its dynamic route", () => {
    render(
      <CourseCard
        id="modern-frontend"
        title="Modern Frontend: React & Next.js"
        description="React 19, Server Components, and the App Router."
        credits={5}
        likes={24}
      />,
    );

    const card = screen.getByRole("link", { name: /Modern Frontend/ });

    expect(card).toHaveAttribute("href", "/courses/modern-frontend");
    expect(card).toHaveTextContent(
      "React 19, Server Components, and the App Router.",
    );
    expect(screen.getByText("5 credits")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "24 likes" }),
    ).toBeInTheDocument();
  });
});
