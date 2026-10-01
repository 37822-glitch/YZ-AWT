import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AboutPage from "@/app/about/page";
import RootLayout from "@/app/layout";
import Home from "@/app/page";

describe("application shell", () => {
  it("introduces the catalog and links to the course list", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "YZ-AWT Course Catalog" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the course catalog/)).toHaveClass(
      "text-muted-foreground",
    );
    expect(screen.getByRole("link", { name: "Browse courses" })).toHaveAttribute(
      "href",
      "/courses",
    );
  });

  it("explains the project and its course", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "About this catalog" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "YZ-AWT is a course catalog built as the semester project for Advanced Web Technologies.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Next.js 16 App Router/)).toBeInTheDocument();
  });

  it("provides shared navigation to every required static route", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main>Route content</main>
      </RootLayout>,
    );
    const page = new DOMParser().parseFromString(markup, "text/html");
    const navigation = page.querySelector('nav[aria-label="Primary navigation"]');
    const links = Array.from(navigation?.querySelectorAll("a") ?? []).map(
      (link) => ({ href: link.getAttribute("href"), text: link.textContent }),
    );

    expect(links).toEqual([
      { href: "/", text: "Home" },
      { href: "/courses", text: "Courses" },
      { href: "/about", text: "About" },
    ]);
  });
});
