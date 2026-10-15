# YZ-AWT Course Catalog

YZ-AWT is the Next.js frontend for the Advanced Web Technologies course
catalog. Lab 5 replaces the earlier mock-data flow with a live FastAPI
integration while preserving the Tailwind CSS and shadcn/ui interface from
Lab 2.

## What Lab 5 adds

- Server-side course fetching from FastAPI with `cache: "no-store"`.
- A route-level error boundary with an in-place retry action.
- Persistent likes through `POST /courses/{course_id}/like`.
- Enrollment through `POST /enrollments`, including FastAPI `422` feedback.
- A browser-side elective filter powered by SWR.
- TypeScript models generated directly from FastAPI's OpenAPI schema.
- Separate server-only and browser-visible API environment variables.

## Run the complete project

Start the backend first from the neighboring `course-catalog-api` repository:

```bash
cd ../course-catalog-api
source .venv/bin/activate
fastapi dev main.py --host 127.0.0.1 --port 8000
```

In a second terminal, configure and start this frontend:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. FastAPI documentation is available at
<http://localhost:8000/docs>.

The environment variables serve different runtimes:

```dotenv
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

`API_URL` is read only by Server Components. `NEXT_PUBLIC_API_URL` is embedded
in browser JavaScript for likes, enrollment, and SWR filtering.

## Routes

| Route | Rendering and data flow |
| --- | --- |
| `/` | Static catalog introduction |
| `/about` | Static project context |
| `/courses` | Server Component fetching the live course list |
| `/courses/[id]` | Dynamic server route with client like and enrollment controls |
| `/filter` | Client-side SWR filter using `is_elective=true` |

## Component architecture

- `lib/courses.ts` is the server data-access layer. It fails fast when
  `API_URL` is missing and maps a course `404` to the custom not-found state.
- `lib/schema.d.ts` is generated from FastAPI OpenAPI and supplies the shared
  `Course` and `Enrollment` types.
- `components/CourseCard.tsx` remains a Server Component composed from
  shadcn/ui primitives.
- `components/LikeButton.tsx`, `components/EnrollForm.tsx`, and
  `components/ElectiveFilter.tsx` are focused Client Components for browser
  interaction.
- `app/courses/error.tsx` contains the route-level recovery UI.

The dynamic course route intentionally does not use `generateStaticParams`:
live data must not be fetched from FastAPI during `next build`, and detail
pages must reflect current likes when requested.

## OpenAPI-generated types

With FastAPI running on port 8000, refresh the checked-in schema types with:

```bash
npm run generate:types
```

This runs `openapi-typescript` against `/openapi.json`. The generated models
confirm that the API exposes browser-friendly camelCase fields such as
`isElective`, `courseId`, and `studentName`.

## CORS diagnostic journal

These are the five required failure scenarios and their distinguishing
signals. They are diagnostic references; the repository keeps only the final,
working configuration.

| Scenario | Browser/API evidence | Root cause and repair |
| --- | --- | --- |
| CORS middleware absent | Simple GET/like reaches FastAPI with `200`, but the browser blocks the response; enrollment preflight fails before POST | No permission headers; restore `CORSMiddleware` |
| Allowed origin has a trailing slash | Preflight returns `400 Disallowed CORS origin` for `http://localhost:3000/` | Origins are exact strings; use `http://localhost:3000` |
| POST omitted from allowed methods | GET/filter still works; enrollment preflight returns `400 Disallowed CORS method` | Add `POST` to the explicit method list |
| Frontend opened at `127.0.0.1:3000` | FastAPI may return `200`, but the browser blocks access | `127.0.0.1` and `localhost` are different origins; add it to `CORS_ORIGINS` when needed |
| Pagination key misspelled | `/courses` returns `500` and the server traceback shows `KeyError`; mutation routes still work | Repair the dependency dictionary lookup; this is an application error, not CORS |

Preflight is expected for enrollment because JSON uses the non-safelisted
`Content-Type: application/json` header. The like request has no custom header,
so it normally remains a simple POST.

## Selected bonus tasks

- OpenAPI-generated TypeScript types.
- Environment-configurable CORS origins.
- Explicit CORS method and header allowlists.

The two intentionally destructive bonus experiments are documented above but
are not retained in the final source.

## Verification

Run the frontend checks with the backend stopped to prove the production build
has no API startup dependency:

```bash
npx tsc --noEmit
npm test
npm run lint
npm run build
```
