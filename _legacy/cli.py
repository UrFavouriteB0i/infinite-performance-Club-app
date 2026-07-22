# cli.py
"""
Main entry point — processes a Reclub session URL and updates the leaderboard.

Usage:
    python cli.py <reclub_url>          # process a session
    python cli.py --leaderboard         # show current leaderboard
    python cli.py --leaderboard beginner
    python cli.py --player "Theo"       # show one player's history
"""

import sys

from extractor import parse_session
from engine import process_match
from storage import PlayerStore


def process_session(url: str, store: PlayerStore):
    """Fetch matches from URL, run through Elo engine, save results."""
    matches = parse_session(url)

    if not matches:
        print("⚠  No matches found at that URL.")
        return

    print(f"{'=' * 70}")
    print(f" ⚡ PROCESSING SESSION ({len(matches)} Matches)")
    print(f"{'=' * 70}\n")

    # Snapshot old ratings for the session delta report
    session_players: dict[str, dict] = {}
    all_results = []

    for m in matches:
        # Resolve players from store (creates new if first time)
        team1 = [store.get_or_create(name) for name in m["team_1"]]
        team2 = [store.get_or_create(name) for name in m["team_2"]]

        # Snapshot pre-match ratings for players we haven't seen yet this session
        for p in team1 + team2:
            key = p.name.strip().lower()
            if key not in session_players:
                session_players[key] = {
                    "name": p.name,
                    "old_rating": p.public_rating,
                    "old_elo": p.elo,
                    "session_wins": 0,
                    "session_losses": 0,
                }

        # Run the engine
        results = process_match(team1, team2, m["score_1"], m["score_2"])
        all_results.extend(results)

        # Track session W/L
        for r in results:
            key = r.player_name.strip().lower()
            if r.won:
                session_players[key]["session_wins"] += 1
            else:
                session_players[key]["session_losses"] += 1

        # Print per-match detail
        t1_names = " & ".join(m["team_1"])
        t2_names = " & ".join(m["team_2"])
        arrow = "←" if m["winner_team"] == 1 else ("→" if m["winner_team"] == 2 else "=")
        print(f"  {m['match_id']:>4s}  {t1_names:<25s} {m['score_1']} {arrow} {m['score_2']}  {t2_names}")

    # Save updated ratings
    store.save()

    # Session summary
    print(f"\n{'=' * 70}")
    print(f" ⚡ SESSION PROCESSED SUCCESSFULLY ({len(matches)} Matches)")
    print(f"{'=' * 70}")
    print(f" {'Player':<18s} {'Old':>6s}  {'New':>6s}  {'Δ':>8s}  {'Session W-L':>12s}")
    print(f" {'─' * 18} {'─' * 6}  {'─' * 6}  {'─' * 8}  {'─' * 12}")

    # Sort by new rating descending
    summary = sorted(
        session_players.values(),
        key=lambda s: -(store.get_or_create(s["name"]).public_rating),
    )
    for s in summary:
        p = store.get_or_create(s["name"])
        delta = p.public_rating - s["old_rating"]
        arrow = "▲" if delta > 0 else ("▼" if delta < 0 else "─")
        sign = "+" if delta >= 0 else ""
        wl = f"{s['session_wins']}W - {s['session_losses']}L"
        print(
            f" {s['name']:<18s} {s['old_rating']:>6.2f}  {p.public_rating:>6.2f}  "
            f"{arrow} {sign}{delta:.2f}  {wl:>12s}"
        )

    print(f"{'─' * 70}")
    print(f" [ ✓ CLOSE & REFRESH LEADERBOARD ]\n")


def show_leaderboard(store: PlayerStore, tier: str = "all"):
    """Display the current leaderboard."""
    players = store.leaderboard(tier)

    if not players:
        print(f"No players found in tier: {tier}")
        return

    tier_label = tier.upper() if tier != "all" else "ALL PLAYERS"
    print(f"\n{'=' * 70}")
    print(f" 🏆 LEADERBOARD — {tier_label}")
    print(f"{'=' * 70}")
    print(f" {'#':>3s}  {'Player':<18s} {'Rating':>6s}  {'Elo':>6s}  {'MP':>3s}  {'W':>3s}  {'L':>3s}  {'WR':>5s}")
    print(f" {'─' * 3}  {'─' * 18} {'─' * 6}  {'─' * 6}  {'─' * 3}  {'─' * 3}  {'─' * 3}  {'─' * 5}")

    for rank, p in enumerate(players, 1):
        wr = f"{p.win_rate * 100:.0f}%"
        print(
            f" {rank:>3d}  {p.name:<18s} {p.public_rating:>6.2f}  {p.elo:>6.0f}  "
            f"{p.matches_played:>3d}  {p.wins:>3d}  {p.losses:>3d}  {wr:>5s}"
        )

    print(f"{'─' * 70}\n")


def show_player(store: PlayerStore, name: str):
    """Show a single player's details."""
    p = store.get(name)
    if p is None:
        print(f"Player '{name}' not found.")
        return

    gd = p.games_won - p.games_lost
    print(f"\n  Player:          {p.name}")
    print(f"  Public Rating:   {p.public_rating:.2f}")
    print(f"  Internal Elo:    {p.elo:.0f}")
    print(f"  Matches Played:  {p.matches_played}")
    print(f"  Record:          {p.wins}W - {p.losses}L - {p.draws}D")
    print(f"  Games:           {p.games_won} won / {p.games_lost} lost (GD: {gd:+d})")
    print(f"  Win Rate:        {p.win_rate * 100:.1f}%")
    print(f"  Wins vs 6.20+:   {p.wins_vs_620_plus}")
    if p.history:
        trend = " → ".join(f"{r:.2f}" for r in p.history[-8:])
        print(f"  Rating History:  {trend}")
    print()


def main():
    store = PlayerStore()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python cli.py <reclub_url>              Process a session")
        print("  python cli.py --leaderboard [tier]      Show leaderboard")
        print('  python cli.py --player "Name"           Show player details')
        return

    arg = sys.argv[1]

    if arg == "--leaderboard":
        tier = sys.argv[2] if len(sys.argv) > 2 else "all"
        show_leaderboard(store, tier)
    elif arg == "--player":
        name = sys.argv[2] if len(sys.argv) > 2 else ""
        show_player(store, name)
    elif arg.startswith("http"):
        process_session(arg, store)
    else:
        print(f"Unknown argument: {arg}")


if __name__ == "__main__":
    main()
