# 🗄️ `/supabase` Directory

This folder contains configurations and migrations for our Supabase backend.

## Structure

- **`/migrations`**: Contains SQL migration files that define the database schema, tables, Row Level Security (RLS) policies, and triggers. These files ensure our database structure is version-controlled and reproducible.

## Managing the Database

To apply migrations or manage your local Supabase instance, use the Supabase CLI:

```bash
# Start local supabase services
supabase start

# Create a new migration file
supabase migration new migration_name

# Apply migrations to local db
supabase db reset
```

Always ensure database schema changes are captured in a migration file rather than being applied manually in the Supabase Dashboard.
