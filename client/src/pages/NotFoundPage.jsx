import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, Home } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-10 rounded-3xl border border-white/80 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-100">
            <Swords className="w-10 h-10" />
          </div>

          <h1 className="text-6xl font-extrabold text-indigo-900 font-outfit">404</h1>
          <h2 className="text-xl font-bold text-slate-800 mt-2">Arena Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            The duel room or page you are looking for does not exist or has expired.
          </p>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
