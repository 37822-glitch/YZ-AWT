# YZ-AWT Course Catalog

YZ-AWT is the Lab 1 semester-project scaffold for Advanced Web Technologies. It is a course catalog built with Next.js 16, the App Router, TypeScript, and Tailwind CSS.

## Live application

The production Vercel link will be added after deployment.

## Implemented routes

- `/` introduces the catalog and links to the course list.
- `/about` explains the project and course context.
- `/courses` loads the mock course data in a Server Component.
- `/courses/[id]` displays a statically generated course page with an interactive like button.
- `/courses/does-not-exist` demonstrates the custom course not-found state.

## Component architecture

The project keeps the Server and Client Component boundary narrow:

- `lib/courses.ts` contains the typed mock data and asynchronous data-access functions.
- `components/CourseCard.tsx` is a Server Component whose complete card is a Next.js `Link`.
- `components/LikeButton.tsx` is the only Client Component. It uses local React state to increment likes.
- `app/courses/[id]/page.tsx` awaits promised route parameters and exports `generateStaticParams` for every mock course.
- `app/courses/[id]/loading.tsx` provides navigation feedback while course data loads.
- `app/courses/not-found.tsx` provides a recovery path when `notFound()` handles an unknown course.

## Run locally

Node.js 20 or newer is required.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

If port 3000 is unavailable, Next.js selects the next free port and prints it in the terminal.

## Verify the project

Run every automated check:

```bash
npm test
npm run lint
npm run build
```

The production build also verifies the six routes returned by `generateStaticParams`.
