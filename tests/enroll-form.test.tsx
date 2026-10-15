import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import EnrollForm from "@/components/EnrollForm";

describe("EnrollForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits camelCase enrollment data and displays the returned number", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({
        id: 7,
        courseId: "web-security",
        studentName: "Aigerim",
      }),
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<EnrollForm courseId="web-security" />);

    await user.type(screen.getByRole("textbox", { name: "Student name" }), "Aigerim");
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
          studentName: "Aigerim",
        }),
      },
    );
  });

  it("shows FastAPI validation feedback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue({
        ok: false,
        status: 422,
        json: vi.fn().mockResolvedValue({
          detail: [{ msg: "String should have at least 2 characters" }],
        }),
      } as unknown as Response),
    );
    const user = userEvent.setup();
    render(<EnrollForm courseId="web-security" />);

    await user.type(screen.getByRole("textbox", { name: "Student name" }), "A");
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect(
      await screen.findByText("String should have at least 2 characters"),
    ).toBeInTheDocument();
  });
});
