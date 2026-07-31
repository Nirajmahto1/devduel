import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { BookOpen, Search, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProblemBankPage() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems(1);
  }, [difficulty]);

  const fetchProblems = async (page = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ page, limit: 10 });
      if (difficulty) queryParams.append('difficulty', difficulty);

      const res = await api.get(`/problems?${queryParams.toString()}`);
      if (res.success) {
        setProblems(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Title */}
        <div className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Curated Problem Bank</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Practice & Speedcoding Library</h1>
            <p className="text-sm text-slate-500 mt-1">Explore algorithmic problems tagged by topic and difficulty.</p>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="glass-card p-4 rounded-2xl border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-800"
            />
          </div>

          {/* Difficulty Tabs */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            {['', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  difficulty === d
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {d === '' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List Table */}
        <div className="glass-card rounded-3xl border border-white/80 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading problem bank...</div>
          ) : filteredProblems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-medium">No problems found matching criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Problem Title</th>
                    <th className="py-4 px-4">Difficulty</th>
                    <th className="py-4 px-4">Tags</th>
                    <th className="py-4 px-4">Time Limit</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredProblems.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/practice/${p.id}`)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                          <span>{p.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.description}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${
                            p.difficulty === 'easy'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.difficulty === 'medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {p.tags?.map((t) => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                        {p.time_limit_ms || 2000}ms
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/practice/${p.id}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-indigo-700" />
                          <span>Solve</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fetchProblems(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => fetchProblems(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
