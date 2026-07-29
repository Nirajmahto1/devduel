import React from 'react';
import { Trophy, Frown, Scale, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VerdictModal({ isOpen, result, currentUserId, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !result) return null;

  const isWinner = result.winnerId === currentUserId;
  const isDraw = !result.winnerId;

  const player1Stats = result.eloChanges?.player1;
  const player2Stats = result.eloChanges?.player2;
  const myStats = player1Stats?.userId === currentUserId ? player1Stats : player2Stats;
  const opponentStats = player1Stats?.userId === currentUserId ? player2Stats : player1Stats;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg p-8 rounded-3xl text-center shadow-2xl border border-white/80 relative overflow-hidden">
        {/* Header Icon */}
        <div className="mb-4">
          {isWinner ? (
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
          ) : isDraw ? (
            <div className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md shadow-amber-100">
              <Scale className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md shadow-rose-100">
              <Frown className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title & Reason */}
        <h2 className="text-3xl font-extrabold text-slate-800 font-outfit tracking-tight">
          {isWinner ? 'Victory!' : isDraw ? 'Match Draw' : 'Defeat'}
        </h2>

        <p className="text-sm text-slate-500 mt-1 font-medium capitalize">
          {result.reason === 'solved'
            ? 'Problem solved correctly!'
            : result.reason === 'timeout'
            ? 'Time limit reached'
            : result.reason === 'forfeit' || result.reason === 'disconnect'
            ? 'Opponent forfeited the match'
            : result.reason}
        </p>

        {/* Rating Breakdown Card */}
        {myStats && (
          <div className="my-6 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-around">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Previous</span>
              <div className="text-lg font-bold text-slate-700">{myStats.ratingBefore}</div>
            </div>

            <div className="flex items-center gap-1">
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <div
                className={`text-xl font-extrabold px-3 py-1 rounded-xl ${
                  myStats.ratingChange > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : myStats.ratingChange < 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {myStats.ratingChange > 0 ? `+${myStats.ratingChange}` : myStats.ratingChange}
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">New Elo</span>
              <div className="text-xl font-extrabold text-indigo-900">{myStats.ratingAfter}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <button
            onClick={() => {
              if (onClose) onClose();
              navigate('/dashboard');
            }}
            className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => {
              if (onClose) onClose();
              navigate('/dashboard?findMatch=true');
            }}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
          >
            <RotateCcw className="w-4 h-4" />
            Next Match
          </button>
        </div>
      </div>
    </div>
  );
}
