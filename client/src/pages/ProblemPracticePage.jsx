import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MonacoEditorWrapper from '../components/Editor/MonacoEditor';
import { ArrowLeft, Play, Send, Code2, CheckCircle, XCircle, Terminal, Loader2 } from 'lucide-react';

const DEFAULT_TEMPLATES = {
  javascript: `// Solo Practice Mode
function solution(input) {
  console.log("0 1");
}
`,
  python: `# Solo Practice Mode
import sys

def main():
    print("0 1")

if __name__ == "__main__":
    main()
`,
  cpp: `// Solo Practice Mode
#include <iostream>
using namespace std;

int main() {
    cout << "0 1" << endl;
    return 0;
}
`,
  java: `// Solo Practice Mode
public class Main {
    public static void main(String[] args) {
        System.out.println("0 1");
    }
}
`,
};

export default function ProblemPracticePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_TEMPLATES.javascript);
  const [activeTab, setActiveTab] = useState('problem');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verdictResult, setVerdictResult] = useState(null);

  useEffect(() => {
    fetchProblemDetail();
  }, [id]);

  const fetchProblemDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/problems/${id}`);
      if (res.success) {
        setProblem(res.data);
      }
    } catch (err) {
      console.error('Failed to load problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_TEMPLATES[lang] || DEFAULT_TEMPLATES.javascript);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await api.post('/submissions', {
        problemId: id,
        language,
        code,
      });

      if (res.success && res.data) {
        setVerdictResult(res.data);
        setActiveTab('console');
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 glass-nav px-4 flex items-center justify-between z-10 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/problems')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-extrabold text-slate-800 font-outfit text-base">
            {problem?.title || 'Solo Practice'}
          </h1>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Practice Mode
          </span>
        </div>
      </header>

      {/* Split Pane */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Pane: Description */}
        <div className="w-1/2 flex flex-col glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-md">
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'problem' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'console' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-500'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console Results</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === 'problem' ? (
              loading ? (
                <div className="py-20 text-center text-slate-400">Loading problem details...</div>
              ) : (
                <div className="space-y-6 text-slate-800">
                  <div>
                    <h2 className="text-2xl font-extrabold font-outfit text-slate-900">{problem?.title}</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize mt-2 inline-block">
                      {problem?.difficulty}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-line">
                    {problem?.description}
                  </div>

                  {problem?.sample_input && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sample Input</h4>
                        <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl">
                          {problem.sample_input}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sample Output</h4>
                        <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl">
                          {problem.sample_output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Submission Verdict</h3>
                {verdictResult ? (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${
                      verdictResult.verdict === 'AC' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="font-extrabold text-base">{verdictResult.verdict}</div>
                      <div className="text-xs font-medium">Passed {verdictResult.tests_passed} / {verdictResult.tests_total}</div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">Submit code to view console results.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor */}
        <div className="w-1/2 flex flex-col glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-md">
          <div className="h-12 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <div className="flex-1 relative">
            <MonacoEditorWrapper language={language} value={code} onChange={setCode} />
          </div>

          <div className="h-14 bg-white border-t border-slate-200 px-4 flex items-center justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="py-2 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Solution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
