import { describe, expect, it } from "vitest";

import { getCourse, getCourses } from "@/lib/courses";

describe("course data", () => {
  it("returns the six lab courses", async () => {
    const courses = await getCourses();

    expect(courses.map(({ id }) => id)).toEqual([
      "modern-frontend",
      "backend-fastapi",
      "databases-postgresql",
      "api-design",
      "web-security",
      "ai-integration",
    ]);
  });

  it("finds a known course and rejects an unknown id", async () => {
    await expect(getCourse("backend-fastapi")).resolves.toMatchObject({
      title: "Backend Foundations: FastAPI",
      likes: 19,
    });
    await expect(getCourse("does-not-exist")).resolves.toBeUndefined();
  });
});
