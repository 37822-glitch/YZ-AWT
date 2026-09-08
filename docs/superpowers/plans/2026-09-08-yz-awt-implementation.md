# YZ-AWT implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, publish, and deploy the Lab 1 Next.js 16 course catalog as the public `YZ-AWT` repository.

**Architecture:** App Router Server Components own all routing and data reads. `lib/courses.ts` simulates the backend, `CourseCard` remains server-rendered, and `LikeButton` is the only client boundary.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, ESLint, Vitest, Testing Library, GitHub, and Vercel.

**Spec:** `docs/superpowers/specs/2026-09-08-yz-awt-design.md`

## Global constraints

- Use Next.js 16 with Node.js 20 or newer.
- Keep the App Router at repository-root `app/`; do not create `src/`.
- Keep the `@/*` import alias.
- Preserve the exact lab `Course` type, mock course records, and 300 ms delay.
- `components/LikeButton.tsx` is the only source file containing the `use client` directive.
- Use Next.js `Link` for navigation; do not attach `onClick` to course cards.
- Await `params: Promise<{ id: string }>` before reading `id`.
- Produce at least four meaningful commits before publishing.
- Publish a public GitHub repository named `YZ-AWT` and deploy it to Vercel.

---

### Task 1: Bootstrap and test harness

**Files:**

- Create: the standard `create-next-app` root files
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`
- Create: `docs/superpowers/specs/2026-09-08-yz-awt-design.md`
- Create: `docs/superpowers/plans/2026-09-08-yz-awt-implementation.md`

**Interfaces:**

- Consumes: Node.js 20+, npm, and `create-next-app@16`.
- Produces: a Next.js 16 App Router project with `npm test`, `npm run lint`, and `npm run build` commands.

- [ ] **Step 1: Generate the project**

  Run `create-next-app@16` with TypeScript, Tailwind, ESLint, App Router, no `src/`, `@/*`, npm, and noninteractive flags. Place the resulting npm-compatible project in the final `YZ-AWT` directory.

- [ ] **Step 2: Install the test harness**

  Install `vitest`, `jsdom`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` as development dependencies. Use the bundled Playwright CLI wrapper for browser acceptance without adding a repository browser-test dependency.

- [ ] **Step 3: Configure Vitest**

  Create `vitest.config.ts` with React and tsconfig-path plugins, the `jsdom` environment, global APIs, and `vitest.setup.ts`:

  ```ts
  import react from "@vitejs/plugin-react";
  import { defineConfig } from "vitest/config";
  import tsconfigPaths from "vite-tsconfig-paths";

  export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
    },
  });
  ```

  Create `vitest.setup.ts`:

  ```ts
  import "@testing-library/jest-dom/vitest";
  ```

- [ ] **Step 4: Add the test script**

  Add `"test": "vitest run"` to `package.json` without changing the generated dev, build, start, or lint scripts.

- [ ] **Step 5: Remove demo content and commit**

  Replace the starter page with a minimal semantic placeholder and replace demo CSS with the project token baseline. Run `npm run lint`, then commit as `chore: bootstrap Next.js project`.

### Task 2: Course data and list

**Files:**

- Test: `tests/courses.test.ts`
- Test: `tests/course-card.test.tsx`
- Create: `lib/courses.ts`
- Create: `components/CourseCard.tsx`
- Create: `app/courses/page.tsx`

**Interfaces:**

- Consumes: the `@/*` alias and App Router.
- Produces: `Course`, `getCourses(): Promise<Course[]>`, `getCourse(id: string): Promise<Course | undefined>`, and `CourseCard(props: CourseCardProps)`.

- [ ] **Step 1: Write failing data tests**

  Test that `getCourses()` returns the six exact IDs and that `getCourse("backend-fastapi")` returns the expected record while an unknown ID returns `undefined`:

  ```ts
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
  ```

- [ ] **Step 2: Run the tests and verify RED**

  Run `npm test -- tests/courses.test.ts`. Expect module resolution to fail because `lib/courses.ts` does not exist.

- [ ] **Step 3: Implement the lab data exactly**

  Create the exact `Course` type, six records, generic `delay<T>(value, ms = 300)`, `getCourses()`, and `getCourse(id)` from Lab 1.

- [ ] **Step 4: Verify data tests GREEN**

  Run `npm test -- tests/courses.test.ts`. Expect two passing tests.

- [ ] **Step 5: Write the failing CourseCard test**

  ```tsx
  import { render, screen } from "@testing-library/react";
  import { describe, expect, it } from "vitest";
  import CourseCard from "@/components/CourseCard";

  describe("CourseCard", () => {
    it("links the entire course summary to its dynamic route", () => {
      render(
        <CourseCard
          id="modern-frontend"
          title="Modern Frontend: React & Next.js"
          description="React 19, Server Components, and the App Router."
          credits={5}
          likes={24}
        />,
      );

      expect(screen.getByRole("link", { name: /Modern Frontend/ })).toHaveAttribute(
        "href",
        "/courses/modern-frontend",
      );
      expect(screen.getByText("5 credits")).toBeInTheDocument();
      expect(screen.getByText(/24/)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 6: Run the CourseCard test and verify RED**

  Run `npm test -- tests/course-card.test.tsx`. Expect module resolution to fail because `components/CourseCard.tsx` does not exist.

- [ ] **Step 7: Implement CourseCard and the list route**

  Implement exactly this prop contract:

  ```ts
  type CourseCardProps = {
    id: string;
    title: string;
    description: string;
    credits: number;
    likes: number;
  };
  ```

  Return one `Link` wrapping the card contents. In `app/courses/page.tsx`, call `await getCourses()` in the component body and map each course to `CourseCard`.

- [ ] **Step 8: Verify and commit**

  Run `npm test -- tests/courses.test.ts tests/course-card.test.tsx` and `npm run lint`. Commit as `feat: add course data and catalog list`.

### Task 3: Dynamic route and interaction

**Files:**

- Test: `tests/like-button.test.tsx`
- Test: `tests/course-page.test.tsx`
- Create: `components/LikeButton.tsx`
- Create: `app/courses/[id]/page.tsx`
- Create: `app/courses/[id]/loading.tsx`
- Create: `app/courses/not-found.tsx`

**Interfaces:**

- Consumes: `getCourse(id)`, `getCourses()`, and `initialLikes: number`.
- Produces: a statically parameterized dynamic course page and the only Client Component.

- [ ] **Step 1: Write the failing LikeButton test**

  ```tsx
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { describe, expect, it } from "vitest";
  import LikeButton from "@/components/LikeButton";

  describe("LikeButton", () => {
    it("increments the local like count without navigation", async () => {
      const user = userEvent.setup();
      render(<LikeButton initialLikes={24} />);
      const button = screen.getByRole("button", { name: /24 likes/i });
      await user.click(button);
      expect(button).toHaveAccessibleName(/25 likes/i);
      expect(button).toHaveTextContent("25");
    });
  });
  ```

- [ ] **Step 2: Run the LikeButton test and verify RED**

  Run `npm test -- tests/like-button.test.tsx`. Expect module resolution to fail because `components/LikeButton.tsx` does not exist.

- [ ] **Step 3: Implement LikeButton minimally**

  Put `"use client";` on the first line, define `type LikeButtonProps = { initialLikes: number }`, initialize `useState<number>(initialLikes)`, and increment by one on click. Render a heart, the count, and an accessible name such as `${likes} likes`.

- [ ] **Step 4: Verify LikeButton GREEN**

  Run `npm test -- tests/like-button.test.tsx`. Expect one passing test.

- [ ] **Step 5: Write the failing course page tests**

  Import the real page, `generateStaticParams`, loading component, and not-found component. Assert that the generated parameters equal the six literal lab IDs; resolving the page with `Promise.resolve({ id: "modern-frontend" })` renders the course title, credits, and LikeButton initialized to 24; resolving an unknown ID rejects with Next.js's 404 error; and the loading and not-found components render their recovery text and `/courses` link.

- [ ] **Step 6: Run the route test and verify RED**

  Run `npm test -- tests/course-page.test.tsx`. Expect a missing-file failure for the dynamic route.

- [ ] **Step 7: Implement the dynamic route states**

  In the page, await `params`, await `getCourse(id)`, call `notFound()` when undefined, and render title, description, credits, and `LikeButton`. Implement `generateStaticParams()` as `(await getCourses()).map(({ id }) => ({ id }))`. Add a server-rendered loading status and a not-found page with a Next.js `Link` to `/courses`.

- [ ] **Step 8: Verify and commit**

  Run the two task tests plus `npm run lint`. Verify `rg -l '^["\x27]use client["\x27]' --glob '*.tsx'` prints only `components/LikeButton.tsx`. Commit as `feat: add dynamic course pages and likes`.

### Task 4: Static pages, navigation, and responsive styling

**Files:**

- Test: `tests/app-shell.test.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Create: `app/about/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**

- Consumes: the four route URLs.
- Produces: shared Home, Courses, and About navigation and static server-rendered pages.

- [ ] **Step 1: Write the failing shell tests**

  Render the real home and About page components and assert their headings, project text, and `/courses` link. Render the real root layout to static markup and assert that its navigation exposes Home, Courses, and About links with `href` values `/`, `/courses`, and `/about`.

- [ ] **Step 2: Run the shell test and verify RED**

  Run `npm test -- tests/app-shell.test.tsx`. Expect failure because `app/about/page.tsx` and the required navigation are absent.

- [ ] **Step 3: Implement the shell and pages**

  Add shared navigation to `layout.tsx`. Add an original course-catalog heading, short welcome sentence, and `Link` to `/courses` on the home page. Add two or three static sentences about the catalog and Advanced Web Technologies to `/about`.

- [ ] **Step 4: Apply the visual system**

  Use Tailwind classes and a small global CSS token baseline. Keep body text at least 16 px, visible keyboard focus, minimum 44 px button height, no horizontal overflow, responsive cards, and reduced-motion-safe transitions.

- [ ] **Step 5: Verify and commit**

  Run `npm test`, `npm run lint`, and `npm run build`. Commit as `feat: add shared navigation and static pages`.

### Task 5: Documentation and local acceptance

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: a successful production build and all application routes.
- Produces: reproducible setup, test, and deployment documentation plus browser acceptance coverage.

- [ ] **Step 1: Start browser acceptance before final polish**

  Start the production server and open an isolated Playwright CLI session for `/`, `/about`, `/courses`, a known course, and `/courses/does-not-exist`. Capture fresh snapshots after each navigation and a screenshot at desktop and mobile widths.

- [ ] **Step 2: Run acceptance and verify failures are meaningful**

  Verify the shared navigation and expected content on every route. On the known course page, click the LikeButton and observe the count increase without a page reload. Any failure must identify a missing route, copy, layout, or interaction rather than a harness error.

- [ ] **Step 3: Fix only acceptance gaps**

  Make the smallest source changes needed for the browser tests to pass. Re-run affected unit tests after each change.

- [ ] **Step 4: Write the README**

  Document the four routes, Server and Client Component split, prerequisites, `npm install`, `npm run dev`, `npm test`, `npm run lint`, `npm run build`, and deployment location. Use a temporary deployment marker only until Vercel returns the final URL.

- [ ] **Step 5: Verify and commit**

  Run `npm test`, `npm run lint`, `npm run build`, and the full Playwright CLI acceptance flow. Commit as `docs: document the course catalog`.

### Task 6: Publish and deploy

**Files:**

- Modify: `README.md`

**Interfaces:**

- Consumes: the verified local Git revision and authenticated GitHub and Vercel CLIs.
- Produces: a public GitHub repository and public Vercel production URL at the same source revision.

- [ ] **Step 1: Create the public repository**

  Create GitHub repository `YZ-AWT` with public visibility from the current local repository, set `origin`, and push the complete commit history.

- [ ] **Step 2: Deploy the pushed project to Vercel**

  Link or create the Vercel project and deploy production from the verified local tree. Capture the canonical production URL.

- [ ] **Step 3: Verify the deployed application**

  Check the production root, course list, known course, unknown course, and like interaction. Confirm Vercel reports a ready production deployment for the intended project and that the deployed commit matches the published repository state.

- [ ] **Step 4: Record the deployment URL**

  Replace the README deployment marker with the canonical production URL, commit as `docs: add live deployment link`, push it, and update the public GitHub repository description or homepage with the same URL.

- [ ] **Step 5: Verify final repository and deployed bytes**

  Confirm the repository is public, the default branch contains all commits, the README exposes the final URL, `git status` is clean, and the production URL still passes the route and interaction checks after the final deployment command has exited.
