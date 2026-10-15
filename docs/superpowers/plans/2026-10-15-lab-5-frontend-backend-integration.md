# Lab 5 frontend and backend integration implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing YZ-AWT Next.js catalog to the FastAPI course API and satisfy every required Lab 5 acceptance check.

**Architecture:** FastAPI owns course and enrollment state and exposes camelCase JSON with exact-origin CORS. Next.js Server Components read through `API_URL`, while three Client Components call FastAPI directly through `NEXT_PUBLIC_API_URL`; both repositories remain independently runnable and testable.

**Tech Stack:** Python 3.10+, FastAPI, Pydantic 2.11+, unittest/TestClient, Next.js 16.3.4, React 19, TypeScript, Tailwind CSS, shadcn/ui, SWR, Vitest, Testing Library, and Playwright.

**Spec:** `docs/superpowers/specs/2026-10-15-lab-5-frontend-backend-integration-design.md`

## Global constraints

- Treat `YZ-AWT` as the lab's existing `course-catalog` frontend; do not rename either repository.
- Preserve existing Lab 4 query, sorting, searching, and pagination behavior.
- Default to the exact browser origin `http://localhost:3000`; allow additional exact origins only through `CORS_ORIGINS`.
- Keep Python fields in snake_case and serialize model JSON in camelCase through `CamelModel`.
- Keep `is_elective` as the query-parameter spelling.
- Use `cache: "no-store"` for both Next.js server-side course reads.
- Keep `.env.local` out of Git and define both API URL variables as `http://localhost:8000`.
- Implement generated OpenAPI types, environment-driven CORS origins, and explicit CORS method/header allowlists; omit the rewrite and frozen-data experiments.
- Preserve the current visual system and accessible interaction states.
- Use `apply_patch` for source and documentation edits; use package managers only for dependency metadata.
- End with at least three new meaningful backend commits and five new meaningful frontend commits, then push both `main` branches to their existing `37822-glitch` remotes.

## Review focus

- A foreign or trailing-slash origin must never receive CORS permission; Tasks 1 and 9 pin exact, configured, and rejected-origin behavior.
- A missing `API_URL` must fail with the lab's clear configuration message; Task 4 tests module initialization.
- A backend `500` for one course must throw rather than become a false not-found result; Task 4 distinguishes `404` from every other non-success status.
- Repeated user actions while a mutation is pending must not send duplicate requests; Tasks 7 and 8 test disabled pending controls.
- A malformed validation response must not crash the enrollment form; Task 8 tests its generic fallback message.

---

### Task 1: Exact-origin CORS

**Files:**
- Modify: `../course-catalog-api/tests/test_api.py`
- Modify: `../course-catalog-api/main.py`

**Interfaces:**
- Consumes: the existing FastAPI `app`.
- Produces: CORS responses that allow `http://localhost:3000`, all methods, and all headers.

- [ ] **Step 1: Add failing `CorsTests`**

Add tests asserting that an allowed-origin `GET /courses` returns `access-control-allow-origin: http://localhost:3000`, a foreign and trailing-slash origin return no permission header, and an enrollment `OPTIONS` request for `POST` plus `content-type` returns `200` with the expected allow headers.

- [ ] **Step 2: Verify the CORS tests fail**

Run from `course-catalog-api`: `python -m unittest tests.test_api.CorsTests -v`.
Expected: failures because no CORS response headers exist and preflight returns `405`.

- [ ] **Step 3: Configure `CORSMiddleware`**

Add middleware to `main.py` with `allow_origins=["http://localhost:3000"]`, `allow_methods=["*"]`, and `allow_headers=["*"]`.

- [ ] **Step 4: Verify the CORS tests pass**

Run: `python -m unittest tests.test_api.CorsTests -v`.
Expected: all CORS tests pass.

- [ ] **Step 5: Commit the backend change**

Run: `git add main.py tests/test_api.py && git commit -m "feat: enable CORS for frontend origin"`.

### Task 2: camelCase Pydantic contract

**Files:**
- Modify: `../course-catalog-api/models.py`
- Modify: `../course-catalog-api/requirements.txt`
- Modify: `../course-catalog-api/tests/test_api.py`

**Interfaces:**
- Consumes: Pydantic `to_camel` and the existing `Course` fields.
- Produces: `CamelModel`, `Course`, `EnrollmentIn`, and `Enrollment`; all API JSON uses aliases.

- [ ] **Step 1: Add failing model and serialization tests**

Test `Course.model_dump(by_alias=True)` for `isElective`, `EnrollmentIn` validation from both `courseId`/`studentName` and snake_case names, `GET /courses` for camelCase keys, and `GET /courses?is_elective=true` for exactly the two elective courses.

- [ ] **Step 2: Verify the contract tests fail**

Run: `python -m unittest tests.test_api.CourseModelTests tests.test_api.BasicRouteTests.test_courses_default_to_popularity_order tests.test_api.CourseQueryTests.test_filter_elective_courses -v`.
Expected: failures for missing models and snake_case response keys.

- [ ] **Step 3: Implement the shared model base**

Define `CamelModel` with `alias_generator=to_camel`, `validate_by_name=True`, and `validate_by_alias=True`; inherit `Course`, `EnrollmentIn`, and `Enrollment` from it; require `student_name: str = Field(min_length=2)`; add `pydantic>=2.11` to `requirements.txt`.

- [ ] **Step 4: Verify all existing backend behavior still passes**

Run: `python -m unittest discover -s tests -v`.
Expected: all tests pass after updating old response-key assertions to `isElective`.

- [ ] **Step 5: Commit the backend change**

Run: `git add models.py requirements.txt tests/test_api.py && git commit -m "feat: add camelCase API models"`.

### Task 3: Like and enrollment routes

**Files:**
- Modify: `../course-catalog-api/main.py`
- Modify: `../course-catalog-api/tests/test_api.py`

**Interfaces:**
- Consumes: `find_course()`, `Course`, `EnrollmentIn`, and `Enrollment`.
- Produces: `like_course(course_id: str) -> Course`, `create_enrollment(data: EnrollmentIn) -> Enrollment`, `read_enrollments() -> list[Enrollment]`, and `ENROLLMENTS: list[Enrollment]`.

- [ ] **Step 1: Add failing mutation and route tests**

Test like success and persistence, unknown like `404`, enrollment `201` and subsequent list visibility, one-letter-name `422` with `studentName` in the error location, unknown-course `404`, and the exact six documented operations. Reset mutated likes and `ENROLLMENTS` between tests.

- [ ] **Step 2: Verify the new route tests fail**

Run: `python -m unittest tests.test_api.MutationRouteTests -v`.
Expected: failures because the three operations do not exist.

- [ ] **Step 3: Implement the routes and in-memory state**

Add bodyless `POST /courses/{course_id}/like`, `POST /enrollments` with `status_code=201`, and `GET /enrollments`; use the exact `Course not found` detail for unknown IDs and `len(ENROLLMENTS) + 1` for IDs.

- [ ] **Step 4: Verify the complete backend suite**

Run: `python -m unittest discover -s tests -v`.
Expected: all tests pass and the OpenAPI assertion finds six application operations.

- [ ] **Step 5: Commit the backend change**

Run: `git add main.py tests/test_api.py && git commit -m "feat: add like and enrollment routes"`.

### Task 4: Frontend API data layer

**Files:**
- Create, ignored: `.env.local`
- Modify: `vitest.setup.ts`
- Modify: `lib/courses.ts`
- Modify: `tests/courses.test.ts`
- Modify: `tests/courses-page.test.tsx`
- Modify: `tests/course-page.test.tsx`

**Interfaces:**
- Consumes: `process.env.API_URL` and FastAPI's camelCase `Course` JSON.
- Produces: `Course`, `Enrollment`, `getCourses(): Promise<Course[]>`, and `getCourse(id: string): Promise<Course | undefined>`.

- [ ] **Step 1: Read the installed Next.js 16 guidance**

Read the relevant App Router, data-fetching, dynamic-route, and error-handling files under `node_modules/next/dist/docs` before editing Next.js code; record the exact files consulted in the execution notes.

- [ ] **Step 2: Add failing API helper tests**

Mock `fetch` and assert the exact URLs, `cache: "no-store"`, success parsing, `getCourse()` mapping only `404` to `undefined`, other error statuses throwing `API error: STATUS`, and a fresh module import without `API_URL` throwing `API_URL is not set: create .env.local`.

- [ ] **Step 3: Verify the helper tests fail**

Run from `YZ-AWT`: `npm test -- tests/courses.test.ts`.
Expected: failures because the helpers still return mock data.

- [ ] **Step 4: Replace mock data with fetch helpers**

Keep the exact `Course` type, add `Enrollment = { id: number; courseId: string; studentName: string }`, validate the module-level `API_URL`, and implement the two response-handling paths. Set both test env variables in `vitest.setup.ts`, create the ignored `.env.local`, and mock the data module in page-component tests.

- [ ] **Step 5: Verify data and page tests pass**

Run: `npm test -- tests/courses.test.ts tests/courses-page.test.tsx tests/course-page.test.tsx`.
Expected: all selected tests pass.

- [ ] **Step 6: Commit the frontend change**

Run: `git add vitest.setup.ts lib/courses.ts tests/courses.test.ts tests/courses-page.test.tsx tests/course-page.test.tsx && git commit -m "feat: fetch courses from FastAPI"`.

### Task 5: Dynamic course errors and retry

**Files:**
- Modify: `app/courses/[id]/page.tsx`
- Create: `app/courses/error.tsx`
- Modify: `tests/course-page.test.tsx`
- Create: `tests/courses-error.test.tsx`

**Interfaces:**
- Consumes: `getCourse(id)` and Next.js `notFound()`.
- Produces: a fully dynamic detail route and `CourseError({ error, retry })` recovery UI.

- [ ] **Step 1: Add failing route and error-state tests**

Remove the old static-parameter expectation. Assert that the detail module has no `generateStaticParams`, known and unknown IDs still render correctly, the error component logs its error, and “Try again” invokes `retry` exactly once.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- tests/course-page.test.tsx tests/courses-error.test.tsx`.
Expected: failure because static generation remains and the error component is missing.

- [ ] **Step 3: Implement dynamic rendering and recovery**

Remove `getCourses` and `generateStaticParams` from the detail route. Add the client error boundary with the lab's `error` and `retry` props, `useEffect(() => console.error(error), [error])`, accessible status text, and styled retry button.

- [ ] **Step 4: Verify the tests pass**

Run: `npm test -- tests/course-page.test.tsx tests/courses-error.test.tsx`.
Expected: all selected tests pass.

- [ ] **Step 5: Commit the frontend change**

Run: `git add app/courses/'[id]'/page.tsx app/courses/error.tsx tests/course-page.test.tsx tests/courses-error.test.tsx && git commit -m "feat: add retryable course error state"`.

### Task 6: SWR elective filter

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `components/ElectiveFilter.tsx`
- Create: `app/filter/page.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/elective-filter.test.tsx`
- Modify: `tests/app-shell.test.tsx`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_API_URL`, SWR, and `Course` as a type-only import.
- Produces: `ElectiveFilter()` and the `/filter` route.

- [ ] **Step 1: Install SWR and add failing filter tests**

Run `npm install swr`. Test the initial `/courses` request, checkbox-triggered `?is_elective=true` request, loading state, failed-response state, course copy (`— N cr.` and `· elective`), and the Filter navigation link.

- [ ] **Step 2: Verify the component tests fail**

Run: `npm test -- tests/elective-filter.test.tsx tests/app-shell.test.tsx`.
Expected: failure because the component and route do not exist.

- [ ] **Step 3: Implement the browser-side filter**

Create a client component with a fetcher that rejects non-success responses, an “Electives only” checkbox, responsive styled results, and clear loading/error states. Add `/filter` and update shared navigation and footer lab label.

- [ ] **Step 4: Verify the filter tests pass**

Run: `npm test -- tests/elective-filter.test.tsx tests/app-shell.test.tsx`.
Expected: all selected tests pass.

- [ ] **Step 5: Commit the frontend change**

Run: `git add package.json package-lock.json components/ElectiveFilter.tsx app/filter/page.tsx app/layout.tsx tests/elective-filter.test.tsx tests/app-shell.test.tsx && git commit -m "feat: add SWR elective filter"`.

### Task 7: Server-backed likes

**Files:**
- Modify: `components/LikeButton.tsx`
- Modify: `app/courses/[id]/page.tsx`
- Modify: `tests/like-button.test.tsx`
- Modify: `tests/course-page.test.tsx`

**Interfaces:**
- Consumes: `courseId`, `initialLikes`, `NEXT_PUBLIC_API_URL`, and the like endpoint's `Course` response.
- Produces: `LikeButton({ courseId, initialLikes })` with server-persisted counts and failure feedback.

- [ ] **Step 1: Add failing like tests**

Assert bodyless `POST` to the exact URL, no custom headers, replacement with the returned likes value, no duplicate request while pending, unchanged count plus visible feedback on failure, and detail-page propagation of `courseId`.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- tests/like-button.test.tsx tests/course-page.test.tsx`.
Expected: failure because likes are local-only and `courseId` is unsupported.

- [ ] **Step 3: Implement server-backed liking**

Add pending and error state, fetch the endpoint with `{ method: "POST" }`, reject non-success responses, set the response count, disable while pending, and keep the existing visual treatment.

- [ ] **Step 4: Verify the tests pass**

Run: `npm test -- tests/like-button.test.tsx tests/course-page.test.tsx`.
Expected: all selected tests pass.

- [ ] **Step 5: Commit the frontend change**

Run: `git add components/LikeButton.tsx app/courses/'[id]'/page.tsx tests/like-button.test.tsx tests/course-page.test.tsx && git commit -m "feat: persist course likes through API"`.

### Task 8: Enrollment form

**Files:**
- Create: `components/EnrollForm.tsx`
- Modify: `app/courses/[id]/page.tsx`
- Create: `tests/enroll-form.test.tsx`
- Modify: `tests/course-page.test.tsx`

**Interfaces:**
- Consumes: `courseId`, `NEXT_PUBLIC_API_URL`, the enrollment endpoint, and `Enrollment`.
- Produces: `EnrollForm({ courseId })` with `idle | sending | done | rejected | error` states.

- [ ] **Step 1: Add failing enrollment tests**

Assert the exact JSON request and content type, success copy with enrollment number, server `422` detail display, generic fallback for malformed validation and other failures, no client-side minimum-length rejection, and no duplicate submission while pending.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- tests/enroll-form.test.tsx tests/course-page.test.tsx`.
Expected: failure because the form does not exist.

- [ ] **Step 3: Implement and place the form**

Create the styled client form, parse the first `{ detail: [{ msg }] }` validation message, and place it below the like control under the heading “Enroll in this course.”

- [ ] **Step 4: Verify the tests pass**

Run: `npm test -- tests/enroll-form.test.tsx tests/course-page.test.tsx`.
Expected: all selected tests pass.

- [ ] **Step 5: Commit the frontend change**

Run: `git add components/EnrollForm.tsx app/courses/'[id]'/page.tsx tests/enroll-form.test.tsx tests/course-page.test.tsx && git commit -m "feat: add course enrollment form"`.

### Task 9: Environment-driven explicit CORS policy

**Files:**
- Modify: `../course-catalog-api/main.py`
- Modify: `../course-catalog-api/tests/test_api.py`

**Interfaces:**
- Consumes: `CORS_ORIGINS` and the completed FastAPI app.
- Produces: `cors_origins() -> list[str]` plus middleware restricted to `GET`, `POST`, and `Content-Type`.

- [ ] **Step 1: Add failing bonus CORS tests**

Test the default origin, a comma-separated `localhost` plus `127.0.0.1` environment value, a successful enrollment preflight, and `400` preflights for `DELETE` and `Authorization`.

- [ ] **Step 2: Verify the bonus tests fail**

Run: `python -m unittest tests.test_api.CorsConfigurationTests -v`.
Expected: failure because the environment reader is missing and wildcard permissions accept the forbidden method and header.

- [ ] **Step 3: Implement the narrower policy**

Read `CORS_ORIGINS` with the exact default `http://localhost:3000`, split it on commas, and configure `allow_methods=["GET", "POST"]` plus `allow_headers=["Content-Type"]`.

- [ ] **Step 4: Verify the complete backend suite**

Run: `python -m unittest discover -s tests -v`.
Expected: all backend tests pass, including both rejected preflights.

- [ ] **Step 5: Commit the backend bonus**

Run: `git add main.py tests/test_api.py && git commit -m "feat: configure explicit CORS policy"`.

### Task 10: Generated OpenAPI frontend types

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `lib/schema.d.ts`
- Modify: `lib/courses.ts`
- Create: `tests/schema-contract.test.ts`
- Modify temporarily, restore before commit: `../course-catalog-api/models.py`

**Interfaces:**
- Consumes: FastAPI `/openapi.json` and `components["schemas"]` from the generated declaration file.
- Produces: generated `Course` and `Enrollment` aliases used by every frontend consumer.

- [ ] **Step 1: Add a failing type-contract test**

Create a compile-time and runtime fixture typed as `components["schemas"]["Course"]` with all six course fields and camelCase `isElective`.

- [ ] **Step 2: Verify the schema contract is absent**

Run: `npx tsc --noEmit`.
Expected: failure because `lib/schema.d.ts` does not exist.

- [ ] **Step 3: Generate and consume the schema**

Install `openapi-typescript` as a development dependency, add `generate:types` using `http://localhost:8000/openapi.json -o lib/schema.d.ts`, start FastAPI, run the generator, and replace handwritten `Course` and `Enrollment` definitions in `lib/courses.ts` with generated aliases.

- [ ] **Step 4: Verify types and frontend tests**

Run: `npx tsc --noEmit && npm test`.
Expected: type checking and all frontend tests pass.

- [ ] **Step 5: Run and restore the contract-drift experiment**

Temporarily rename one backend model field, regenerate types, and run `npx tsc --noEmit`; record the stale frontend property errors. Restore `models.py`, regenerate the original schema, and rerun type checking successfully.

- [ ] **Step 6: Commit the frontend bonus**

Run: `git add package.json package-lock.json lib/schema.d.ts lib/courses.ts tests/schema-contract.test.ts && git commit -m "feat: generate course types from OpenAPI"`.

### Task 11: Required breakage journal and READMEs

**Files:**
- Modify temporarily, restore before commit: `../course-catalog-api/main.py`
- Modify temporarily, restore before commit: `next.config.ts`
- Modify: `../course-catalog-api/README.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the completed application and actual browser/terminal evidence.
- Produces: five required breakage entries, the OpenAPI contract-drift observation, and current run/API documentation.

- [ ] **Step 1: Run the five controlled breakages**

Start both servers and use a real browser plus terminal requests to observe: missing middleware, trailing-slash origin, missing allowed methods, the `127.0.0.1` browser origin, and the `p["ofset"]` backend exception. For each, record the console message, Network statuses, backend evidence, cause, and repair; reverse each temporary edit before continuing.

- [ ] **Step 2: Prove the working state is restored**

Run both test suites and inspect `git diff` in both repositories. Expected: application tests pass, and no temporary breakage remains.

- [ ] **Step 3: Update the backend README**

Add “What changed” with the default/configurable allowed origins and reason, explicit CORS permissions, camelCase response contract, all three new operations, example responses, current setup, and verification commands.

- [ ] **Step 4: Commit the backend documentation**

Run: `git add README.md && git commit -m "docs: explain Lab 5 API integration"`.

- [ ] **Step 5: Update the frontend README**

Document backend-first startup, `.env.local` variable names and values, generated-type command, current routes and components, a five-entry Breakage journal with collected evidence, the contract-drift observation, and Decisions explaining removal of `generateStaticParams` plus like-versus-enrollment preflight behavior.

- [ ] **Step 6: Commit the frontend documentation**

Run: `git add README.md && git commit -m "docs: add Lab 5 breakage journal"`.

### Task 12: Final acceptance and delivery

**Files:**
- Verify only; modify a source file only if a failing acceptance check requires a test-first repair.

**Interfaces:**
- Consumes: both completed repositories.
- Produces: clean, tested, pushed `main` branches and reproducible local run instructions.

- [ ] **Step 1: Run the backend acceptance suite**

Run `python -m unittest discover -s tests -v`, start FastAPI, and verify the six `/docs` operations, camelCase responses, exactly two elective courses, all `200/201/404/422` cases, default/configured/foreign origin headers, successful enrollment preflight, and rejected `DELETE` and `Authorization` preflights with `curl`.

- [ ] **Step 2: Run frontend static verification with FastAPI stopped**

Stop FastAPI, then run `npx tsc --noEmit`, `npm test`, `npm run lint`, and `npm run build`. Expected: every command exits `0`; the build does not contact port 8000.

- [ ] **Step 3: Run the complete browser acceptance path**

Start FastAPI first and Next.js second. Verify six popularity-sorted cards, two persisted web-security likes across reload, one-letter enrollment rejection, Aigerim enrollment number `1`, enrollment visibility through the API, elective filtering, enrollment preflight but no like preflight, backend-off error state, and retry recovery after restart. Capture final desktop and mobile screenshots for visual inspection.

- [ ] **Step 4: Check repository hygiene and commit counts**

Verify `.env.local` is ignored, both worktrees are clean, remotes target `37822-glitch`, and today's history contains at least three backend and five frontend Lab 5 commits.

- [ ] **Step 5: Push and confirm both repositories**

Run `git push origin main` in `course-catalog-api` and `YZ-AWT`, then confirm the remote branch heads match the local heads. Report both public repository links and the local presentation URLs.
