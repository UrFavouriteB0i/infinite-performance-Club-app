# storage.py
"""
Player data persistence — JSON-backed store for ratings, match history,
and gatekeeper metadata.
"""

import json
import os
from dataclasses import asdict, dataclass, field
from typing import Optional

DEFAULT_ELO = 1100
DEFAULT_PUBLIC_RATING = 2.50
DB_PATH = "players.json"


@dataclass
class Player:
    name: str
    elo: float = DEFAULT_ELO
    public_rating: float = DEFAULT_PUBLIC_RATING
    matches_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    games_won: int = 0
    games_lost: int = 0
    wins_vs_620_plus: int = 0  # gatekeeper: wins against opponents rated >= 6.20
    history: list = field(default_factory=list)  # last N rating snapshots

    @property
    def win_rate(self) -> float:
        return self.wins / self.matches_played if self.matches_played > 0 else 0.0


class PlayerStore:
    """Simple JSON-file-backed player database."""

    def __init__(self, path: str = DB_PATH):
        self.path = path
        self._players: dict[str, Player] = {}
        self._load()

    # ── Public API ───────────────────────────────────────────────

    def get_or_create(self, name: str) -> Player:
        """Get existing player or create a new one with default rating."""
        key = name.strip().lower()
        if key not in self._players:
            self._players[key] = Player(name=name.strip())
        return self._players[key]

    def get(self, name: str) -> Optional[Player]:
        return self._players.get(name.strip().lower())

    def all_players(self) -> list[Player]:
        return sorted(
            self._players.values(),
            key=lambda p: -p.public_rating,
        )

    def save(self):
        data = {k: asdict(v) for k, v in self._players.items()}
        with open(self.path, "w") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # ── Leaderboard views ────────────────────────────────────────

    def leaderboard(self, tier: str = "all") -> list[Player]:
        players = self.all_players()
        if tier == "beginner":
            return [p for p in players if p.public_rating < 4.00]
        elif tier == "intermediate":
            return [p for p in players if 4.00 <= p.public_rating < 7.00]
        elif tier == "advanced":
            return [p for p in players if p.public_rating >= 7.00]
        return players

    # ── Internal ─────────────────────────────────────────────────

    def _load(self):
        if not os.path.exists(self.path):
            return
        try:
            with open(self.path, "r") as f:
                data = json.load(f)
            for key, vals in data.items():
                self._players[key] = Player(**vals)
        except (json.JSONDecodeError, TypeError):
            pass  # start fresh on corrupt file
