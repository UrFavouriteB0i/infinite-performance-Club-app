# ⚙️ `/lib` Directory

The `/lib` folder contains the core business logic, database client configurations, and utility functions of the application.

## Key Files

- **`engine.ts`**: Contains the core logic for calculating ranks, points, and updating leaderboard standings based on match results.
- **`extractor.ts`**: Logic dedicated to parsing and extracting data from external sources (e.g., Reclub session HTML/data).
- **`sync.ts`**: Coordinates the synchronization flow, using the extractor to get data and the engine to apply updates.
- **`storage.ts`**: Utilities for handling file or media storage, typically interfacing with Supabase Storage buckets.
- **`supabase.ts` / `supabase-admin.ts`**: Initialization of the Supabase clients. `supabase-admin.ts` uses the service role key for bypassing Row Level Security (RLS) during trusted server-side operations, while `supabase.ts` is for standard authenticated requests.
- **`constants.ts`**: Global configuration constants and magic numbers used across the app.
