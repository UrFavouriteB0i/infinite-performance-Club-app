# extractor.py
"""
Reclub scoresheet parser — fetches and parses doubles match results.
Designed as a module: import parse_session() or run standalone for testing.
"""

import re
import sys
from collections import defaultdict

import requests
from bs4 import BeautifulSoup, Tag


def fetch_html(url: str) -> str:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/126.0.0.0 Safari/537.36"
        )
    }
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    return resp.text


def parse_matches(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    matches = _try_structured_parse(soup)
    if matches:
        return matches
    return _flat_text_parse(soup)


def parse_session(url: str) -> list[dict]:
    """Convenience: fetch + parse in one call."""
    return parse_matches(fetch_html(url))


# ── Structured DOM parse ─────────────────────────────────────────────

def _try_structured_parse(soup: BeautifulSoup) -> list[dict]:
    matches = []
    round_markers = soup.find_all(string=re.compile(r"^\s*Round\s*$", re.I))

    for marker in round_markers:
        card = _find_card_ancestor(marker)
        if card is None:
            continue
        tokens = [t.strip() for t in card.stripped_strings if t.strip()]
        match = _extract_match_from_tokens(tokens)
        if match:
            match["match_id"] = f"R{match.pop('round', '?')}"
            matches.append(match)
    return matches


def _find_card_ancestor(node, max_depth: int = 5) -> Tag | None:
    current = node.parent
    for _ in range(max_depth):
        if current is None or current.name == "body":
            return None
        texts = list(current.stripped_strings)
        digit_count = sum(1 for t in texts if re.fullmatch(r"\d+", t))
        if digit_count >= 2 and any("Round" in t for t in texts):
            return current
        current = current.parent
    return None


def _extract_match_from_tokens(tokens: list[str]) -> dict | None:
    merged = []
    i = 0
    while i < len(tokens):
        if tokens[i].lower() == "court" and i + 1 < len(tokens) and tokens[i + 1].isdigit():
            merged.append(f"Court {tokens[i + 1]}")
            i += 2
        else:
            merged.append(tokens[i])
            i += 1
    tokens = merged

    round_num = None
    start_idx = 0
    for i, t in enumerate(tokens):
        if t.lower() == "round" and i + 1 < len(tokens) and tokens[i + 1].isdigit():
            round_num = int(tokens[i + 1])
            start_idx = i + 2
            break

    if start_idx < len(tokens) and tokens[start_idx].lower().startswith("court"):
        start_idx += 1

    remaining = tokens[start_idx:]
    segments = []
    current_names = []
    for t in remaining:
        if re.fullmatch(r"\d+", t):
            if current_names:
                segments.append((current_names, int(t)))
                current_names = []
        else:
            current_names.append(t)

    if len(segments) < 2:
        return None

    team1_players, score1 = segments[0]
    team2_players, score2 = segments[1]
    if not team1_players or not team2_players:
        return None

    return {
        "round": round_num,
        "team_1": team1_players,
        "team_2": team2_players,
        "score_1": score1,
        "score_2": score2,
        "winner_team": 1 if score1 > score2 else (2 if score2 > score1 else 0),
    }


# ── Flat-text fallback parse ─────────────────────────────────────────

def _flat_text_parse(soup: BeautifulSoup) -> list[dict]:
    all_text = list(soup.stripped_strings)
    matches = []
    i = 0
    while i < len(all_text):
        if all_text[i].lower() == "round":
            window = all_text[i : i + 12]
            match = _extract_match_from_tokens(window)
            if match:
                match["match_id"] = f"R{match.pop('round', '?')}"
                matches.append(match)
                i += 8
                continue
        i += 1
    return matches


# ── Standalone test ──────────────────────────────────────────────────

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://api.reclub.co/export/score-sheets?m=7BNX41"
    print(f"Fetching: {url}\n")
    matches = parse_session(url)

    if not matches:
        print("⚠  No matches found.")
    else:
        print(f"Parsed {len(matches)} matches:\n")
        for m in matches:
            t1 = " & ".join(m["team_1"])
            t2 = " & ".join(m["team_2"])
            w = "←" if m["winner_team"] == 1 else ("→" if m["winner_team"] == 2 else "=")
            print(f"  {m['match_id']:>4s}  {t1:<25s} {m['score_1']} {w} {m['score_2']}  {t2}")
