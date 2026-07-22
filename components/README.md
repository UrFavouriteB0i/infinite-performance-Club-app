# 🧩 `/components` Directory

This directory contains all the reusable React UI components used across the application.

By keeping components modular here, we ensure our `/app` pages remain clean and focused on data-fetching and layout logic.

## Best Practices
- **Server vs Client Components:** By default, components in the App Router are Server Components. If a component requires interactivity (e.g., `useState`, `onClick`), ensure it has the `"use client";` directive at the top of the file.
- **Styling:** Components should be styled using Tailwind CSS classes.
