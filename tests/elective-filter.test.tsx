import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ElectiveFilter from "@/components/ElectiveFilter";

const useSWRMock = vi.fn();

vi.mock("swr", () => ({
  default: (...args: unknown[]) => useSWRMock(...args),
}));

describe("ElectiveFilter", () => {
  beforeEach(() => {
    useSWRMock.mockReset();
    useSWRMock.mockReturnValue({
      data: [
        {
          id: "api-design",
          title: "API Design & Documentation",
          description: "REST, OpenAPI, versioning, and developer experience.",
          credits: 3,
          isElective: true,
          likes: 12,
        },
      ],
      error: undefined,
      isLoading: false,
    });
  });

  it("switches SWR to the elective query and renders compact results", async () => {
    const user = userEvent.setup();
    render(<ElectiveFilter />);

    expect(useSWRMock).toHaveBeenLastCalledWith(
      "http://localhost:8000/courses",
      expect.any(Function),
    );
    expect(screen.getByText("— 3 cr. · elective")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Electives only" }));

    expect(useSWRMock).toHaveBeenLastCalledWith(
      "http://localhost:8000/courses?is_elective=true",
      expect.any(Function),
    );
  });
});
