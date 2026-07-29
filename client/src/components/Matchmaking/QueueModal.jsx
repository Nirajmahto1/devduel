import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Swords, X, Loader2 } from 'lucide-react';

export default function QueueModal() {
  const { isSearchingMatch, leaveQueue } = useSocket();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isSearchingMatch) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearchingMatch]);

  if (!isSearchingMatch) return null;

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-md p-8 rounded-3xl text-center shadow-2xl border border-white/80 relative overflow-hidden">
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-pulse" />

        {/* Close / Leave Button */}
        <button
          onClick={leaveQueue}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          title="Cancel Queue"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Radar Animation */}
        <div className="my-6 relative inline-block">
          <div className="w-24 h-24 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center animate-radar mx-auto shadow-inner">
            <Swords className="w-10 h-10 text-indigo-600 animate-bounce" />
          </div>
        </div>

        <h3 className="text-2xl font-extrabold text-slate-800 font-outfit tracking-tight">
          Finding Opponent...
        </h3>

        <p className="text-sm text-slate-500 mt-2 font-medium">
          Searching for a balanced opponent within your Elo rating band.
        </p>

        {/* Elapsed Time Display */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-mono font-bold text-lg">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>{formatTime(seconds)}</span>
        </div>

        {/* Cancel Button */}
        <div className="mt-8">
          <button
            onClick={leaveQueue}
            className="w-full py-3 px-6 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100/80 transition-all text-sm shadow-sm active:scale-95"
          >
            Cancel Matchmaking
          </button>
        </div>
      </div>
    </div>
  );
}
