import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import LikeButton from "@/components/LikeButton";

describe("LikeButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists a like through the FastAPI endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: "modern-frontend",
        title: "Modern Frontend: React & Next.js",
        description: "React 19, Server Components, and the App Router.",
        credits: 5,
        isElective: false,
        likes: 25,
      }),
    } as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<LikeButton courseId="modern-frontend" initialLikes={24} />);

    const button = screen.getByRole("button", { name: "24 likes" });
    await user.click(button);

    expect(await screen.findByRole("button", { name: "25 likes" })).toHaveTextContent(
      "25",
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/courses/modern-frontend/like",
      { method: "POST" },
    );
  });
});
