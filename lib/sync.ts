import { supabaseAdmin } from "@/lib/supabase-admin";
import { parseSession } from "@/lib/extractor";
import { processMatch } from "@/lib/engine";
import { Player, createPlayer } from "@/lib/storage";

const REGIONS = [
  { code: "TGR", name: "Tangerang" },
  { code: "JKT", name: "DKI Jakarta" },
  { code: "BGR", name: "Bogor" },
  { code: "BKS", name: "Bekasi" },
  { code: "DPK", name: "Depok" },
];

// ── Load players from Supabase ────────────────────────────────────────

async function loadPlayersFromSupabase(): Promise<Record<string, Record<string, unknown>>> {
  const { data, error } = await supabaseAdmin.from("players").select("*");
  if (error) throw new Error(`Supabase fetch error: ${error.message}`);

  const playersByKey: Record<string, Record<string, unknown>> = {};
  for (const row of data ?? []) {
    const key = (row.name as string).trim().toLowerCase();
    playersByKey[key] = row;
  }
  return playersByKey;
}

function dbRowToPlayer(row: Record<string, unknown>): Player {
  return createPlayer(row.name as string, {
    elo: row.elo as number,
    public_rating: row.public_rating as number,
    matches_played: row.matches_played as number,
    wins: row.wins as number,
    losses: row.losses as number,
    draws: row.draws as number,
    games_won: row.games_won as number,
    games_lost: row.games_lost as number,
    wins_vs_620_plus: row.wins_vs_620_plus as number,
    history: (row.history as number[]) ?? [],
  });
}

async function linkDuplicationCheck(linkCode: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("link_extractions")
    .select("link_code")
    .eq("link_code", linkCode)
    .maybeSingle();

  if (error) {
    throw new Error(`Link extraction check failed: ${error.message}`);
  }

  if (data) {
    throw new Error("This Reclub session has already been imported.");
  }
}

// ── Core Sync Logic ──────────────────────────────────────────────────────

export async function processSyncLogic(url: string, region: string) {
  if (!url || !region) {
    throw new Error("Missing Reclub URL or Region");
  }

  const match = url.match(/[?&]m=([A-Za-z0-9]+)/);
  if (!match) {
      throw new Error("Invalid Reclub URL.");
  }
  const linkCode = match[1];

  await linkDuplicationCheck(linkCode);

  // 1. Parse matches
  const matches = await parseSession(url);
  if (!matches.length) {
    throw new Error("No matches found at URL");
  }

  // 2. Fetch existing DB players
  const dbPlayers = await loadPlayersFromSupabase();
  const activePlayers: Record<string, Player> = {};
  const sessionSnapshots: Record<string, {
    name: string;
    old_rating: number;
    session_wins: number;
    session_losses: number;
  }> = {};

  // Helper: get or instantiate player
  function getOrInstantiate(name: string): Player {
    const key = name.trim().toLowerCase();
    if (!(key in activePlayers)) {
      activePlayers[key] = key in dbPlayers
        ? dbRowToPlayer(dbPlayers[key])
        : createPlayer(name);

      const p = activePlayers[key];
      sessionSnapshots[key] = {
        name: p.name,
        old_rating: p.public_rating,
        session_wins: 0,
        session_losses: 0,
      };
    }
    return activePlayers[key];
  }

  // 3. Process matches in order
  for (const m of matches) {
    const team1 = m.team_1.map(getOrInstantiate);
    const team2 = m.team_2.map(getOrInstantiate);

    const results = processMatch(team1, team2, m.score_1, m.score_2);

    for (const r of results) {
      const key = r.player_name.trim().toLowerCase();
      if (r.won) sessionSnapshots[key].session_wins += 1;
      else        sessionSnapshots[key].session_losses += 1;
    }
  }

  // 4. Upsert updated ratings back to Supabase
  const summary = [];

  for (const [key, p] of Object.entries(activePlayers)) {
    const upsertPayload = {
      name: p.name,
      region: region,
      elo: p.elo,
      public_rating: p.public_rating,
      matches_played: p.matches_played,
      wins: p.wins,
      losses: p.losses,
      draws: p.draws,
      games_won: p.games_won,
      games_lost: p.games_lost,
      wins_vs_620_plus: p.wins_vs_620_plus,
      history: p.history,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("players")
      .upsert(upsertPayload, { onConflict: "name" });

    if (error) throw new Error(`Supabase upsert error: ${error.message}`);

    const snap = sessionSnapshots[key];
    const delta = Math.round((p.public_rating - snap.old_rating) * 100) / 100;
    summary.push({
      name: p.name,
      old_rating: snap.old_rating,
      new_rating: p.public_rating,
      delta: delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2),
      session_record: `${snap.session_wins}W - ${snap.session_losses}L`,
    });
  }

  summary.sort((a, b) => b.new_rating - a.new_rating);

  const { error: linkInsertError } = await supabaseAdmin
    .from("link_extractions")
    .insert({
      link_code: linkCode,
      region,
      imported_at: new Date().toISOString(),
      matches_processed: matches.length,
  });

  if (linkInsertError) {
    throw new Error(`Failed to record imported session: ${linkInsertError.message}`);
  }

  return {
    status: "success",
    matches_processed: matches.length,
    summary,
  };
}
