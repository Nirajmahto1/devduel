import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import QueueModal from '../components/Matchmaking/QueueModal';
import {
  Swords,
  Zap,
  Trophy,
  Users,
  Plus,
  ArrowRight,
  Code,
  Sparkles,
  Copy,
  Check,
  Play,
  KeyRound,
  BarChart3,
  Award,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { joinQueue, matchData, clearMatchData } = useSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [recentMatches, setRecentMatches] = useState([]);
  const [featuredProblem, setFeaturedProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Private Room Modal State
  const [privateModalOpen, setPrivateModalOpen] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copied, setCopied] = useState(false);
  const [roomError, setRoomError] = useState(null);

  useEffect(() => {
    // If URL has ?findMatch=true trigger queue automatically
    if (searchParams.get('findMatch') === 'true') {
      joinQueue();
    }

    fetchDashboardData();
  }, [searchParams]);

  useEffect(() => {
    if (matchData) {
      const roomId = matchData.roomId;
      clearMatchData();
      navigate(`/duel/${roomId}`);
    }
  }, [matchData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, problemsRes] = await Promise.all([
        api.get(`/users/${user?.id || 'me'}/matches?limit=5`),
        api.get('/problems?limit=1'),
      ]);

      if (matchesRes.success) setRecentMatches(matchesRes.data || []);
      if (problemsRes.success && problemsRes.data.length > 0) {
        setFeaturedProblem(problemsRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateRoom = async () => {
    try {
      setRoomError(null);
      const res = await api.post('/matches/private');
      if (res.success && res.data) {
        setCreatedRoom(res.data);
      }
    } catch (err) {
      setRoomError(err.message || 'Failed to create private room');
    }
  };

  const handleJoinPrivateRoom = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    try {
      setRoomError(null);
      const res = await api.post('/matches/join', { inviteCode: inviteCodeInput.trim() });
      if (res.success && res.data) {
        setPrivateModalOpen(false);
        navigate(`/duel/${res.data.id}`);
      }
    } catch (err) {
      setRoomError(err.message || 'Failed to join room. Verify the invite code.');
    }
  };

  const copyInviteCode = () => {
    if (createdRoom?.inviteCode) {
      navigator.clipboard.writeText(createdRoom.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRankTier = (rating = 1200) => {
    if (rating >= 2000) return { name: 'Grandmaster', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (rating >= 1700) return { name: 'Master', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (rating >= 1500) return { name: 'Expert', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (rating >= 1300) return { name: 'Specialist', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    return { name: 'Novice', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  const rankTier = getRankTier(user?.rating);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />
      <QueueModal />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
                Welcome back, {user?.username}! 👋
              </h1>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${rankTier.color}`}>
                {rankTier.name}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Ready for your next 1v1 speedcoding duel?
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={joinQueue}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl transition-all flex items-center gap-2.5 active:scale-95"
            >
              <Swords className="w-5 h-5" />
              <span>Find Match</span>
            </button>

            <button
              onClick={() => {
                setPrivateModalOpen(true);
                setCreatedRoom(null);
                setRoomError(null);
              }}
              className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Private Room</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-6 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Elo Rating</span>
              <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 font-outfit mt-2">
              {user?.rating || 1200}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Standard Elo rating</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Victories</span>
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 font-outfit mt-2">
              {user?.wins || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Matches won</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Defeats</span>
              <BarChart3 className="w-5 h-5 text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-slate-700 font-outfit mt-2">
              {user?.losses || 0}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Matches lost</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-purple-600 font-outfit mt-2">
              {user?.wins + user?.losses > 0
                ? `${Math.round((user.wins / (user.wins + user.losses)) * 100)}%`
                : '0%'}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Overall ratio</div>
          </div>
        </div>

        {/* Featured Problem & Recent Matches Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured Practice Problem (1 col) */}
          <div className="glass-card p-6 rounded-3xl border border-white/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Daily Challenge
                </span>
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>

              {featuredProblem ? (
                <>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit">{featuredProblem.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {featuredProblem.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize">
                      {featuredProblem.difficulty}
                    </span>
                    {featuredProblem.tags?.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">Loading daily challenge...</div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => navigate(`/practice/${featuredProblem?.id}`)}
                disabled={!featuredProblem}
                className="w-full py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-indigo-700" />
                <span>Practice Solo</span>
              </button>
            </div>
          </div>

          {/* Recent Matches Feed (2 cols) */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/80">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Recent Matches</h3>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading match history...</div>
            ) : recentMatches.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No matches played yet.</p>
                <button
                  onClick={joinQueue}
                  className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                >
                  Join queue for your first duel!
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentMatches.map((m) => {
                  const isWin = m.winner_id === user?.id;
                  const isDraw = m.status === 'draw' || !m.winner_id;
                  const ratingChange = m.player1_id === user?.id ? m.player1_rating_change : m.player2_rating_change;

                  return (
                    <div
                      key={m.id}
                      onClick={() => navigate(`/matches/${m.id}`)}
                      className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-slate-100 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isWin
                              ? 'bg-emerald-100 text-emerald-700'
                              : isDraw
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isWin ? 'W' : isDraw ? 'D' : 'L'}
                        </span>

                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {m.problem_title || 'Competitive Duel'}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            vs {m.player1_id === user?.id ? m.player2_username || 'Opponent' : m.player1_username || 'Opponent'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-sm font-extrabold ${
                            ratingChange > 0
                              ? 'text-emerald-600'
                              : ratingChange < 0
                              ? 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {ratingChange > 0 ? `+${ratingChange}` : ratingChange || '0'} Elo
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">{m.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Private Room Creator / Joiner Modal */}
      {privateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl shadow-2xl border border-white/80 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 font-outfit flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>Private Room Duel</span>
              </h3>
              <button
                onClick={() => setPrivateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {roomError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {roomError}
              </div>
            )}

            {createdRoom ? (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-slate-600">Share this 8-character invite code with your friend:</p>
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-indigo-900 tracking-wider">
                    {createdRoom.inviteCode}
                  </span>
                  <button
                    onClick={copyInviteCode}
                    className="p-2 rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100 hover:bg-indigo-50"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setPrivateModalOpen(false);
                    navigate(`/duel/${createdRoom.matchId}`);
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md"
                >
                  Enter Room Lobby
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <button
                    onClick={handleCreatePrivateRoom}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Private Room</span>
                  </button>
                </div>

                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                  <span className="relative px-3 bg-white text-xs text-slate-400 font-semibold uppercase">or join with code</span>
                </div>

                <form onSubmit={handleJoinPrivateRoom} className="space-y-3">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 8-char Invite Code (e.g. A1B2C3D4)"
                    className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm text-center tracking-wider font-bold"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 transition-all shadow-sm"
                  >
                    Join Room
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
