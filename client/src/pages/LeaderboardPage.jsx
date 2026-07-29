import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Trophy, Medal, Search, Zap, Crown, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/leaderboard?period=${period}&limit=50`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filteredUsers.slice(0, 3);
  const restUsers = filteredUsers.slice(3);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title */}
        <div className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>Global Rankings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Elo Leaderboard</h1>
            <p className="text-sm text-slate-500 mt-1">Top competitive coders ranked by Elo ratings.</p>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                period === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All-Time
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                period === 'weekly'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Top 3 Podium Display */}
        {!loading && top3.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Rank 2 (Silver) */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 text-center flex flex-col items-center justify-center relative md:translate-y-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center mb-3">
                #2
              </div>
              <img
                src={top3[1].avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[1].username}`}
                alt={top3[1].username}
                className="w-16 h-16 rounded-2xl bg-slate-100 object-cover shadow-md mb-3 border-2 border-slate-300"
              />
              <h3 className="font-extrabold text-slate-900 text-lg font-outfit">{top3[1].username}</h3>
              <div className="flex items-center gap-1 mt-1 text-sm font-bold text-indigo-600">
                <Zap className="w-4 h-4 fill-indigo-600" />
                <span>{top3[1].rating} Elo</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                {top3[1].wins}W / {top3[1].losses}L
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="glass-card p-8 rounded-3xl border-2 border-amber-300 text-center flex flex-col items-center justify-center relative bg-gradient-to-b from-amber-50/40 via-white to-white shadow-2xl shadow-amber-100/50">
              <div className="absolute -top-4 px-4 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-amber-950" />
                <span>#1 Champion</span>
              </div>
              <img
                src={top3[0].avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[0].username}`}
                alt={top3[0].username}
                className="w-20 h-20 rounded-2xl bg-amber-50 object-cover shadow-lg mb-3 border-4 border-amber-300"
              />
              <h3 className="font-extrabold text-slate-900 text-xl font-outfit">{top3[0].username}</h3>
              <div className="flex items-center gap-1 mt-1 text-base font-extrabold text-indigo-600">
                <Zap className="w-4 h-4 fill-indigo-600" />
                <span>{top3[0].rating} Elo</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                {top3[0].wins}W / {top3[0].losses}L
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="glass-card p-6 rounded-3xl border border-white/80 text-center flex flex-col items-center justify-center relative md:translate-y-6">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center mb-3">
                #3
              </div>
              <img
                src={top3[2].avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${top3[2].username}`}
                alt={top3[2].username}
                className="w-16 h-16 rounded-2xl bg-slate-100 object-cover shadow-md mb-3 border-2 border-amber-200"
              />
              <h3 className="font-extrabold text-slate-900 text-lg font-outfit">{top3[2].username}</h3>
              <div className="flex items-center gap-1 mt-1 text-sm font-bold text-indigo-600">
                <Zap className="w-4 h-4 fill-indigo-600" />
                <span>{top3[2].rating} Elo</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 font-medium">
                {top3[2].wins}W / {top3[2].losses}L
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="glass-card rounded-3xl border border-white/80 overflow-hidden shadow-xl">
          {/* Search Filter */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user by username..."
                className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading rankings...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6 w-16">Rank</th>
                    <th className="py-4 px-6">Coder</th>
                    <th className="py-4 px-4">Elo Rating</th>
                    <th className="py-4 px-4">Wins</th>
                    <th className="py-4 px-4">Losses</th>
                    <th className="py-4 px-6 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredUsers.map((u, index) => {
                    const isMe = u.id === currentUser?.id;
                    const rank = index + 1;
                    const totalMatches = u.wins + u.losses;
                    const winRate = totalMatches > 0 ? Math.round((u.wins / totalMatches) * 100) : 0;

                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isMe ? 'bg-indigo-50/70 font-bold border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-4 px-6 font-extrabold text-slate-600">
                          #{rank}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                              alt={u.username}
                              className="w-8 h-8 rounded-lg bg-slate-100 object-cover"
                            />
                            <span className="font-bold text-slate-800">{u.username}</span>
                            {isMe && (
                              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-indigo-700 font-extrabold">
                            <Zap className="w-4 h-4 fill-indigo-600" />
                            <span>{u.rating}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-emerald-600 font-bold">{u.wins}</td>
                        <td className="py-4 px-4 text-rose-500 font-bold">{u.losses}</td>
                        <td className="py-4 px-6 text-right font-bold text-slate-700">
                          {winRate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
