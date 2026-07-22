# 📂 `/app` Directory

This directory contains the Next.js **App Router** structure, defining all the pages, layouts, and API routes for the application.

## Structure

- **`/admin`**: The admin dashboard for managing the club's data, syncing Reclub sessions, and handling administrative tasks.
- **`/actions`**: Contains Next.js Server Actions (e.g., `admin.ts`) that execute securely on the server and are called directly from client components.
- **`/api`**: Backend REST API routes (e.g., `/api/sync/route.ts`) which can be called by external services or the client-side for tasks like syncing Reclub data.
- **`layout.tsx`**: The root layout wrapping all pages.
- **`page.tsx`**: The main landing page / root leaderboard view.

## Notes
- We use Server Actions (`/actions`) for most form submissions and server mutations.
- The `api` directory is mainly used for endpoints that need to be accessed via standard HTTP requests (like webhooks or cron jobs).
