// lib/storage.ts
// Converted from storage.py
// PlayerStore removed — persistence handled by Supabase in route.ts

export const DEFAULT_ELO = 1100;
export const DEFAULT_PUBLIC_RATING = 2.5;

export interface Player {
  name: string;
  elo: number;
  public_rating: number;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  games_won: number;
  games_lost: number;
  wins_vs_620_plus: number;
  history: number[];
}

export function createPlayer(name: string, overrides: Partial<Player> = {}): Player {
  return {
    name: name.trim(),
    elo: DEFAULT_ELO,
    public_rating: DEFAULT_PUBLIC_RATING,
    matches_played: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    games_won: 0,
    games_lost: 0,
    wins_vs_620_plus: 0,
    history: [],
    ...overrides,
  };
}

export function winRate(player: Player): number {
  return player.matches_played > 0 ? player.wins / player.matches_played : 0;
}
