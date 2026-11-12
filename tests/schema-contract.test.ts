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
      level: "intermediate",
    };
    const enrollment: Enrollment = {
      id: 1,
      courseId: course.id,
      studentId: 2,
      enrolledAt: "2026-11-12T12:00:00Z",
    };

    expect(enrollment.courseId).toBe(course.id);
    expect(enrollment.studentId).toBe(2);
    expect(course.isElective).toBe(false);
  });
});
