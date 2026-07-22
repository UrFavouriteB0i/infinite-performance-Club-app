// lib/engine.ts
// Converted from engine.py
// Logic is 1:1 — no dependencies, pure math.

import { Player } from "./storage";

// ── Margin-of-Victory Multiplier ─────────────────────────────────────

const MOV_TABLE: Record<number, number> = {
  0: 0.0,   // Draw / Timed out
  1: 1.1,   // Tight win  (4-3, 3-2)
  2: 1.5,   // Solid win  (4-2, 3-1)
  3: 2.0,   // Dominant   (4-1, 3-0)
  4: 2.5,   // Shutout    (4-0)
};

function marginMultiplier(gameDiff: number): number {
  return MOV_TABLE[Math.min(Math.abs(gameDiff), 4)] ?? 2.5;
}

// ── Expected Win Probability ─────────────────────────────────────────

function expectedWin(eloTeam: number, eloOpponent: number): number {
  return 1.0 / (1.0 + Math.pow(10, (eloOpponent - eloTeam) / 400));
}

// ── Dynamic K-Factor ─────────────────────────────────────────────────

function kFactor(publicRating: number, matchesPlayed: number): number {
  if (matchesPlayed < 5) return 0.3;
  if (publicRating < 4.0) return 0.2;
  if (publicRating < 6.5) return 0.1;
  if (publicRating < 7.0) return 0.05;
  return 0.03;
}

// ── Elo → Public Rating Mapping ──────────────────────────────────────

function eloToPublic(elo: number): number {
  if (elo <= 800)  return 1.0;
  if (elo <= 1100) return 1.0  + 2.0  * ((elo - 800)  / 300);
  if (elo <= 1500) return 3.0  + 1.0  * ((elo - 1100) / 400);
  if (elo <= 2100) return 4.0  + 2.5  * ((elo - 1500) / 600);
  if (elo <= 2500) return 6.5  + 0.5  * ((elo - 2100) / 400);
  return             7.0  + 3.0  * ((elo - 2500) / 500);
}

export function publicToElo(rating: number): number {
  if (rating <= 1.0) return 800;
  if (rating <= 3.0) return 800  + ((rating - 1.0) / 2.0)  * 300;
  if (rating <= 4.0) return 1100 + ((rating - 3.0) / 1.0)  * 400;
  if (rating <= 6.5) return 1500 + ((rating - 4.0) / 2.5)  * 600;
  if (rating <= 7.0) return 2100 + ((rating - 6.5) / 0.5)  * 400;
  return               2500 + ((rating - 7.0) / 3.0)  * 500;
}

// ── Gatekeeper Post-Processing ───────────────────────────────────────

function applyGatekeepers(rawRating: number, player: Player): number {
  if (player.matches_played < 5 && rawRating >= 4.0) return 3.99;
  if (rawRating >= 7.0) {
    if (player.matches_played < 12 || player.wins_vs_620_plus < 2) {
      return Math.min(rawRating, 6.99);
    }
  }
  return rawRating;
}

// ── Match Result Type ─────────────────────────────────────────────────

export interface MatchResult {
  player_name: string;
  elo_before: number;
  elo_after: number;
  rating_before: number;
  rating_after: number;
  delta_elo: number;
  delta_rating: number;
  won: boolean;
}

// ── Core: Process a Single Match ──────────────────────────────────────

export function processMatch(
  team1: Player[],
  team2: Player[],
  score1: number,
  score2: number
): MatchResult[] {
  // Team Elo averages
  const eloT1 = team1.reduce((s, p) => s + p.elo, 0) / team1.length;
  const eloT2 = team2.reduce((s, p) => s + p.elo, 0) / team2.length;

  // Expected win probability
  const eT1 = expectedWin(eloT1, eloT2);
  const eT2 = 1.0 - eT1;

  // Actual score
  let sT1: number, sT2: number;
  if (score1 > score2)      { sT1 = 1.0; sT2 = 0.0; }
  else if (score2 > score1) { sT1 = 0.0; sT2 = 1.0; }
  else                      { sT1 = 0.5; sT2 = 0.5; }

  // Margin multiplier
  const m = marginMultiplier(Math.abs(score1 - score2));

  const results: MatchResult[] = [];

  const t2AvgRating = team2.reduce((s, p) => s + p.public_rating, 0) / team2.length;
  const t1AvgRating = team1.reduce((s, p) => s + p.public_rating, 0) / team1.length;

  for (const player of team1) {
    const result = updatePlayer(player, eT1, sT1, m, score1, score2);
    if (sT1 === 1.0 && t2AvgRating >= 6.2) player.wins_vs_620_plus += 1;
    results.push(result);
  }

  for (const player of team2) {
    const result = updatePlayer(player, eT2, sT2, m, score2, score1);
    if (sT2 === 1.0 && t1AvgRating >= 6.2) player.wins_vs_620_plus += 1;
    results.push(result);
  }

  return results;
}

function updatePlayer(
  player: Player,
  expected: number,
  actual: number,
  margin: number,
  gamesFor: number,
  gamesAgainst: number
): MatchResult {
  const eloBefore = player.elo;
  const ratingBefore = player.public_rating;

  const k = kFactor(player.public_rating, player.matches_played);
  const delta = (k * 100) * margin * (actual - expected);
  const newElo = Math.max(600, player.elo + delta);

  const rawRating = eloToPublic(newElo);
  const finalRating = applyGatekeepers(rawRating, player);

  // Mutate player in place (same as Python)
  player.elo = newElo;
  player.public_rating = Math.round(finalRating * 100) / 100;
  player.matches_played += 1;
  player.games_won += gamesFor;
  player.games_lost += gamesAgainst;

  if (actual === 1.0)      player.wins += 1;
  else if (actual === 0.0) player.losses += 1;
  else                     player.draws += 1;

  player.history.push(Math.round(finalRating * 100) / 100);

  return {
    player_name: player.name,
    elo_before: Math.round(eloBefore * 10) / 10,
    elo_after: Math.round(newElo * 10) / 10,
    rating_before: Math.round(ratingBefore * 100) / 100,
    rating_after: Math.round(finalRating * 100) / 100,
    delta_elo: Math.round((newElo - eloBefore) * 10) / 10,
    delta_rating: Math.round((finalRating - ratingBefore) * 100) / 100,
    won: actual === 1.0,
  };
}
