import * as cheerio from "cheerio";
import { AnyNode, Element, Text } from "domhandler";

export interface Match {
  match_id: string;
  team_1: string[];
  team_2: string[];
  score_1: number;
  score_2: number;
  winner_team: 0 | 1 | 2;
}

// ── Fetch ─────────────────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) " +
        "Chrome/126.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.text();
}

// ── Public API ────────────────────────────────────────────────────────

export async function parseSession(url: string): Promise<Match[]> {
  const html = await fetchHtml(url);
  return parseMatches(html);
}

export function parseMatches(html: string): Match[] {
  const $ = cheerio.load(html);
  const matches = tryStructuredParse($);
  if (matches.length > 0) return matches;
  return flatTextParse($);
}

// ── Structured DOM parse ──────────────────────────────────────────────

function tryStructuredParse($: cheerio.CheerioAPI): Match[] {
  const matches: Match[] = [];

  // Find all text nodes containing "Round"
  $("*").contents().each((_, node) => {
    if (node.type !== "text") return;
    if (!/^\s*Round\s*$/i.test(node.data ?? "")) return;

    const card = findCardAncestor($, node as AnyNode);
    if (!card) return;

    const tokens = getStrippedStrings($, card);
    const match = extractMatchFromTokens(tokens);
    if (match) {
      const round = match.round;
      delete (match as any).round;
      matches.push({ ...match, match_id: `R${round ?? "?"}` } as Match);
    }
  });

  return matches;
}

function findCardAncestor(
  $: cheerio.CheerioAPI,
  node: AnyNode,
  maxDepth = 5
): Element | null {
  let current = node.parent as Element | null;

  for (let i = 0; i < maxDepth; i++) {
    if (!current || (current.type !== "tag" && current.type !== "script" && current.type !== "style")) return null;
    if (current.name === "body") return null;

    const texts = getStrippedStrings($, current);
    const digitCount = texts.filter((t) => /^\d+$/.test(t)).length;
    if (digitCount >= 2 && texts.some((t) => t.includes("Round"))) {
      return current;
    }
    current = current.parent as Element | null;
  }

  return null;
}

function getStrippedStrings($: cheerio.CheerioAPI, el: AnyNode): string[] {
  const results: string[] = [];
  $(el)
    .contents()
    .each(function collectText(_: number, node: AnyNode) {
      if (node.type === "text") {
        const text = (node as Text).data?.trim();
        if (text) results.push(text);
      } else if (node.type === "tag" || node.type === "script" || node.type === "style") {
        $(node)
          .contents()
          .each(function (this: AnyNode, i: number, child: AnyNode) {
            collectText.call(this, i, child);
          });
      }
    });
  return results;
}

// ── Token parsing (shared between structured + flat) ──────────────────

interface RawMatch {
  round?: number;
  team_1: string[];
  team_2: string[];
  score_1: number;
  score_2: number;
  winner_team: 0 | 1 | 2;
}

function extractMatchFromTokens(tokens: string[]): RawMatch | null {
  // Merge "Court" + digit tokens
  const merged: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    if (
      tokens[i].toLowerCase() === "court" &&
      i + 1 < tokens.length &&
      /^\d+$/.test(tokens[i + 1])
    ) {
      merged.push(`Court ${tokens[i + 1]}`);
      i += 2;
    } else {
      merged.push(tokens[i]);
      i++;
    }
  }
  tokens = merged;

  let roundNum: number | undefined;
  let startIdx = 0;

  for (let j = 0; j < tokens.length; j++) {
    if (
      tokens[j].toLowerCase() === "round" &&
      j + 1 < tokens.length &&
      /^\d+$/.test(tokens[j + 1])
    ) {
      roundNum = parseInt(tokens[j + 1], 10);
      startIdx = j + 2;
      break;
    }
  }

  if (startIdx < tokens.length && tokens[startIdx].toLowerCase().startsWith("court")) {
    startIdx++;
  }

  const remaining = tokens.slice(startIdx);
  const segments: [string[], number][] = [];
  let currentNames: string[] = [];

  for (const t of remaining) {
    if (/^\d+$/.test(t)) {
      if (currentNames.length > 0) {
        segments.push([currentNames, parseInt(t, 10)]);
        currentNames = [];
      }
    } else {
      currentNames.push(t);
    }
  }

  if (segments.length < 2) return null;

  const [team1Players, score1] = segments[0];
  const [team2Players, score2] = segments[1];

  if (!team1Players.length || !team2Players.length) return null;

  return {
    round: roundNum,
    team_1: team1Players,
    team_2: team2Players,
    score_1: score1,
    score_2: score2,
    winner_team: score1 > score2 ? 1 : score2 > score1 ? 2 : 0,
  };
}

// ── Flat-text fallback parse ──────────────────────────────────────────

function flatTextParse($: cheerio.CheerioAPI): Match[] {
  const allText: string[] = [];
  $("*")
    .contents()
    .each((_, node) => {
      if (node.type === "text") {
        const t = (node as Text).data?.trim();
        if (t) allText.push(t);
      }
    });

  const matches: Match[] = [];
  let i = 0;

  while (i < allText.length) {
    if (allText[i].toLowerCase() === "round") {
      const window = allText.slice(i, i + 12);
      const match = extractMatchFromTokens(window);
      if (match) {
        const round = match.round;
        delete (match as any).round;
        matches.push({ ...match, match_id: `R${round ?? "?"}` } as Match);
        i += 8;
        continue;
      }
    }
    i++;
  }

  return matches;
}
