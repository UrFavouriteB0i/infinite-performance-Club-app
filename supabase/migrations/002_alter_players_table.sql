BEGIN;

-- 1. Drop old index first
DROP INDEX IF EXISTS public.idx_players_region_points;

-- 2. Drop and Add columns
ALTER TABLE public.players
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS points,
  DROP COLUMN IF EXISTS created_at,
  ADD COLUMN IF NOT EXISTS elo DOUBLE PRECISION DEFAULT 1100.0,
  ADD COLUMN IF NOT EXISTS public_rating DOUBLE PRECISION DEFAULT 3.00,
  ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS games_won INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS games_lost INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wins_vs_620_plus INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- 3. Rename columns (Must be a separate statement)
ALTER TABLE public.players 
  RENAME COLUMN matches TO matches_played;

-- 4. Clean up duplicate names to prevent UNIQUE constraint failure
UPDATE public.players p
SET name = p.name || '_' || substr(gen_random_uuid()::text, 1, 4)
WHERE p.id IN (
    SELECT id FROM (
        SELECT id, row_number() OVER (PARTITION BY name ORDER BY updated_at DESC) as rn
        FROM public.players
    ) t WHERE t.rn > 1
);

-- 5. Apply the unique constraint
ALTER TABLE public.players 
  DROP CONSTRAINT IF EXISTS players_name_key,
  ADD CONSTRAINT players_name_key UNIQUE (name);

-- 6. Create the new leaderboard sorting index
CREATE INDEX IF NOT EXISTS idx_players_rating 
ON public.players (public_rating DESC);

-- 7. Force Supabase to reload its API schema cache immediately
NOTIFY pgrst, 'reload schema';

COMMIT;
