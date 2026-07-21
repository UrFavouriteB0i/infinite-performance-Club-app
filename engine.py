# engine.py
"""
Elo rating engine for doubles tennis (Fast4 format).

Implements:
  - Team Elo averaging
  - Logistic expected-win probability
  - Margin-of-victory multiplier (Fast4)
  - Dynamic K-factor decay
  - Piecewise Elo → public rating mapping
  - Gatekeeper post-processing (safe-zone caps)
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from storage import Player

# ── Margin-of-Victory Multiplier ─────────────────────────────────────

MOV_TABLE: dict[int, float] = {
    0: 0.00,   # Draw / Timed out
    1: 1.10,   # Tight win  (4-3, 3-2)
    2: 1.50,   # Solid win  (4-2, 3-1)
    3: 2.00,   # Dominant   (4-1, 3-0)
    4: 2.50,   # Shutout    (4-0)
}


def margin_multiplier(game_diff: int) -> float:
    """Fast4 margin-of-victory multiplier M."""
    return MOV_TABLE.get(min(abs(game_diff), 4), 2.50)


# ── Expected Win Probability ─────────────────────────────────────────

def expected_win(elo_team: float, elo_opponent: float) -> float:
    """Standard logistic expected score."""
    return 1.0 / (1.0 + math.pow(10, (elo_opponent - elo_team) / 400))


# ── Dynamic K-Factor ─────────────────────────────────────────────────

def k_factor(public_rating: float, matches_played: int) -> float:
    """
    K scales down with experience and rating:
      - Provisional (< 5 matches):  0.30
      - Beginner   (< 4.00):        0.20
      - Intermediate (4.00–6.49):    0.10
      - The Wall   (6.50–6.99):      0.05
      - Advanced   (>= 7.00):        0.03
    """
    if matches_played < 5:
        return 0.30
    if public_rating < 4.00:
        return 0.20
    if public_rating < 6.50:
        return 0.10
    if public_rating < 7.00:
        return 0.05
    return 0.03


# ── Elo → Public Rating Mapping ─────────────────────────────────────

def elo_to_public(elo: float) -> float:
    """Piecewise linear mapping from internal Elo to 1.00–10.00 scale."""
    if elo <= 800:
        return 1.00
    elif elo <= 1100:
        return 1.00 + 2.00 * ((elo - 800) / 300)
    elif elo <= 1500:
        return 3.00 + 1.00 * ((elo - 1100) / 400)
    elif elo <= 2100:
        return 4.00 + 2.50 * ((elo - 1500) / 600)
    elif elo <= 2500:
        return 6.50 + 0.50 * ((elo - 2100) / 400)
    else:
        return 7.00 + 3.00 * ((elo - 2500) / 500)


def public_to_elo(rating: float) -> float:
    """Inverse mapping: public rating → approximate Elo."""
    if rating <= 1.00:
        return 800
    elif rating <= 3.00:
        return 800 + (rating - 1.00) / 2.00 * 300
    elif rating <= 4.00:
        return 1100 + (rating - 3.00) / 1.00 * 400
    elif rating <= 6.50:
        return 1500 + (rating - 4.00) / 2.50 * 600
    elif rating <= 7.00:
        return 2100 + (rating - 6.50) / 0.50 * 400
    else:
        return 2500 + (rating - 7.00) / 3.00 * 500


# ── Gatekeeper Post-Processing ───────────────────────────────────────

def apply_gatekeepers(raw_rating: float, player: Player) -> float:
    """
    Enforce safe-zone caps:
      - Cannot cross 4.00 with fewer than 5 matches
      - Cannot cross 7.00 without 12 matches AND 2 wins vs 6.20+ opponents
    """
    if player.matches_played < 5 and raw_rating >= 4.00:
        return 3.99
    if raw_rating >= 7.00:
        if player.matches_played < 12 or player.wins_vs_620_plus < 2:
            return min(raw_rating, 6.99)
    return raw_rating


# ── Core: Process a Single Match ─────────────────────────────────────

@dataclass
class MatchResult:
    """Snapshot of a single player's rating change from one match."""
    player_name: str
    elo_before: float
    elo_after: float
    rating_before: float
    rating_after: float
    delta_elo: float
    delta_rating: float
    won: bool


def process_match(
    team1: list[Player],
    team2: list[Player],
    score1: int,
    score2: int,
) -> list[MatchResult]:
    """
    Process one doubles match. Updates player objects in-place
    and returns per-player result snapshots.

    Args:
        team1:  list of Player objects [P1, P2]
        team2:  list of Player objects [P3, P4]
        score1: games won by team 1
        score2: games won by team 2
    """
    # Team Elo averages
    elo_t1 = sum(p.elo for p in team1) / len(team1)
    elo_t2 = sum(p.elo for p in team2) / len(team2)

    # Expected win probability
    e_t1 = expected_win(elo_t1, elo_t2)
    e_t2 = 1.0 - e_t1

    # Actual score S
    if score1 > score2:
        s_t1, s_t2 = 1.0, 0.0
    elif score2 > score1:
        s_t1, s_t2 = 0.0, 1.0
    else:
        s_t1, s_t2 = 0.5, 0.5

    # Margin multiplier
    game_diff = abs(score1 - score2)
    m = margin_multiplier(game_diff)

    results = []

    # Check opponent ratings for gatekeeper tracking
    t2_avg_rating = sum(p.public_rating for p in team2) / len(team2)
    t1_avg_rating = sum(p.public_rating for p in team1) / len(team1)

    # Update each player individually
    for player in team1:
        result = _update_player(player, e_t1, s_t1, m, score1, score2)
        # Track wins vs 6.20+ opponents
        if s_t1 == 1.0 and t2_avg_rating >= 6.20:
            player.wins_vs_620_plus += 1
        results.append(result)

    for player in team2:
        result = _update_player(player, e_t2, s_t2, m, score2, score1)
        if s_t2 == 1.0 and t1_avg_rating >= 6.20:
            player.wins_vs_620_plus += 1
        results.append(result)

    return results


def _update_player(
    player: Player,
    expected: float,
    actual: float,
    margin: float,
    games_for: int,
    games_against: int,
) -> MatchResult:
    """Apply Elo adjustment to a single player. Mutates player in-place."""
    elo_before = player.elo
    rating_before = player.public_rating

    # K-factor based on current state
    k = k_factor(player.public_rating, player.matches_played)

    # Elo delta:  ΔElo = (K × 100) × M × (S − E)
    delta = (k * 100) * margin * (actual - expected)
    new_elo = max(600, player.elo + delta)

    # Map to public rating
    raw_rating = elo_to_public(new_elo)
    final_rating = apply_gatekeepers(raw_rating, player)

    # Update player state
    player.elo = new_elo
    player.public_rating = round(final_rating, 2)
    player.matches_played += 1
    player.games_won += games_for
    player.games_lost += games_against

    if actual == 1.0:
        player.wins += 1
    elif actual == 0.0:
        player.losses += 1
    else:
        player.draws += 1

    player.history.append(round(final_rating, 2))

    won = actual == 1.0

    return MatchResult(
        player_name=player.name,
        elo_before=round(elo_before, 1),
        elo_after=round(new_elo, 1),
        rating_before=round(rating_before, 2),
        rating_after=round(final_rating, 2),
        delta_elo=round(new_elo - elo_before, 1),
        delta_rating=round(final_rating - rating_before, 2),
        won=won,
    )
