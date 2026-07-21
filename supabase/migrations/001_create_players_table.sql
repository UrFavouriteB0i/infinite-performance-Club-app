-- 1. Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  matches INT DEFAULT 0 CHECK (matches >= 0),
  wins INT DEFAULT 0 CHECK (wins >= 0),
  losses INT DEFAULT 0 CHECK (losses >= 0),
  points INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add composite index for leaderboard queries
-- Speeds up filtering by region and sorting by points
CREATE INDEX IF NOT EXISTS idx_players_region_points 
ON players (region, points DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for public read access
CREATE POLICY "Allow public read access" 
ON players 
FOR SELECT 
USING (true);