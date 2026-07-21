'use client';

import React, { useState, useEffect, useRef } from 'react';

// ────────────────────────────────────────
//  MOCK DATA: 50 players, 10 per region
// ────────────────────────────────────────
const PLAYERS = [
  // TANGERANG
  { name: "Rizky Firmansyah", region: "Tangerang", matches: 22, wins: 18, losses: 4, points: 1480 },
];

const VerifiedBadge = () => (
  <span className="verified-badge">
    <svg viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

export default function LeaderboardPage() {
  const [theme, setTheme] = useState('dark');
  const [activeRegion, setActiveRegion] = useState('Tangerang');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentRankPanel, setCurrentRankPanel] = useState(0);

  // Swipe logic states
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const selectRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveRegion(e.target.value);
    setSearchQuery('');
  };

  const switchRank = (index: number) => {
    if (index !== 0) return; // only beginner unlocked
    setCurrentRankPanel(index);
  };

  // Touch swipe handling
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
        // snap back
      } else if (currentX > threshold && currentRankPanel > 0) {
        setCurrentRankPanel(prev => prev - 1);
      }
    }
    setCurrentX(0);
  };

  // LEADERBOARD RENDER LOGIC
  const query = searchQuery.toLowerCase().trim();
  let players = PLAYERS
    .filter(p => p.region === activeRegion)
    .sort((a, b) => b.points - a.points);

  if (query) {
    players = players.filter(p => p.name.toLowerCase().includes(query));
  }

  const top10 = players.slice(0, 10);
  const rest = players.slice(10);
  const top3 = top10.slice(0, 3);
  const rest7 = top10.slice(3);

  return (
    <div className="min-h-screen">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ═══════════ HEADER ═══════════ */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* LOGO */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 10 L10 90 L40 90 L40 50 Q40 30 60 30 L90 30 L90 10 Z" fill="var(--orange-primary)"/>
                <path d="M50 50 L50 90 L90 90 L90 50 Q90 50 50 50 Z" fill="var(--orange-primary)"/>
                <path d="M50 50 Q50 90 90 90 L90 50 Z" fill="var(--bg-primary)"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-4xl tracking-wider" style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>
                INFINITE PERFORMANCE
              </h1>
              <p className="font-display text-sm sm:text-lg tracking-widest" style={{ color: 'var(--orange-primary)' }}>LEADERBOARD</p>
            </div>
          </div>
          {/* Theme Toggle */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <div className="knob">
              {theme === 'dark' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F0F11" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </div>
          </button>
        </header>

        {/* Subheader Badge */}
        <div className="mb-8 flex justify-center sm:justify-start">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>The Official Rankings of the IP Club Collective</span>
          </div>
        </div>

        {/* ═══════════ SPORT CARDS (Level 1) ═══════════ */}
        <section className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="sport-card active">
              <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M18.36 5.64a9 9 0 01-1.77 12.73"/><path d="M5.64 5.64a9 9 0 001.77 12.73"/>
              </svg>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Tennis</p>
            </div>
            <div className="sport-card locked">
              <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <rect x="2" y="4" width="20" height="16" rx="3"/><line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Padel</p>
              <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
            </div>
            <div className="sport-card locked">
              <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="20"/><path d="M7 12l5-4 5 4"/>
              </svg>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Badminton</p>
              <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
            </div>
            <div className="sport-card locked">
              <svg className="mx-auto mb-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-muted)' }}>Pickleball</p>
              <span className="badge-soon mt-1.5 inline-block">Coming Soon</span>
            </div>
          </div>
        </section>

        {/* ═══════════ SCOPE CARDS (Level 2) ═══════════ */}
        <section className="mb-6">
          <div className="flex gap-3">
            <div className="scope-card active">
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Regional</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>City-level rankings</p>
            </div>
            <div className="scope-card locked">
              <p className="font-heading font-bold text-sm" style={{ color: 'var(--text-muted)' }}>National</p>
              <span className="badge-dev mt-1 inline-block">Under Development</span>
            </div>
          </div>
        </section>

        {/* ═══════════ REGION DROPDOWN ═══════════ */}
        <section className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Region</label>
          <select value={activeRegion} className="region-dropdown" onChange={selectRegion}>
            <option value="Tangerang">Tangerang</option>
            <option value="DKI Jakarta">DKI Jakarta</option>
            <option value="Bogor">Bogor</option>
            <option value="Depok">Depok</option>
            <option value="Bekasi">Bekasi</option>
          </select>
        </section>

        {/* ═══════════ RANK TABS + SWIPE SECTION (Level 3) ═══════════ */}
        <section className="mb-6">
          <div className="rank-tabs-bar mb-0">
            <button className={`rank-tab-btn ${currentRankPanel === 0 ? 'active' : ''}`} onClick={() => switchRank(0)}>Beginner</button>
            <button className="rank-tab-btn locked">Intermediate <span className="badge-soon ml-1" style={{ fontSize: '7px' }}>Soon</span></button>
            <button className="rank-tab-btn locked">Advanced <span className="badge-soon ml-1" style={{ fontSize: '7px' }}>Soon</span></button>
          </div>
        </section>

        {/* Swipable Panels */}
        <div 
          className="swipe-container" 
          id="swipe-container"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="swipe-track" 
            id="swipe-track"
            style={{
              transform: `translateX(calc(-${currentRankPanel * 100}% + ${currentX}px))`,
              transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Panel 0: Beginner (active) */}
            <div className="swipe-panel" id="panel-beginner">
              {/* Search */}
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <input 
                  id="search-input" 
                  type="text" 
                  placeholder="Search player by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input w-full pl-11 pr-4 py-3.5 text-sm font-body" 
                />
              </div>

              {/* Leaderboard renders here */}
              <div id="leaderboard-container">
                {players.length === 0 ? (
                  <div id="empty-state" className="text-center py-16">
                    <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No players found</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Try adjusting your search or region.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="block w-6 h-0.5 rounded" style={{ background: 'var(--orange-primary)' }}></span>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--orange-primary)' }}>Top {Math.min(10, players.length)} Players</span>
                    </div>

                    {top3.length > 0 && (
                      <div className="grid gap-3 mb-3">
                        {top3.map((p, i) => {
                          const rank = i + 1;
                          const glowClass = rank === 1 ? 'glow-gold' : rank === 2 ? 'glow-silver' : 'glow-bronze';
                          const rankClass = `rank-${rank}`;
                          const pointColor = rank === 1 ? 'var(--gold)' : rank === 2 ? 'var(--silver)' : 'var(--bronze)';

                          return (
                            <div key={p.name} className={`lb-card lb-card-top3 ${glowClass} fade-up`} style={{ animationDelay: `${i * 40}ms` }}>
                              <div className="flex items-center gap-4">
                                <div className={`rank-badge rank-lg ${rankClass} shrink-0`}>{rank}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-heading font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                                    <VerifiedBadge />
                                  </div>
                                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.region}</span>
                                </div>
                                <div className="hidden sm:flex items-center gap-7 text-right shrink-0">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Matches</p>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{p.matches}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>W/L</p>
                                    <p className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>{p.wins}-{p.losses}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Points</p>
                                    <p className="text-base font-extrabold" style={{ color: pointColor }}>{p.points.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex sm:hidden items-center gap-4 text-right shrink-0">
                                  <div>
                                    <p className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>W/L</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{p.wins}-{p.losses}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Pts</p>
                                    <p className="text-sm font-extrabold" style={{ color: pointColor }}>{p.points.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {rest7.length > 0 && (
                      <div className="grid gap-2 mb-8">
                        {rest7.map((p, i) => {
                          const rank = i + 4;
                          return (
                            <div key={p.name} className="lb-card glow-orange fade-up" style={{ animationDelay: `${(i + 3) * 30}ms` }}>
                              <div className="flex items-center gap-3">
                                <div className="rank-badge rank-md rank-default shrink-0">{rank}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-heading font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                                    <VerifiedBadge />
                                  </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-6 text-right shrink-0">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Matches</p>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{p.matches}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>W/L</p>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{p.wins}-{p.losses}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Points</p>
                                    <p className="text-sm font-bold" style={{ color: 'var(--orange-primary)' }}>{p.points.toLocaleString()}</p>
                                  </div>
                                </div>
                                <div className="flex sm:hidden items-center gap-3 text-right shrink-0">
                                  <div>
                                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>W/L</p>
                                    <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{p.wins}-{p.losses}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Pts</p>
                                    <p className="text-xs font-bold" style={{ color: 'var(--orange-primary)' }}>{p.points.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {rest.length > 0 && (
                      <>
                        <div className="mb-3 flex items-center gap-3">
                          <span className="block w-6 h-0.5 rounded" style={{ background: 'var(--border-color)' }}></span>
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Rest of the Field</span>
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
                                return (
                                  <tr key={p.name} className="fade-up" style={{ animationDelay: `${(i + 10) * 20}ms` }}>
                                    <td className="px-4 py-3"><span className="rank-badge rank-sm rank-default">{rank}</span></td>
                                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                                    <td className="text-center px-4 py-3 hidden sm:table-cell">{p.matches}</td>
                                    <td className="text-center px-4 py-3">{p.wins}-{p.losses}</td>
                                    <td className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.points.toLocaleString()}</td>
                                    <td className="text-center px-4 py-3"><VerifiedBadge /></td>
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

            {/* Panel 1: Intermediate (locked) */}
            <div className="swipe-panel">
              <div className="locked-panel">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-muted)' }}>Intermediate Rankings</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Coming soon — data collection in progress</p>
              </div>
            </div>

            {/* Panel 2: Advanced (locked) */}
            <div className="swipe-panel">
              <div className="locked-panel">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <p className="font-heading font-bold text-lg" style={{ color: 'var(--text-muted)' }}>Advanced Rankings</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Coming soon — data collection in progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="mt-14 pt-6 pb-8 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All rankings verified by the Infinite Performance Committee &middot; Data updated periodically</p>
        </footer>
      </div>
    </div>
  );
}