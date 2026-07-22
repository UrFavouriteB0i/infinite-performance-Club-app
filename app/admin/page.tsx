"use client";

import { useState } from "react";
import { createPlayer, syncReclubSession } from "@/app/actions/admin";
import { REGIONS } from "@/lib/constants";

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [region, setRegion] = useState("TGR");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await syncReclubSession(url, region);
    setLoading(false);

    if (!res.success) {
      setError(res.error);
    } else {
      setResult(res.data);
      setUrl("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#F0F0F2] p-6 flex flex-col items-center">
      {/* Main Header */}
      <div className="max-w-5xl w-full mb-8 text-center md:text-left">
        <h1 className="font-bold text-3xl text-[#F27A1A]">⚡ IP Club Admin Control</h1>
        <p className="text-sm text-[#A0A0AA] mt-1">Manage live database players and sync tournament sessions</p>
      </div>

      {/* 2 Grid column layout */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

        {/* Left column: Reclub Session Sync */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-[#17171B] border border-[#2A2A34] rounded-2xl p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="font-bold text-lg text-[#F0F0F2]">Reclub Session Sync</h2>
              <p className="text-xs text-[#A0A0AA] mt-0.5">Import and automatically recalculate player ratings</p>
            </div>

            <form onSubmit={handleSync} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                  Leaderboard Region
                </label>

                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
                >
                  {REGIONS.map((r) => (
                    <option
                      key={r.code}
                      value={r.code}
                      className="bg-[#17171B] text-[#F0F0F2]"
                    >
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                  Reclub Scoresheet URL
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.reclub.co/export/score-sheets?m=..."
                  className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-2"
              >
                {loading ? "Processing Session & Updating Supabase..." : "Import & Recalculate Ratings"}
              </button>
            </form>
          </div>

          {/* Send Error notification */}
          {error && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-200 text-sm rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Sync card table */}
          {result && (
            <div className="bg-[#17171B] border border-[#2A2A34] rounded-2xl p-6 shadow-2xl space-y-4">
              <h2 className="text-lg font-bold text-emerald-400">
                ✓ Processed {result.matches_processed} Matches
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="py-3">Player</th>
                      <th className="py-3">Old</th>
                      <th className="py-3">New</th>
                      <th className="py-3">Delta</th>
                      <th className="py-3">Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {result.summary.map((row: any) => (
                      <tr key={row.name} className="hover:bg-zinc-900/30">
                        <td className="py-3 font-medium text-white">{row.name}</td>
                        <td className="py-3 text-zinc-400">{row.old_rating.toFixed(2)}</td>
                        <td className="py-3 font-bold text-white">{row.new_rating.toFixed(2)}</td>
                        <td className={`py-3 font-semibold ${row.delta.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                          {row.delta}
                        </td>
                        <td className="py-3 text-zinc-400">{row.session_record}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Manual Add Player */}
        <div className="md:col-span-5 bg-[#17171B] border border-[#2A2A34] rounded-2xl p-6 shadow-2xl">
          <div className="mb-6">
            <h2 className="font-bold text-lg text-[#F27A1A]">Quick Add Player</h2>
            <p className="text-xs text-[#A0A0AA] mt-0.5">Direct manual injection to live database</p>
          </div>

          <form action={createPlayer} className="space-y-4">
            {/* PIN Security Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                Admin Secret PIN
              </label>
              <input
                type="password"
                name="pin"
                required
                placeholder="Enter PIN"
                className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                Player Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Budi Santoso"
                className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                Region
              </label>
              <select
                name="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
              >
                {REGIONS.map((r) => (
                  <option
                    key={r.code}
                    value={r.code}
                    className="bg-[#17171B] text-[#F0F0F2]"
                  >
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Points */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A0A0AA] mb-1">
                Starting Points / Rating
              </label>
              <input
                type="number"
                name="points"
                defaultValue={1000}
                required
                className="w-full bg-[#0F0F11] border border-[#2A2A34] rounded-xl px-3.5 py-2.5 text-sm text-[#F0F0F2] focus:outline-none focus:border-[#F27A1A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F27A1A] hover:bg-[#FF8C2E] text-[#0F0F11] font-bold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              Add Player
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
