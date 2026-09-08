import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import LikeButton from "@/components/LikeButton";

describe("LikeButton", () => {
  it("increments the local like count without navigation", async () => {
    const user = userEvent.setup();
    render(<LikeButton initialLikes={24} />);

    const button = screen.getByRole("button", { name: "24 likes" });
    await user.click(button);

    expect(button).toHaveAccessibleName("25 likes");
    expect(button).toHaveTextContent("25");
  });
});
