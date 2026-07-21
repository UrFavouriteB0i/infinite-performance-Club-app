"use client";

export interface Player {
  id?: string;
  name: string;
  region?: string;
  matches_played: number;
  wins: number;
  losses: number;
  draws?: number;
  games_won?: number;
  games_lost?: number;
  wins_vs_620_plus?: number;
  public_rating: number;
  elo?: number;
  history: number[];
}

export const VerifiedBadge = () => (
  <span className="verified-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

interface PlayerCardProps {
  player: Player;
  rank: number;
  isTop3: boolean;
  animationIndex: number;
}

export default function PlayerCard({ player, rank, isTop3, animationIndex }: PlayerCardProps) {
  // Calculate Delta based on the last two entries in history
  const history = player.history || [];
  let delta = 0;
  
  if (history.length >= 2) {
    delta = history[history.length - 1] - history[history.length - 2];
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  
  // Format precisely as requested (e.g., "▲ +0.52" or "▼ -0.24")
  // Note: .toFixed(2) on a negative number automatically includes the "-" sign
  const formattedDelta = isPositive 
    ? `▲ +${delta.toFixed(2)}` 
    : isNegative 
    ? `▼ ${delta.toFixed(2)}` 
    : `- 0.00`;
    
  const deltaColor = isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-gray-500";

  if (isTop3) {
    const glowClass = rank === 1 ? "glow-gold" : rank === 2 ? "glow-silver" : "glow-bronze";
    const pointColor = rank === 1 ? "var(--gold)" : rank === 2 ? "var(--silver)" : "var(--bronze)";

    return (
      <div className={`lb-card lb-card-top3 ${glowClass} fade-up px-3.5 sm:px-5 py-3`} style={{ animationDelay: `${animationIndex * 40}ms` }}>
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          <div className={`rank-badge rank-lg rank-${rank} shrink-0`}>{rank}</div>
          <div className="flex-1 min-w-0 px-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
              <span className="font-heading font-bold text-sm sm:text-base truncate block" style={{ color: "var(--text-primary)" }}>
                {player.name}
              </span>
              <VerifiedBadge />
            </div>
            {player.region && (
              <span className="text-[11px] sm:text-xs block" style={{ color: "var(--text-muted)" }}>{player.region}</span>
            )}
          </div>
          
          {/* Desktop Top 3 */}
          <div className="hidden sm:flex items-center shrink-0">
            {/* Delta */}
            <div className="w-16 text-center">
                <span className={`text-xs font-bold ${deltaColor}`}>{formattedDelta}</span>
            </div>

            {/* Matches */}
            <div className="w-20 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Matches</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{player.matches_played}</p>
            </div>

            {/* W/L */}
            <div className="w-20 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>W/L</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{player.wins}-{player.losses}</p>
            </div>

            {/* Rating */}
            <div className="w-24 text-center">
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-muted)" }}>Rating</p>
                <p className="text-base font-extrabold" style={{ color: pointColor }}>{player.public_rating.toFixed(2)}</p>
            </div>
            </div>
          
          {/* Mobile Top 3 */}
          <div className="sm:hidden shrink-0">
                <div className="flex items-center gap-5">
                    {/* Delta */}
                    <div className="w-14 text-center">
                        <span className={`text-[10px] font-bold ${deltaColor}`}>{formattedDelta}</span>
                    </div>
                    {/* Matches */}
                    <div className="w-12 text-center">
                        <p className="text-[8px] uppercase" style={{ color: "var(--text-muted)" }}>Matches</p>
                        <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{player.matches_played}</p>
                    </div>
                    {/* W/L */}
                    <div className="w-12 text-center">
                        <p className="text-[8px] uppercase" style={{ color: "var(--text-muted)" }}>W/L</p>
                        <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>{player.wins}-{player.losses}</p>
                    </div>
                    {/* Rating */}
                    <div className="w-14 text-center">
                        <p className="text-[8px] uppercase" style={{ color: "var(--text-muted)" }}>Rating</p>
                        <p className="text-sm font-extrabold" style={{ color: pointColor }}>{player.public_rating.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lb-card glow-orange fade-up px-3.5 sm:px-4 py-2.5" style={{ animationDelay: `${animationIndex * 30}ms` }}>
      <div className="flex items-center gap-2.5 sm:gap-3 w-full">
        <div className="rank-badge rank-md rank-default shrink-0">{rank}</div>
        <div className="flex-1 min-w-0 px-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading font-semibold text-xs sm:text-sm truncate block" style={{ color: "var(--text-primary)" }}>
              {player.name}
            </span>
            <VerifiedBadge />
          </div>
        </div>
        
        {/* Desktop Top 4-10 */}
        <div className="hidden sm:flex items-center shrink-0">
            {/* Trend */}
            <div className="w-16 text-center">
                <span className={`text-[10px] font-bold ${deltaColor}`}>{formattedDelta}</span>
            </div>
            {/* Matches */}
            <div className="w-20 text-center">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Matches</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{player.matches_played}</p>
            </div>
            {/* W/L */}
            <div className="w-20 text-center">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>W/L</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{player.wins}-{player.losses}</p>
            </div>
            {/* Rating */}
            <div className="w-24 text-center">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Rating</p>
                <p className="text-sm font-bold" style={{ color: "var(--orange-primary)" }}>{player.public_rating.toFixed(2)}</p>
            </div>

        </div>
        
        {/* Mobile Top 4-10 */}
        <div className="sm:hidden shrink-0">
            <div className="flex items-center gap-4">
                {/* Delta */}
                <div className="w-14 text-center">
                    <span className={`text-[9px] font-bold ${deltaColor}`}>{formattedDelta}</span>
                </div>
                {/* Matches */}
                <div className="w-12 text-center">
                    <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Matches</p>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{player.matches_played}</p>
                </div>
                {/* W/L */}
                <div className="w-12 text-center">
                    <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>W/L</p>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{player.wins}-{player.losses}</p>
                </div>
                {/* Rating */}
                <div className="w-14 text-center">
                    <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Rating</p>
                    <p className="text-xs font-bold" style={{ color: "var(--orange-primary)" }}>{player.public_rating.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}