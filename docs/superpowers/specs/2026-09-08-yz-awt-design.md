# YZ-AWT course catalog design

## Purpose

YZ-AWT is the semester course-catalog scaffold required by Lab 1 for Advanced Web Technologies. It demonstrates Next.js 16 App Router conventions, TypeScript props, Server and Client Component boundaries, dynamic routes, loading and not-found states, and local client-side interaction.

The public GitHub repository and project directory are named `YZ-AWT`, as requested by the project owner. The package name remains the npm-compatible lowercase `yz-awt`.

## Scope

The implementation includes the required lab functionality and the requested deployment:

- Next.js 16, React, TypeScript, Tailwind CSS, ESLint, App Router, no `src/` directory, and the `@/*` import alias.
- Four routes: `/`, `/about`, `/courses`, and `/courses/[id]`.
- The exact `Course` type, six mock records, and 300 ms delayed `getCourses()` and `getCourse()` functions from the lab.
- A typed Server Component `CourseCard` whose entire card is a Next.js `Link`.
- An awaited `Promise<{ id: string }>` route parameter, `generateStaticParams()`, `notFound()`, `loading.tsx`, and `not-found.tsx`.
- A `LikeButton` implemented with `useState<number>(initialLikes)` as the only Client Component in the project.
- Shared Home, Courses, and About navigation built with `next/link`.
- A public GitHub repository with at least four meaningful commits.
- A production Vercel deployment whose URL is recorded in the README and repository description.

Optional lab bonuses such as search, authentication stubs, and an error boundary are excluded. This keeps the submission focused on the grading rubric.

## Architecture

`app/` owns routes and shared layout. `lib/courses.ts` is the only data source and simulates a server boundary with Promise-returning functions. `components/CourseCard.tsx` renders navigation and course metadata on the server. `components/LikeButton.tsx` owns the single piece of client state.

The course list awaits `getCourses()` directly in its Server Component. The dynamic course page awaits `params`, fetches by ID, calls `notFound()` for an unknown ID, and passes only the initial count to `LikeButton`. `generateStaticParams()` maps the same server data to all known course IDs.

## Interface and visual design

The interface uses a restrained academic catalog style: a dark navy header, white content surfaces, blue accents, readable typography, and responsive cards. The visual treatment remains secondary to the lab's component-boundary requirements.

Every page uses the same navigation and centered content width. The home page introduces the catalog with a single primary link. The course list presents six linked cards. The course detail page emphasizes the title, description, credit count, and like control. Focus, hover, active, and reduced-motion behavior remain accessible.

## Error and loading behavior

`app/courses/[id]/loading.tsx` renders a visible status while the delayed lookup resolves. Unknown course IDs call Next.js `notFound()` and render `app/courses/not-found.tsx` with a link back to the catalog. No empty course state or client-side data fetch is used.

## Verification

Automated tests verify the mock data API, CourseCard link contract, LikeButton increment behavior, shared navigation, and the one-client-component invariant. The production build verifies TypeScript and `generateStaticParams()`.

Browser acceptance covers all four required routes, an unknown course route, and the like-count increment without reload. After Vercel deployment, the same public routes and interaction are checked against the deployed URL. The deployed repository revision and README URL must match the final production deployment.
