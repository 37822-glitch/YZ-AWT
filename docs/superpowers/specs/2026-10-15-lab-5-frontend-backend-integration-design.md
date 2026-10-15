# Lab 5 frontend and backend integration design

## Purpose

Lab 5 connects the existing Next.js course catalog to the existing FastAPI API. The completed system must demonstrate server-side data fetching, direct browser requests, cross-origin resource sharing (CORS), a camelCase JSON contract, server-backed interactions, and evidence-based diagnosis of browser and backend failures.

The lab document calls the frontend `course-catalog`. In this workspace, the existing frontend repository is `YZ-AWT`, so this design applies the frontend requirements there without renaming or replacing the repository. The backend remains `course-catalog-api`.

## Scope

The implementation includes every required item from the Lab 5 acceptance checklist:

- Exact-origin CORS for `http://localhost:3000`.
- camelCase Pydantic request and response models while preserving Python snake_case field names and the `is_elective` query parameter.
- Server-backed course likes and in-memory enrollments.
- Next.js server-side course reads through `API_URL` with uncached requests and explicit response handling.
- Browser-side filtering, liking, and enrollment through `NEXT_PUBLIC_API_URL`.
- Loading, not-found, and retryable error states.
- Five required controlled breakage experiments and a documented breakage journal.
- Automated backend and frontend tests, production-build verification with the backend stopped, and real-browser integration checks.
- Meaningful commits in both repositories and pushes to their existing `37822-glitch` GitHub remotes.

The optional bonus tasks are out of scope. The implementation does not add a Next.js rewrite, generated OpenAPI types, environment-driven CORS origins, frozen-data experiments, or explicit CORS method/header allowlists.

## Repository boundaries

`course-catalog-api` owns the data, validation rules, mutation state, and HTTP contract. Its in-memory state resets whenever the FastAPI process restarts.

`YZ-AWT` owns presentation and user interaction. Server Components use the private `API_URL` variable. Client Components use the browser-visible `NEXT_PUBLIC_API_URL` variable. `.env.local` supplies both values locally and remains excluded from Git.

The repositories stay independently runnable and independently testable. The frontend imports no backend source files, and the backend has no knowledge of frontend components.

## Data flow

The application uses two request paths:

1. `/courses` and `/courses/[id]` fetch data from FastAPI inside Next.js Server Components. These requests are not subject to browser CORS checks.
2. `/filter`, `LikeButton`, and `EnrollForm` send requests from the browser directly to FastAPI. These requests require the backend to grant permission to the exact `http://localhost:3000` origin.

All course reads use `cache: "no-store"`. Removing `generateStaticParams()` prevents course API requests during `next build`, so the build must succeed while the backend is stopped.

## Backend contract

The API exposes exactly these six operation paths:

- `GET /`
- `GET /courses`
- `GET /courses/{course_id}`
- `POST /courses/{course_id}/like`
- `POST /enrollments`
- `GET /enrollments`

`CamelModel` configures Pydantic with `to_camel`, `validate_by_name=True`, and `validate_by_alias=True`. `Course` and enrollment models inherit from it. JSON therefore uses names such as `isElective`, `courseId`, and `studentName`, while Python code keeps snake_case names.

The like route increments the matching course's `likes` value and returns the updated course. An unknown course returns `404` with `Course not found`.

`POST /enrollments` accepts `courseId` and `studentName`, requires a name of at least two characters, verifies that the course exists, assigns an incrementing in-memory ID, stores the enrollment, and returns `201`. Validation errors return `422`; an unknown course returns `404`. `GET /enrollments` returns the current in-memory collection.

CORS middleware allows only `http://localhost:3000`, all methods, and all headers. An allowed response includes `access-control-allow-origin`; a foreign origin receives no permission header; the enrollment preflight returns `200`.

## Frontend behavior

`lib/courses.ts` defines the shared `Course` and `Enrollment` types and replaces mock data with API calls. The module fails with a clear message when server-side `API_URL` is missing. `getCourses()` throws on every non-success response. `getCourse()` maps `404` to `undefined` for `notFound()` and throws on other failures.

The existing course list and detail presentation remain visually consistent with the current YZ-AWT design. The course detail route no longer exports `generateStaticParams()`. It passes both the initial like count and course ID to the interactive controls.

`app/courses/error.tsx` is a Client Component. It logs the received error and calls the Next.js `retry` callback from a visible “Try again” button.

`ElectiveFilter` uses SWR and requests either `/courses` or `/courses?is_elective=true` directly from the browser. It renders the course title, credit count, and elective marker. `/filter` hosts the component, and the shared navigation links to that route.

`LikeButton` sends a bodyless `POST` request to the course like endpoint and replaces its displayed count with the returned server value. It shows a clear failure message when the request fails. Because this is a simple bodyless POST with no custom headers, the browser does not send a preflight.

`EnrollForm` sends JSON containing `courseId` and `studentName`. Its states are `idle`, `sending`, `done`, `rejected`, and `error`. It intentionally performs no client-side minimum-length validation so FastAPI can return the required `422` response and server message. The JSON content type causes the browser to send a preflight before the POST.

## Error and recovery behavior

The frontend preserves the existing loading and not-found experiences and adds a route error boundary for backend failures. When FastAPI is unavailable, `/courses` renders the error state. Starting FastAPI and selecting “Try again” requests the data again without a manual page reload.

Client Components distinguish failed HTTP responses from successful responses and expose concise user-facing messages. The enrollment form displays the first FastAPI validation message for `422`, the enrollment number for `201`, and a general failure message for unexpected errors.

## Breakage journal

The required journal records five temporary experiments:

1. Remove CORS middleware.
2. Add a trailing slash to the allowed origin.
3. Remove the explicit allowed methods.
4. Open the frontend from the `127.0.0.1` origin.
5. Introduce the required `ofset` key typo in the course list route.

Each entry records a browser-console quotation, Network request statuses, the observed backend behavior, the root cause, and the repair. Every temporary change is reverted before the final verification. The final Git state contains only intentional working code and documentation.

## Testing and verification

Backend tests cover camelCase serialization, snake_case query compatibility, CORS headers and preflight behavior, all successful routes, `404` cases, enrollment validation, and in-memory state changes.

Frontend tests mock network boundaries and cover API helpers, filter states, likes, enrollment success and rejection, error recovery, and the updated course pages. Linting and the production build must pass. The production build runs with FastAPI stopped.

The final integration check starts FastAPI first and Next.js second, then verifies the complete user path in a real browser: six courses in the required order, persistent likes across reloads, enrollment rejection and success, enrollment visibility through the API, browser-side elective filtering, preflight behavior, the error boundary, and retry recovery.

## Documentation and delivery

The backend README gains a “What changed” section covering the allowed origin, camelCase JSON, and the three new routes with example responses. The frontend README documents how to run both projects, the two environment variables, the five-entry breakage journal, and the required decisions about static generation and preflight behavior.

Changes are committed in meaningful stages rather than one final chunk. The backend receives at least three Lab 5 commits, and the frontend receives at least five. After final verification, both `main` branches are pushed to their existing public repositories under `37822-glitch`.
