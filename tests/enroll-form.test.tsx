import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import EnrollForm from "@/components/EnrollForm";

describe("EnrollForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits the existing student ID and displays the returned number", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({
        id: 7,
        courseId: "web-security",
        studentId: 2,
        enrolledAt: "2026-11-12T12:00:00Z",
      }),
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<EnrollForm courseId="web-security" />);

    await user.type(screen.getByRole("spinbutton", { name: "Student ID" }), "2");
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect(
      await screen.findByText("You are enrolled. Enrollment number: 7"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/enrollments",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: "web-security",
          studentId: 2,
        }),
      },
    );
  });

  it("shows Problem Details validation feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 422,
        json: vi.fn().mockResolvedValue({
          type: "https://example.com/problems/validation-error",
          title: "Validation failed",
          status: 422,
          detail: "1 invalid value(s) in the request",
          instance: "/enrollments",
          errors: [
            {
              in: "body",
              field: "studentId",
              detail: "Field required",
            },
          ],
        }),
      } as unknown as Response),
    );
    const user = userEvent.setup();
    render(<EnrollForm courseId="web-security" />);

    await user.type(screen.getByRole("spinbutton", { name: "Student ID" }), "2");
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect(
      await screen.findByText("studentId: Field required"),
    ).toBeInTheDocument();
  });

  it("shows a Problem Details business error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 409,
        json: vi.fn().mockResolvedValue({
          type: "https://example.com/problems/already-enrolled",
          title: "Already enrolled",
          status: 409,
          detail: "Student is already enrolled in this course",
          instance: "/enrollments",
        }),
      } as unknown as Response),
    );
    const user = userEvent.setup();
    render(<EnrollForm courseId="ai-integration" />);

    await user.type(screen.getByRole("spinbutton", { name: "Student ID" }), "2");
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect(
      await screen.findByText("Student is already enrolled in this course"),
    ).toBeInTheDocument();
  });
});
