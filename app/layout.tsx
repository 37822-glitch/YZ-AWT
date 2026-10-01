import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "YZ-AWT Course Catalog",
  description:
    "A Next.js course catalog for the Advanced Web Technologies semester project.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full font-sans antialiased">
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-brand-strong text-white shadow-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-lg font-extrabold tracking-tight"
            >
              YZ-AWT
            </Link>
            <nav
              aria-label="Primary navigation"
              className="flex items-center gap-1 sm:gap-2"
            >
              <Link
                href="/"
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition-colors hover:bg-white/10 sm:px-4"
              >
                Home
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition-colors hover:bg-white/10 sm:px-4"
              >
                Courses
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold transition-colors hover:bg-white/10 sm:px-4"
              >
                About
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-muted-foreground sm:px-8">
            Advanced Web Technologies · Lab 2
          </div>
        </footer>
      </body>
    </html>
  );
}
