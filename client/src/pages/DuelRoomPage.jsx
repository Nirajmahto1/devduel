import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import MonacoEditorWrapper from '../components/Editor/MonacoEditor';
import VerdictModal from '../components/Duel/VerdictModal';
import {
  Swords,
  Timer,
  Play,
  Send,
  Code2,
  CheckCircle,
  XCircle,
  User,
  Terminal,
  Loader2,
  FileText,
} from 'lucide-react';

const CODE_TEMPLATES = {
  javascript: `// Write your solution here
function solution(input) {
  // Read input and print output to stdout
  console.log("0 1");
}
`,
  python: `# Write your solution in Python 3
import sys

def main():
    lines = sys.stdin.read().splitlines()
    print("0 1")

if __name__ == "__main__":
    main()
`,
  cpp: `// Write your solution in C++
#include <iostream>
using namespace std;

int main() {
    cout << "0 1" << endl;
    return 0;
}
`,
  java: `// Write your solution in Java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("0 1");
    }
}
`,
};

export default function DuelRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  // Match State
  const [problem, setProblem] = useState(null);
  const [players, setPlayers] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(1800);
  const [opponentStatus, setOpponentStatus] = useState('idle');

  // Mobile View Switcher (problem or editor)
  const [mobileActivePane, setMobileActivePane] = useState('editor');

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(CODE_TEMPLATES.javascript);
  const [activeTab, setActiveTab] = useState('problem'); // problem, console

  // Execution & Verdict State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdictResult, setVerdictResult] = useState(null);
  const [matchEndResult, setMatchEndResult] = useState(null);
  const [verdictModalOpen, setVerdictModalOpen] = useState(false);

  useEffect(() => {
    fetchMatchDetails();
  }, [roomId]);

  const fetchMatchDetails = async () => {
    try {
      const res = await api.get(`/matches/${roomId}`);
      if (res.success && res.data) {
        if (res.data.duration_seconds) {
          setSecondsRemaining(res.data.duration_seconds);
        }
      }
    } catch (err) {
      console.error('Failed to load match details:', err);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join duel room
    socket.emit('room:join', { roomId, userId: user?.id });

    // ─── Socket Event Listeners ───────────────────────
    socket.on('room:info', (data) => {
      if (data.problem) setProblem(data.problem);
      if (data.players) setPlayers(data.players);
      const initSecs = data.secondsRemaining || data.durationSeconds;
      if (initSecs) setSecondsRemaining(initSecs);
    });

    socket.on('room:ready', (data) => {
      if (data.problem) setProblem(data.problem);
      if (data.players) setPlayers(data.players);
      if (data.durationSeconds) setSecondsRemaining(data.durationSeconds);
    });

    socket.on('room:countdown', (data) => {
      setSecondsRemaining(data.secondsRemaining);
    });

    socket.on('opponent:update', (data) => {
      if (data.userId !== user?.id) {
        setOpponentStatus(data.status);
      }
    });

    socket.on('code:verdict', (data) => {
      setIsRunning(false);
      setIsSubmitting(false);
      setVerdictResult(data);
      setActiveTab('console');
    });

    socket.on('match:end', (data) => {
      setIsRunning(false);
      setIsSubmitting(false);
      setMatchEndResult(data);
      setVerdictModalOpen(true);
    });

    socket.on('room:error', (err) => {
      setIsRunning(false);
      setIsSubmitting(false);
      console.error('[Room Error]:', err.message);
    });

    return () => {
      socket.emit('room:leave', { roomId });
      socket.off('room:info');
      socket.off('room:ready');
      socket.off('room:countdown');
      socket.off('opponent:update');
      socket.off('code:verdict');
      socket.off('match:end');
      socket.off('room:error');
    };
  }, [socket, isConnected, roomId, user]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(CODE_TEMPLATES[newLang] || CODE_TEMPLATES.javascript);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (socket) {
      socket.emit('opponent:status', { roomId, status: 'typing' });
    }
  };

  const handleRunSampleCode = () => {
    if (!socket || isRunning || isSubmitting) return;
    setIsRunning(true);
    socket.emit('code:run', { roomId, language, code });
  };

  const handleSubmitCode = () => {
    if (!socket || isRunning || isSubmitting) return;
    setIsSubmitting(true);
    socket.emit('code:submit', { roomId, language, code });
  };

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const opponentInfo = players?.player1?.userId === user?.id ? players?.player2 : players?.player1;

  return (
    <div className="h-screen flex flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="h-14 glass-nav px-3 sm:px-4 flex items-center justify-between z-10 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <Swords className="w-4 h-4" />
          </div>
          <h1 className="font-extrabold text-slate-800 font-outfit text-xs sm:text-base max-w-[120px] sm:max-w-none truncate">
            {problem?.title || '1v1 Duel'}
          </h1>
          {problem && (
            <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize border border-emerald-200">
              {problem.difficulty}
            </span>
          )}
        </div>

        {/* Center Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-extrabold text-sm sm:text-base shadow-sm ${
            secondsRemaining < 300
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>

        {/* Right Opponent Status Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
            <User className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-700 max-w-[70px] sm:max-w-[100px] truncate text-[11px] sm:text-xs">
              {opponentInfo?.username || 'Opponent'}
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-slate-500 font-bold capitalize hidden sm:inline-block">
              {opponentStatus}
            </span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Leave
          </button>
        </div>
      </header>

      {/* Mobile Screen Switcher Bar (Visible on mobile/tablet screens) */}
      <div className="lg:hidden flex bg-white border-b border-slate-200 px-2 py-1 text-xs font-bold text-slate-600 shrink-0">
        <button
          onClick={() => setMobileActivePane('problem')}
          className={`flex-1 py-1.5 text-center rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobileActivePane === 'problem' ? 'bg-indigo-50 text-indigo-600 font-extrabold' : 'hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Problem Info</span>
        </button>
        <button
          onClick={() => setMobileActivePane('editor')}
          className={`flex-1 py-1.5 text-center rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            mobileActivePane === 'editor' ? 'bg-indigo-50 text-indigo-600 font-extrabold' : 'hover:bg-slate-50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Code Editor</span>
        </button>
      </div>

      {/* Main Responsive Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3 min-h-0">
        {/* Left Pane: Problem Description & Sample Cases / Console */}
        <div
          className={`w-full lg:w-1/2 flex-col glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-md min-h-0 ${
            mobileActivePane === 'problem' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Tab Controls */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 shrink-0">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-3 sm:px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'problem'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Problem Description
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3 sm:px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'console'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console & Verdict</span>
              {verdictResult && (
                <span
                  className={`w-2 h-2 rounded-full ${
                    verdictResult.verdict === 'AC' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              )}
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white min-h-0">
            {activeTab === 'problem' ? (
              problem ? (
                <div className="space-y-6 text-slate-800">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-outfit text-slate-900">{problem.title}</h2>
                    <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                      <span>Time Limit: {problem.time_limit_ms || 2000}ms</span>
                      <span>•</span>
                      <span>Memory: {Math.round((problem.memory_limit_kb || 256000) / 1024)}MB</span>
                    </div>
                  </div>

                  {/* Markdown Description */}
                  <div className="prose prose-sm max-w-none text-slate-700 font-sans leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm">
                    {problem.description}
                  </div>

                  {problem.input_format && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Input Format</h4>
                      <div className="text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {problem.input_format}
                      </div>
                    </div>
                  )}

                  {problem.output_format && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Output Format</h4>
                      <div className="text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {problem.output_format}
                      </div>
                    </div>
                  )}

                  {problem.sample_input && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sample Input</h4>
                        <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl overflow-x-auto">
                          {problem.sample_input}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Sample Output</h4>
                        <pre className="text-xs font-mono bg-slate-900 text-emerald-400 p-3 rounded-xl overflow-x-auto">
                          {problem.sample_output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-sm font-medium">Waiting for opponent & initializing duel room...</p>
                </div>
              )
            ) : (
              /* Console & Verdict Tab */
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Execution Results</h3>
                {verdictResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        verdictResult.verdict === 'AC'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {verdictResult.verdict === 'AC' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-600" />
                        )}
                        <div>
                          <div className="font-extrabold text-base">{verdictResult.verdict}</div>
                          <div className="text-xs font-medium opacity-90">
                            Passed {verdictResult.testsPassed} / {verdictResult.testsTotal} test cases
                          </div>
                        </div>
                      </div>
                    </div>

                    {verdictResult.testResults?.map((tr, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                        <div className="flex justify-between font-bold text-slate-700">
                          <span>Test Case #{idx + 1}</span>
                          <span className={tr.verdict === 'AC' ? 'text-emerald-600' : 'text-rose-600'}>
                            {tr.verdict}
                          </span>
                        </div>
                        {tr.actualOutput && (
                          <div className="text-slate-600">Actual: {tr.actualOutput}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Run sample tests or submit solution to view execution output here.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Monaco Editor & Controls */}
        <div
          className={`w-full lg:w-1/2 flex-col glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-md min-h-0 ${
            mobileActivePane === 'editor' ? 'flex flex-1' : 'hidden lg:flex'
          }`}
        >
          {/* Editor Header Bar */}
          <div className="h-12 bg-slate-50 border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="cpp">C++ (GCC 9.2)</option>
                <option value="java">Java (OpenJDK 13)</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">VS Code Engine</div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative min-h-0">
            <MonacoEditorWrapper
              language={language}
              value={code}
              onChange={handleCodeChange}
            />
          </div>

          {/* Footer Controls */}
          <div className="h-14 bg-white border-t border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleRunSampleCode}
              disabled={isRunning || isSubmitting}
              className="py-2 px-3 sm:px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-slate-700" />}
              <span>Run Sample</span>
            </button>

            <button
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              className="py-2 px-4 sm:px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-200 flex items-center gap-1.5 sm:gap-2 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit Solution</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post Match Result Modal */}
      <VerdictModal
        isOpen={verdictModalOpen}
        result={matchEndResult}
        currentUserId={user?.id}
        onClose={() => setVerdictModalOpen(false)}
      />
    </div>
  );
}
