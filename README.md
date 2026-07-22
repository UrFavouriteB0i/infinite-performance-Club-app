# iP Club Leaderboard App 🏸

A comprehensive Next.js web application for the Infinite Performance (iP) club that hosts multiple regional and national ranks for racket enthusiasts.

## 🗂️ Project Structure

To help navigate the codebase, we have included specific `README.md` files in key directories:

- [**`/app`**](./app/README.md): Next.js App Router, Pages, and API endpoints.
- [**`/components`**](./components/README.md): Reusable React UI components and layouts.
- [**`/lib`**](./lib/README.md): Core business logic, ranking engine, data extraction, and Supabase client setup.
- [**`/supabase`**](./supabase/README.md): Database migrations, schema setup, and local Supabase configuration.

## 🚀 Getting Started

First, ensure you have the required environment variables set up in your `.env.local` file (copy from `.env.example`).

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS
- **Database / Backend:** [Supabase](https://supabase.com/)
- **Deployment:** Vercel

## 📖 Learn More
Check out the `README.md` in each subdirectory to learn more about specific sections of this project!
