import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { User, Zap, Trophy, Edit3, Check, X, Calendar, Award, Swords } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user?.username || '');
  const [avatarInput, setAvatarInput] = useState(user?.avatar_url || '');
  const [editError, setEditError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMatchHistory();
    }
  }, [user]);

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${user.id}/matches?limit=20`);
      if (res.success) {
        setMatchHistory(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch match history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setEditError(null);
      const res = await api.patch('/users/me', {
        username: usernameInput,
        avatar_url: avatarInput,
      });

      if (res.success && res.data) {
        updateUserProfile(res.data);
        setEditOpen(false);
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Banner Header */}
        <div className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-20 h-20 rounded-2xl bg-indigo-50 object-cover border-2 border-indigo-200 shadow-md"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">{user?.username}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {user?.role === 'admin' ? 'Admin' : 'Competitor'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'DevDuel'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setUsernameInput(user?.username || '');
              setAvatarInput(user?.avatar_url || '');
              setEditOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-sm transition-all"
          >
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-white/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Elo Rating</span>
            <div className="text-2xl font-extrabold text-indigo-600 font-outfit mt-1">{user?.rating || 1200}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Victories</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-outfit mt-1">{user?.wins || 0}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Defeats</span>
            <div className="text-2xl font-extrabold text-rose-500 font-outfit mt-1">{user?.losses || 0}</div>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-white/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase">Draws</span>
            <div className="text-2xl font-extrabold text-slate-700 font-outfit mt-1">{user?.draws || 0}</div>
          </div>
        </div>

        {/* Match History Table */}
        <div className="glass-card rounded-3xl border border-white/80 overflow-hidden shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-900 font-outfit mb-4">Complete Match History</h2>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading history...</div>
          ) : matchHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">No matches played yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Verdict</th>
                    <th className="py-3.5 px-4">Problem</th>
                    <th className="py-3.5 px-4">Opponent</th>
                    <th className="py-3.5 px-4">Elo Change</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {matchHistory.map((m) => {
                    const isWin = m.winner_id === user.id;
                    const isDraw = m.status === 'draw' || !m.winner_id;
                    const ratingChange = m.player1_id === user.id ? m.player1_rating_change : m.player2_rating_change;
                    const opponentName = m.player1_id === user.id ? m.player2_username || 'Opponent' : m.player1_username || 'Opponent';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              isWin
                                ? 'bg-emerald-100 text-emerald-700'
                                : isDraw
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-800">{m.problem_title || 'Speedcoding Duel'}</td>
                        <td className="py-4 px-4 text-slate-600">{opponentName}</td>
                        <td className="py-4 px-4 font-extrabold">
                          <span className={ratingChange > 0 ? 'text-emerald-600' : ratingChange < 0 ? 'text-rose-600' : 'text-slate-500'}>
                            {ratingChange > 0 ? `+${ratingChange}` : ratingChange || '0'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-xs text-slate-400 font-mono">
                          {new Date(m.created_at).toLocaleDateString()}
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

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl shadow-2xl border border-white/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 font-outfit">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {editError && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{editError}</div>}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarInput}
                  onChange={(e) => setAvatarInput(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
