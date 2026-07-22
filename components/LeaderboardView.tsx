"use client";

import { useState, useRef, useEffect } from "react";
import PlayerCard, { Player, VerifiedBadge } from "@/components/PlayerCard";
import { REGION_MAP } from "@/lib/constants";

interface LeaderboardViewProps {
  initialPlayers: any[];
}

export default function LeaderboardView({ initialPlayers }: LeaderboardViewProps) {
  const [playersData] = useState<Player[]>(initialPlayers);
  const [theme, setTheme] = useState("dark");
  const [activeRegion, setActiveRegion] = useState("TGR");
  const [activeSport, setActiveSport] = useState("Tennis");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentRankPanel, setCurrentRankPanel] = useState(0);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const selectRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRegion(e.target.value);
    setSearchQuery("");
  };

  const switchRank = (index: number) => {
    if (index !== 0) return;
    setCurrentRankPanel(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dy) > Math.abs(dx)) {
      setIsDragging(false);
      return;
    }
    setCurrentX(dx);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current) {
      const threshold = containerRef.current.offsetWidth * 0.25;
      if (currentX < -threshold && currentRankPanel < 2) {
        // Unlock next panel logic here if needed
      } else if (currentX > threshold && currentRankPanel > 0) {
        setCurrentRankPanel((prev) => prev - 1);
      }
    }
    setCurrentX(0);
  };

  const query = searchQuery.toLowerCase().trim();
  let filteredPlayers = playersData.filter((p) => p.region === activeRegion);

  if (query) {
    filteredPlayers = filteredPlayers.filter((p) => p.name.toLowerCase().includes(query));
  }

  const top10 = filteredPlayers.slice(0, 10);
  const rest = filteredPlayers.slice(10);
  const top3 = top10.slice(0, 3);
  const rest7 = top10.slice(3);

  return (
    <div className="min-h-screen overflow-x-hidden w-full relative">
      <div className="max-w-[1120px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0">
              <img src="./iP logo.jpg" alt="Infinite Performance Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-4xl tracking-wider" style={{ color: "var(--text-primary)", letterSpacing: "0.06em" }}>
                INFINITE PERFORMANCE
              </h1>
              <p className="font-display text-sm sm:text-lg tracking-widest" style={{ color: "var(--orange-primary)" }}>LEADERBOARD</p>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <div className="knob">
              {theme === "dark" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </div>
          </button>
        </header>

        <div className="mb-8 flex justify-center sm:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wider sm:tracking-widest uppercase whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
              Official Rankings of the IP Club Collective
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:block">
          {/* SPORT */}
          <section className="mb-6 order-1">
            <div className="block sm:hidden">
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Sport</label>
              <select value={activeSport} className="region-dropdown" onChange={(e) => setActiveSport(e.target.value)}>
                <option value="Tennis">Tennis</option>
                <option value="Padel" disabled>Padel (Coming Soon)</option>
                <option value="Badminton" disabled>Badminton (Coming Soon)</option>
                <option value="Pickleball" disabled>Pickleball (Coming Soon)</option>
              </select>
            </div>
            <div className="hidden sm:grid sm:grid-cols-4 gap-3">
              <div className={`sport-card ${activeSport === "Tennis" ? "active" : ""}`} onClick={() => setActiveSport("Tennis")}>
                <div className="mx-auto mb-2 w-7 h-7" style={{ backgroundColor: activeSport === "Tennis" ? "var(--orange-primary)" : "var(--text-muted)", WebkitMask: "url(/tennis.svg) center/contain no-repeat", mask: "url(/tennis.svg) center/contain no-repeat" }} />
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-primary)" }}>Tennis</p>
              </div>
              <div className="sport-card locked">
                <div className="mx-auto mb-2 w-7 h-7" style={{ backgroundColor: "var(--text-muted)", WebkitMask: "url(/padel.svg) center/contain no-repeat", mask: "url(/padel.svg) center/contain no-repeat" }} />
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-muted)" }}>Padel</p>
                <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
              </div>
              <div className="sport-card locked">
                <div className="mx-auto mb-2 w-7 h-7" style={{ backgroundColor: "var(--text-muted)", WebkitMask: "url(/badminton.svg) center/contain no-repeat", mask: "url(/badminton.svg) center/contain no-repeat" }} />
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-muted)" }}>Badminton</p>
                <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
              </div>
              <div className="sport-card locked">
                <div className="mx-auto mb-2 w-7 h-7" style={{ backgroundColor: "var(--text-muted)", WebkitMask: "url(/pickleball.svg) center/contain no-repeat", mask: "url(/pickleball.svg) center/contain no-repeat" }} />
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-muted)" }}>Pickleball</p>
                <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
              </div>
            </div>
          </section>

          {/* SCOPE */}
          <section className="mb-6 order-3">
            <div className="flex gap-3">
              <div className="scope-card active">
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-primary)" }}>Regional</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>City-level rankings</p>
              </div>
              <div className="scope-card locked">
                <p className="font-heading font-bold text-sm" style={{ color: "var(--text-muted)" }}>National</p>
                <span className="badge-dev mt-1 inline-block">Under Development</span>
              </div>
            </div>
          </section>        

          {/* REGION */}
          <section className="mb-6 order-2">
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Region</label>
            <select
              value={activeRegion}
              className="region-dropdown"
              onChange={selectRegion}
            >
              {Object.entries(REGION_MAP).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          </section>

          {/* RANK TABS */}
          <section className="mb-4 order-4 w-full">
            <div className="flex gap-4 sm:gap-6 border-b border-[var(--border-color)] overflow-x-auto whitespace-nowrap hide-scrollbar w-full">
              <button 
                className={`relative pb-3 text-sm font-heading tracking-wide transition-colors ${currentRankPanel === 0 ? "text-[var(--text-primary)] font-bold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium"}`}
                onClick={() => switchRank(0)}
              >
                Beginner
                {currentRankPanel === 0 && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-t-sm" style={{ backgroundColor: "var(--orange-primary)" }}></span>
                )}
              </button>
              <button className="relative pb-3 text-sm font-heading font-medium text-[var(--text-muted)] cursor-not-allowed">
                Intermediate <span className="badge-soon ml-1" style={{ fontSize: "9px" }}>Soon</span>
              </button>
              <button className="relative pb-3 text-sm font-heading font-medium text-[var(--text-muted)] cursor-not-allowed">
                Advanced <span className="badge-soon ml-1" style={{ fontSize: "9px" }}>Soon</span>
              </button>
            </div>
          </section>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-2 flex justify-start sm:justify-end h-10">
          <div className={`group flex items-center transition-all duration-300 ease-in-out border-b-2 
              ${isSearchExpanded ? "w-full border-[var(--orange-primary)]" : "w-8 border-transparent"}
              sm:w-72 sm:border-[var(--border-color)] sm:opacity-50 sm:hover:opacity-100 sm:focus-within:opacity-100 sm:focus-within:border-[var(--orange-primary)]
            `}
          >
            <button onClick={toggleSearch} className={`p-1 shrink-0 transition-colors ${isSearchExpanded ? "text-[var(--orange-primary)]" : "text-[var(--text-muted)]"} sm:text-[var(--text-muted)] sm:group-focus-within:text-[var(--orange-primary)]`} aria-label="Toggle search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent outline-none text-sm font-body transition-all duration-300 
                ${isSearchExpanded ? "w-full opacity-100 ml-2 px-1" : "w-0 opacity-0 p-0"}
                sm:w-full sm:opacity-100 sm:ml-2 sm:px-1
              `}
              style={{ color: "var(--text-primary)" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={`p-1 shrink-0 transition-colors ${isSearchExpanded ? "block" : "hidden sm:block"}`} style={{ color: "var(--text-muted)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* SWIPE CONTAINER */}
        <div 
          className="swipe-container w-full overflow-hidden" 
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="swipe-track flex w-full" 
            style={{
              transform: `translateX(calc(-${currentRankPanel * 100}% + ${currentX}px))`,
              transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {/* Panel 0: Beginner */}
            <div className="swipe-panel px-1.5 py-1">
              <div id="leaderboard-container" className="w-full">
                {filteredPlayers.length === 0 ? (
                  <div id="empty-state" className="text-center py-16">
                    <p className="text-lg font-medium" style={{ color: "var(--text-muted)" }}>No players found</p>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Try adjusting your search or region.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="block w-6 h-0.5 rounded" style={{ background: "var(--orange-primary)" }}></span>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--orange-primary)" }}>Top {Math.min(10, filteredPlayers.length)} Players</span>
                    </div>

                    {/* TOP 3 */}
                    {top3.length > 0 && (
                      <div className="grid gap-3 mb-3">
                        {top3.map((p, i) => (
                          <PlayerCard key={p.name} player={p} rank={i + 1} isTop3={true} animationIndex={i} />
                        ))}
                      </div>
                    )}

                    {/* REST OF TOP 10 */}
                    {rest7.length > 0 && (
                      <div className="grid gap-2 mb-8">
                        {rest7.map((p, i) => (
                          <PlayerCard key={p.name} player={p} rank={i + 4} isTop3={false} animationIndex={i + 3} />
                        ))}
                      </div>
                    )}

                    {/* REST OF FIELD TABLE (11+) */}
                    {rest.length > 0 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="block w-6 h-0.5 rounded" style={{ background: "var(--border-color)" }}></span>
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Rest of the Field</span>
                        </div>
                        <div className="rest-table">
                          <table className="w-full text-sm">
                            <thead>
                              <tr>
                                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold w-14">#</th>
                                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold">Player</th>
                                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider font-semibold hidden sm:table-cell">Matches</th>
                                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider font-semibold">W/L</th>
                                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider font-semibold">Points</th>
                                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider font-semibold w-16">Verified</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rest.map((p, i) => {
                                const rank = i + 11;
                                
                                // Calculate delta for the table rows
                                const history = p.history || [];
                                let delta = 0;
                                if (history.length >= 2) {
                                    delta = history[history.length - 1] - history[history.length - 2];
                                }
                                const isPositive = delta > 0;
                                const isNegative = delta < 0;
                                const formattedDelta = isPositive 
                                    ? `▲ +${delta.toFixed(2)}` 
                                    : isNegative 
                                    ? `▼ ${delta.toFixed(2)}` 
                                    : `- 0.00`;
                                const deltaColor = isPositive ? "text-emerald-500" : isNegative ? "text-rose-500" : "text-gray-500";

                                return (
                                    <tr key={p.name} className="fade-up" style={{ animationDelay: `${(i + 10) * 20}ms` }}>
                                    <td className="px-4 py-3">
                                        <span className="rank-badge rank-sm rank-default">{rank}</span>
                                    </td>
                                    <td className="px-2 sm:px-4 py-3 font-medium truncate max-w-[120px] sm:max-w-none" style={{ color: "var(--text-primary)" }}>{p.name}</td>
                                    <td className="w-16 text-center px-2 py-3"><span className={`text-[10px] font-bold ${deltaColor}`}> {formattedDelta}</span></td>
                                    <td className="text-center px-4 py-3 hidden sm:table-cell">{p.matches_played}</td>
                                    <td className="text-center px-4 py-3">{p.wins}-{p.losses}</td>
                                    <td className="text-center px-4 py-3">
                                        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{p.public_rating?.toFixed(2)}</span>
                                    </td>
                                    <td className="text-center px-4 py-3">
                                        <VerifiedBadge />
                                    </td>
                                </tr>
                                );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Panel 1: Intermediate */}
            <div className="swipe-panel">
              <div className="locked-panel">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="font-heading font-bold text-lg" style={{ color: "var(--text-muted)" }}>Intermediate Rankings</p>
                <p className="text-sm" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Coming soon — data collection in progress</p>
              </div>
            </div>

            {/* Panel 2: Advanced */}
            <div className="swipe-panel">
              <div className="locked-panel">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="font-heading font-bold text-lg" style={{ color: "var(--text-muted)" }}>Advanced Rankings</p>
                <p className="text-sm" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Coming soon — data collection in progress</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-14 pt-6 pb-8 text-center" style={{ borderTop: "1px solid var(--border-color)" }}>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>All rankings verified by the Infinite Performance Committee &middot; Data updated periodically</p>
        </footer>
      </div>
    </div>
  );
}