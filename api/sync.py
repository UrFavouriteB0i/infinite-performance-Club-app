import json
import os
from http.server import BaseHTTPRequestHandler

from engine import process_match

# Import directly from your untouched local core files!
from extractor import parse_session
from storage import Player
from supabase import Client, create_client

# Initialize Supabase Admin Client
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def load_players_from_supabase() -> dict[str, dict]:
    """Fetch all current players from Supabase into a lookup dict."""
    res = supabase.table("players").select("*").execute()
    players_by_key = {}
    for row in res.data:
        key = row["name"].strip().lower()
        players_by_key[key] = row
    return players_by_key


def db_row_to_player(row: dict) -> Player:
    """Convert Supabase DB row dict to untouched storage.Player dataclass."""
    return Player(
        name=row["name"],
        elo=row["elo"],
        public_rating=row["public_rating"],
        matches_played=row["matches_played"],
        wins=row["wins"],
        losses=row["losses"],
        draws=row["draws"],
        games_won=row["games_won"],
        games_lost=row["games_lost"],
        wins_vs_620_plus=row["wins_vs_620_plus"],
        history=row.get("history", []),
    )


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        payload = json.loads(body.decode("utf-8")) if body else {}

        url = payload.get("url")
        if not url:
            self._send_response(400, {"error": "Missing Reclub URL"})
            return

        try:
            # 1. Parse matches using untouched extractor.py
            matches = parse_session(url)
            if not matches:
                self._send_response(400, {"error": "No matches found at URL"})
                return

            # 2. Fetch existing DB players
            db_players = load_players_from_supabase()
            active_players: dict[str, Player] = {}
            session_snapshots: dict[str, dict] = {}

            # Helper to get/instantiate player
            def get_or_instantiate(name: str) -> Player:
                key = name.strip().lower()
                if key not in active_players:
                    if key in db_players:
                        active_players[key] = db_row_to_player(db_players[key])
                    else:
                        active_players[key] = Player(name=name.strip())

                    # Record session snapshot
                    p = active_players[key]
                    session_snapshots[key] = {
                        "name": p.name,
                        "old_rating": p.public_rating,
                        "session_wins": 0,
                        "session_losses": 0,
                    }
                return active_players[key]

            # 3. Process matches in order using untouched engine.py
            for m in matches:
                team1 = [get_or_instantiate(name) for name in m["team_1"]]
                team2 = [get_or_instantiate(name) for name in m["team_2"]]

                results = process_match(team1, team2, m["score_1"], m["score_2"])

                for r in results:
                    key = r.player_name.strip().lower()
                    if r.won:
                        session_snapshots[key]["session_wins"] += 1
                    else:
                        session_snapshots[key]["session_losses"] += 1

            # 4. Upsert updated ratings back to Supabase
            summary = []
            for key, p in active_players.items():
                payload = {
                    "name": p.name,
                    "elo": p.elo,
                    "public_rating": p.public_rating,
                    "matches_played": p.matches_played,
                    "wins": p.wins,
                    "losses": p.losses,
                    "draws": p.draws,
                    "games_won": p.games_won,
                    "games_lost": p.games_lost,
                    "wins_vs_620_plus": p.wins_vs_620_plus,
                    "history": p.history,
                    "updated_at": "now()",
                }

                # Upsert by unique player name
                supabase.table("players").upsert(payload, on_conflict="name").execute()

                snap = session_snapshots[key]
                delta = round(p.public_rating - snap["old_rating"], 2)
                summary.append({
                    "name": p.name,
                    "old_rating": snap["old_rating"],
                    "new_rating": p.public_rating,
                    "delta": f"+{delta:.2f}" if delta >= 0 else f"{delta:.2f}",
                    "session_record": f"{snap['session_wins']}W - {snap['session_losses']}L",
                })

            summary.sort(key=lambda x: -x["new_rating"])

            self._send_response(200, {
                "status": "success",
                "matches_processed": len(matches),
                "summary": summary,
            })

        except Exception as e:
            self._send_response(500, {"error": str(e)})

    def _send_response(self, code: int, data: dict):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))