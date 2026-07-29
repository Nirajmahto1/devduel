import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { ShieldAlert, Plus, Trash2, Edit3, Check, X, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Problem Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [tagsInput, setTagsInput] = useState('arrays, strings');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [timeLimitMs, setTimeLimitMs] = useState(2000);
  const [testCases, setTestCases] = useState([
    { input: '', expected_output: '', is_sample: true },
  ]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminProblems();
  }, []);

  const fetchAdminProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/problems?limit=50');
      if (res.success) {
        setProblems(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCaseField = () => {
    setTestCases([...testCases, { input: '', expected_output: '', is_sample: false }]);
  };

  const handleRemoveTestCaseField = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await api.post('/problems', {
        title,
        description,
        difficulty,
        tags,
        input_format: inputFormat,
        output_format: outputFormat,
        sample_input: sampleInput,
        sample_output: sampleOutput,
        time_limit_ms: parseInt(timeLimitMs, 10),
        test_cases: testCases,
      });

      if (res.success) {
        setModalOpen(false);
        fetchAdminProblems();
        resetForm();
      }
    } catch (err) {
      setError(err.message || 'Failed to create problem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) return;
    try {
      const res = await api.delete(`/problems/${id}`);
      if (res.success) {
        setProblems(problems.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete problem');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDifficulty('easy');
    setTagsInput('arrays, strings');
    setInputFormat('');
    setOutputFormat('');
    setSampleInput('');
    setSampleOutput('');
    setTimeLimitMs(2000);
    setTestCases([{ input: '', expected_output: '', is_sample: true }]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="glass-card p-8 rounded-3xl border border-white/80 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Management Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Problem & Platform Administration</h1>
          </div>

          <button
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Problem</span>
          </button>
        </div>

        {/* Problems Table */}
        <div className="glass-card rounded-3xl border border-white/80 overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400">Loading admin data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-4">Difficulty</th>
                    <th className="py-4 px-4">Tags</th>
                    <th className="py-4 px-4">Time Limit</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {problems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-4 px-6 font-bold text-slate-800">{p.title}</td>
                      <td className="py-4 px-4 capitalize font-bold text-xs">{p.difficulty}</td>
                      <td className="py-4 px-4 text-xs text-slate-500">{p.tags?.join(', ')}</td>
                      <td className="py-4 px-4 text-xs font-mono">{p.time_limit_ms}ms</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteProblem(p.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Problem Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-6 rounded-3xl shadow-2xl border border-white/80 my-8">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 font-outfit">Create Algorithmic Problem</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">{error}</div>}

            <form onSubmit={handleCreateProblem} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Reverse Linked List"
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Markdown Description</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Problem description in markdown..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Input</label>
                  <textarea
                    rows={2}
                    value={sampleInput}
                    onChange={(e) => setSampleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sample Output</label>
                  <textarea
                    rows={2}
                    value={sampleOutput}
                    onChange={(e) => setSampleOutput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Test Cases Builder */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-slate-700">Test Cases</span>
                  <button
                    type="button"
                    onClick={handleAddTestCaseField}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Add Test Case
                  </button>
                </div>

                {testCases.map((tc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-600">
                      <span>Test Case #{idx + 1}</span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCaseField(idx)}
                          className="text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Expected Output"
                        value={tc.expected_output}
                        onChange={(e) => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
                >
                  {submitting ? 'Creating...' : 'Create Problem'}
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
