import React from 'react';
import { Swords, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/60 border-t border-slate-200/80 py-8 mt-auto backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              <Swords className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-800 tracking-tight font-outfit">
              DevDuel
            </span>
            <span className="text-xs text-slate-500 ml-2">
              © {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs font-medium text-slate-500">
            <a href="/problems" className="hover:text-indigo-600 transition-colors">
              Problem Bank
            </a>
            <a href="/leaderboard" className="hover:text-indigo-600 transition-colors">
              Leaderboard
            </a>
            <a href="https://github.com/nirajmahto1/devduel" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">
              GitHub Repository
            </a>
          </div>

          <div className="flex items-center text-xs text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" />
            <span>for competitive coders</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
