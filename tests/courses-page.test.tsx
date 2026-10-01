import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CoursesPage from "@/app/courses/page";

describe("courses page", () => {
  it("uses the lab's mobile-first one, two, and three column grid", async () => {
    render(await CoursesPage());

    expect(
      screen.getByRole("region", { name: "Available courses" }),
    ).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
  });
});
