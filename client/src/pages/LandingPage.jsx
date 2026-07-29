import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Zap, ShieldCheck, Terminal, Trophy, Users, ArrowRight, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-sm animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
            <span>CodeChef Meets Chess.com — 1v1 Live Arena</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight font-outfit max-w-4xl mx-auto leading-tight">
            Race to Solve. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Head-to-Head 1v1 Coding.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Get paired with an opponent of matching skill. Solve algorithmic challenges live with Monaco editor, real-time status indicators, and Judge0 sandboxed verdicts.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Enter the Arena</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/problems"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-base shadow-md hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Code className="w-5 h-5 text-indigo-600" />
              <span>Browse Problems</span>
            </Link>
          </div>

          {/* Live Stats Ticker Bar */}
          <div className="mt-16 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-card rounded-3xl border border-white/80 shadow-xl">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-outfit">100+</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Curated Problems</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-outfit">1v1</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Real-Time Pairing</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-outfit">&lt; 1s</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Judge0 Verdicts</div>
            </div>
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-outfit">Elo</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Global Leaderboard</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white/50 border-t border-b border-slate-200/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 font-outfit">
              Built for Competitive Coders
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Everything you need for fast-paced 1v1 speedcoding battles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card glass-card-hover p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-outfit">Elo Matchmaking</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Dynamic matchmaking pairs you with opponents of similar rating within a ±150 rating band.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 shadow-sm">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-outfit">Monaco & Judge0</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                VS Code engine with support for C++, Python, Java, and JavaScript run in isolated sandboxes.
              </p>
            </div>

            <div className="glass-card glass-card-hover p-8 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-outfit">Anti-Cheat Sync</h3>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                Server-synced countdown timer and live opponent status indicators eliminate client-clock cheating.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
