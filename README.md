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

These are the five required controlled failures. Each entry records the
browser evidence and the diagnostic step that identified the cause. The
repository keeps only the restored, working configuration.

### Breakage 1: CORS middleware removed

- **What I did:** Commented out the complete `app.add_middleware(...)` block.
- **Console:** `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Network:** Browser `GET /courses` and `POST /courses/{id}/like` rows were
  blocked as CORS errors even though the FastAPI terminal recorded `200 OK`;
  the like still changed server state. `OPTIONS /enrollments` returned `405`,
  so the browser never sent the enrollment `POST`. The Server Component at
  `/courses` continued to work.
- **Cause:** No middleware added permission headers or handled preflight.
- **How I found it:** Algorithm steps 3 and 4: the response lacked
  `access-control-allow-origin`, and the preflight status was `405` rather than
  a CORS validation response.

### Breakage 2: Trailing slash in the allowed origin

- **What I did:** Changed the origin to `http://localhost:3000/`.
- **Console:** `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Network:** Browser GET and like responses were blocked. The enrollment
  `OPTIONS` request returned `400 Disallowed CORS origin`, and the browser did
  not send the enrollment `POST`.
- **Cause:** An origin is an exact scheme, host, and port. The trailing slash
  made the configured value different from `http://localhost:3000`.
- **How I found it:** Algorithm steps 3 and 4: the permission header was absent,
  and the `400` preflight body named the origin as the rejected part.

### Breakage 3: POST removed from allowed methods

- **What I did:** Removed the configured `allow_methods` list, leaving
  Starlette's default method policy.
- **Console:** `Response to preflight request doesn't pass access control check: It does not have HTTP ok status.`
- **Network:** `/filter` and the like still worked because their requests are
  simple. `OPTIONS /enrollments` returned `400 Disallowed CORS method`; the
  browser did not send the enrollment `POST`.
- **Cause:** The default policy allowed `GET`, but not the requested `POST`.
- **How I found it:** Algorithm step 4: the preflight response still had the
  correct origin header, but its method list omitted `POST` and its body named
  the method failure.

### Breakage 4: Frontend opened on a different origin

- **What I did:** Temporarily allowed the host in `allowedDevOrigins`, then
  opened the frontend at `http://127.0.0.1:3000/filter` while FastAPI allowed
  only `http://localhost:3000`.
- **Console:** `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Network:** The browser's `GET /courses` row was blocked as a CORS error even
  though the FastAPI terminal recorded `200 OK`.
- **Cause:** `127.0.0.1` and `localhost` are different hosts and therefore
  different origins.
- **How I found it:** Algorithm step 3: the request `Origin` value did not match
  the configured origin character for character, so the permission header was
  absent.

### Breakage 5: Python error that looks like CORS

- **What I did:** Replaced the first pagination lookup `p["offset"]` with the
  misspelled `p["ofset"]`.
- **Console:** `No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Network:** The browser's course request was blocked, while FastAPI logged
  `GET /courses 500 Internal Server Error`. The like and enrollment routes
  continued to work, and the Server Component `/courses` route showed
  `error.tsx`.
- **Cause:** The route raised `KeyError: 'ofset'`; the failure was an application
  exception, not a CORS configuration problem.
- **How I found it:** Algorithm steps 2 and 5: the backend terminal showed the
  `500` status and traceback, and the server-to-server page failed even though
  browser CORS rules do not apply to it.

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
