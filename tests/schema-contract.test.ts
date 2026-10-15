import { describe, expect, it } from "vitest";

import type { Course, Enrollment } from "@/lib/courses";

describe("generated API contract", () => {
  it("exposes the camelCase course and enrollment shapes", () => {
    const course: Course = {
      id: "web-security",
      title: "Web Security Essentials",
      description: "Secure web application design.",
      credits: 4,
      isElective: false,
      likes: 21,
    };
    const enrollment: Enrollment = {
      id: 1,
      courseId: course.id,
      studentName: "Aigerim",
    };

    expect(enrollment.courseId).toBe(course.id);
    expect(course.isElective).toBe(false);
  });
});
