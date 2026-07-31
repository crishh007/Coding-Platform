import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import client from '../../api/client';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { ThumbsUp, ThumbsDown, Star, ChevronLeft, Play, Send, History, CheckCircle, XCircle, Clock, Zap, RotateCcw } from 'lucide-react';
import './practice.css';
import ProblemDiscussion from './components/ProblemDiscussion';
import { MessageSquare } from 'lucide-react';
// ─────────────────────────────────────────────
// Language starter templates (complete program style)
// ─────────────────────────────────────────────
const TEMPLATES = {
  python: `# ✅ Write a COMPLETE Python program.
# Read input from stdin, print output to stdout.
# All problems on this platform use standard I/O.
#
# Tip: Check the "Examples" tab on the left panel
# to see the expected input/output format.
#
import sys

def solve():
    data = sys.stdin.read().split()
    # TODO: parse your input and write your logic here
    print("your_answer")

solve()
`,
  javascript: `// ✅ Write a COMPLETE JavaScript program.
// Read from stdin, print to stdout.
//
const lines = require('fs').readFileSync(0, 'utf-8').trim().split('\\n');
let idx = 0;

// TODO: parse lines[idx++] for your input
// Example: const nums = lines[idx++].split(' ').map(Number);

console.log("your_answer");
`,
  java: `// ✅ Write a COMPLETE Java program.
// Class must be named "Main".
//
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // TODO: read input using sc.nextLine(), sc.nextInt() etc.
        // Example: int n = sc.nextInt();
        System.out.println("your_answer");
    }
}
`,
  cpp: `// ✅ Write a COMPLETE C++ program.
// Read from cin, print to cout.
//
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // TODO: read input and write logic
    // Example: int n; cin >> n;
    cout << "your_answer" << endl;
    return 0;
}
`,
  c: `// ✅ Write a COMPLETE C program.
//
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // TODO: use scanf/printf for input/output
    printf("your_answer\\n");
    return 0;
}
`,
  go: `// ✅ Write a COMPLETE Go program.
//
package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    // TODO: read input using fmt.Fscan(reader, &x)
    _ = reader
    fmt.Println("your_answer")
}
`,
};

const LANG_LABELS = {
  python: 'Python 3',
  javascript: 'JavaScript',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  go: 'Go',
};

const LANG_MONACO = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
};

// ─────────────────────────────────────────────
// Status colors
// ─────────────────────────────────────────────
const statusColor = (s) => {
  if (s === 'Accepted') return '#4ade80';
  if (s === 'Wrong Answer') return '#f87171';
  if (s === 'Compilation Error') return '#fb923c';
  if (s === 'Runtime Error') return '#f87171';
  if (s === 'Time Limit Exceeded') return '#facc15';
  return '#94a3b8';
};

export default function ProblemWorkspace() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contestId = queryParams.get('contestId');
  const isPreview = queryParams.get('preview') === 'true';

  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDark = theme === 'dark';

  const [problem, setProblem] = useState(null);
  const [contestData, setContestData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  // Editor
  const [language, setLanguage] = useState('python');
  const [codeMap, setCodeMap] = useState({ ...TEMPLATES });
  const code = codeMap[language] || '';
  const setCode = (val) => setCodeMap((prev) => ({ ...prev, [language]: val }));

  // Interaction
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Run (single test case)
  const [runOutput, setRunOutput] = useState('');
  const [runStatus, setRunStatus] = useState('');
  const [runError, setRunError] = useState('');
  const [runTime, setRunTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  // Submit (all test cases)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);

  // Past submissions
  const [submissions, setSubmissions] = useState([]);

  // Auto-submit flag for contest
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  useEffect(() => {
    client.get(`/problems/${id}`)
      .then((data) => {
        setProblem(data);
        if (data && data.title) {
          document.title = `${data.title} - Practice | CodeMastery`;
        }
      })
      .catch((err) => console.error('Failed to load problem:', err));

    if (contestId) {
      client.get(`/contests/${contestId}`)
        .then((data) => {
          if (data && data.endTime) {
            setContestData(data);
            const endTime = new Date(data.endTime).getTime();
            setTimeLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
          }
        })
        .catch(console.error);
    }

    const stored = JSON.parse(localStorage.getItem(`submissions_${id}`) || '[]');
    setSubmissions(stored);
  }, [id, contestId]);
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  // Load last submission into editor on mount
  useEffect(() => {
    if (submissions.length > 0 && problem) {
      const last = submissions[0];
      if (last.code && !window.hasLoadedLastCode) {
        window.hasLoadedLastCode = true;
        setLanguage(last.language || 'python');
        setCodeMap(prev => ({ ...prev, [last.language || 'python']: last.code }));
        
        if (last.passed !== undefined && last.total !== undefined) {
          setSubmitResult({
             status: last.status,
             timeMs: parseInt(last.time) || 0,
             passed: last.passed,
             total: last.total,
             results: [],
             error: ''
          });
          setShowSubmitModal(true);
        }
      }
    }
  }, [submissions, problem]);

  // Anti-Cheat logic
  useEffect(() => {
    if (!contestId || isLocked || isPreview) return;
    
    let hasReportedPaste = false;
    let hasReportedTabSwitch = false;

    const reportViolation = (type) => {
      client.post('/violations', {
         contestId: contestId,
         type: type,
         description: `User triggered ${type} during problem ${problem?.title || id}`,
         severity: type === 'tab-switch' ? 'medium' : 'high',
      }).catch(() => {});
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasReportedTabSwitch) {
        hasReportedTabSwitch = true;
        reportViolation('tab-switch');
      }
    };

    const handlePaste = () => {
       if (!hasReportedPaste) {
           hasReportedPaste = true;
           reportViolation('code-paste');
       }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('paste', handlePaste);
    };
  }, [contestId, isLocked, isPreview, problem, id]);

  const formatTime = (t) => {
    if (t === null) return '';
    const h = String(Math.floor(t / 3600)).padStart(2, '0');
    const m = String(Math.floor((t % 3600) / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const isLocked = timeLeft === 0 && contestId;

  const saveSubmission = useCallback((status, time, lang, codeContent, passed, total) => {
    const sub = { 
      date: new Date().toLocaleString(), 
      status, 
      time: time || 'N/A', 
      language: lang,
      code: codeContent,
      passed,
      total
    };
    setSubmissions((prev) => {
      const next = [sub, ...prev];
      localStorage.setItem(`submissions_${id}`, JSON.stringify(next));
      return next;
    });
    if (status === 'Accepted' && problem) {
      // Save to localStorage
      const solved = JSON.parse(localStorage.getItem('solved_problems') || '[]');
      if (!solved.includes(problem.id)) {
        solved.push(problem.id);
        localStorage.setItem('solved_problems', JSON.stringify(solved));
      }
      // Save to MongoDB if logged in
      if (user) {
        client.post(`/user/problems/${problem.id}/solve`, { language: lang }).catch(() => {});
      }
    }
  }, [id, problem, user]);

  // ── Run (single test case) ──
  const handleRun = useCallback(async () => {
    if (!problem || isRunning) return;
    setIsRunning(true);
    setRunStatus('Judging');
    setRunOutput('');
    setRunError('');
    setRunTime('');
    setShowConsole(true);

    const tc = problem.testCases?.[activeTestCaseTab];
    try {
      const res = await client.post('/judge/execute', {
        problemId: problem.id,
        language,
        code,
        input: tc?.input || '',
      });

      const output = res.output || '';
      const error = res.error || '';
      const elapsed = res.timeMs ? `${res.timeMs}ms` : 'N/A';

      if (error) {
        setRunStatus('Error');
        setRunError(error);
        setRunTime(elapsed);
        saveSubmission('Runtime Error', elapsed, language, code, null, null);
      } else {
        const expected = (tc?.output || '').trim();
        const actual = output.trim();
        const passed = actual === expected;
        const finalStatus = passed ? 'Accepted' : 'Wrong Answer';
        setRunStatus(finalStatus);
        setRunOutput(output);
        setRunTime(elapsed);
        saveSubmission(finalStatus, elapsed, language, code, null, null);
      }
    } catch (err) {
      setRunStatus('Error');
      setRunError(err?.response?.data?.error || err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  }, [problem, isRunning, language, code, activeTestCaseTab, saveSubmission]);

  // ── Submit (all test cases) ──
  const handleSubmit = async () => {
    if (!problem || isSubmitting) return;
    setIsSubmitting(true);
    setShowSubmitModal(true);
    setSubmitProgress(0);
    setSubmitResult(null);

    // Fake progress animation
    const interval = setInterval(() => {
      setSubmitProgress((p) => (p >= 85 ? 85 : p + 15));
    }, 300);

    try {
      const payload = {
        problemId: problem.id,
        language,
        code,
      };
      
      if (contestId) {
        payload.contestId = contestId;
      }

      const res = await client.post('/judge/submit', payload);

      clearInterval(interval);
      setSubmitProgress(100);
      setTimeout(() => {
        setSubmitResult(res);
        saveSubmission(res.status, `${res.timeMs}ms`, language, code, res.passed, res.total);
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setSubmitProgress(100);
      setTimeout(() => {
        setSubmitResult({
          status: 'Error',
          error: err?.response?.data?.error || err.message || 'Submission failed',
          passed: 0,
          total: 0,
          results: [],
        });
      }, 400);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (timeLeft === 0 && !autoSubmitted && !isRunning && contestId) {
      setAutoSubmitted(true);
      handleRun();
    }
  }, [timeLeft, autoSubmitted, isRunning, handleRun, contestId]);

  if (!problem) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--pr-text-secondary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--pr-primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          Loading problem...
        </div>
      </div>
    );
  }

  return (
    <div className={`pr-theme ${!isDark ? 'light-mode' : ''} pr-workspace-container`}>

      {/* ── Left Pane ── */}
      <div className="pr-pane left" style={isPreview ? { flex: 'none', width: '100%', maxWidth: '900px', margin: '0 auto', borderRight: '1px solid var(--pr-border-color)', borderLeft: '1px solid var(--pr-border-color)' } : {}}>
        <div className="pr-pane-header">
          {isPreview ? (
            <button className="pr-back-btn" onClick={() => window.history.back()} title="Back to Contest">
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <Link to={contestId ? `/contests/${contestId}/arena` : '/practice'} className="pr-back-btn">
              <ChevronLeft size={20} />
            </Link>
          )}
          <span className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</span>
          <span className={activeTab === 'submissions' ? 'active' : ''} onClick={() => setActiveTab('submissions')}>
            <History size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Submissions
          </span>
          <span className={activeTab === 'discussions' ? 'active' : ''} onClick={() => setActiveTab('discussions')}>
            <MessageSquare size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Discussions
          </span>
        </div>

        {/* Contest Timer */}
        {contestId && timeLeft !== null && (
          <div style={{ background: isLocked ? 'rgba(239,68,68,0.1)' : 'var(--primary-glow)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isLocked ? '#f87171' : 'var(--primary)' }}>
            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} />{isLocked ? 'Contest Ended' : 'Time Remaining'}
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>
              {isLocked ? '00:00:00' : formatTime(timeLeft)}
            </div>
          </div>
        )}

        <div className="pr-pane-content">
          {/* ── Description Tab ── */}
          {activeTab === 'description' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="pr-problem-title">{problem.title}</h1>
              </div>

              <div className="pr-problem-meta" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className={`pr-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--pr-text-secondary)', fontSize: '0.85rem' }}>
                  <button className={`pr-interact-btn ${isLiked ? 'active' : ''}`} onClick={() => { setIsLiked(!isLiked); setIsDisliked(false); }}>
                    <ThumbsUp size={14} /> {problem.likes + (isLiked ? 1 : 0)}
                  </button>
                  <button className={`pr-interact-btn ${isDisliked ? 'active' : ''}`} onClick={() => { setIsDisliked(!isDisliked); setIsLiked(false); }}>
                    <ThumbsDown size={14} /> {problem.dislikes + (isDisliked ? 1 : 0)}
                  </button>
                  <button className={`pr-interact-btn ${isStarred ? 'active' : ''}`} onClick={() => setIsStarred(!isStarred)}>
                    <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              <div className="pr-problem-desc">{problem.description}</div>

              <div className="examples">
                {problem.examples && problem.examples.map((ex, i) => (
                  <div key={i}>
                    <p><strong>Example {i + 1}:</strong></p>
                    <div className="pr-example-box">{ex}</div>
                  </div>
                ))}
              </div>

              {/* Input / Output Format hint */}
              <div style={{ marginTop: '2rem', background: 'rgba(99,179,237,0.06)', border: '1px solid rgba(99,179,237,0.2)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--pr-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Zap size={13} /> How to write your solution
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--pr-text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  Write a <strong>complete program</strong> that reads input from <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0 4px', borderRadius: 3 }}>stdin</code> and prints your answer to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0 4px', borderRadius: 3 }}>stdout</code>.
                  The template in the editor already handles the boilerplate — just replace the <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0 4px', borderRadius: 3 }}>TODO</code> sections.
                </p>
              </div>

              {/* Topics */}
              {problem.topics && problem.topics.length > 0 && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--pr-border-color)', paddingTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--pr-text-secondary)', marginBottom: '0.5rem' }}>Topics</h4>
                  <div className="pr-topic-tags">
                    {problem.topics.map((t, idx) => (
                      <span key={idx} className="pr-topic-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Submissions Tab ── */}
          {activeTab === 'submissions' && (
            <div className="pr-submissions-tab">
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--pr-text-secondary)', marginTop: '3rem' }}>
                  <History size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p>No submissions yet.</p>
                </div>
              ) : (
                <table className="pr-problems-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Runtime</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={i}>
                        <td style={{ color: statusColor(s.status), fontWeight: 600 }}>{s.status}</td>
                        <td>{LANG_LABELS[s.language] || s.language}</td>
                        <td>{s.time}</td>
                        <td style={{ color: 'var(--pr-text-secondary)', fontSize: '0.85rem' }}>{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Discussions Tab ── */}
          {activeTab === 'discussions' && (
            <div className="pr-discussions-tab" style={{ height: '100%', overflowY: 'auto' }}>
              <ProblemDiscussion problemId={id} />
            </div>
          )}
        </div>
      </div>

      {/* ── Right Pane ── */}
      {!isPreview && (
        <div className="pr-pane" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <div className="pr-editor-toolbar">
            <select className="pr-lang-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {Object.entries(LANG_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <div className="pr-editor-actions">
              <button
                className="pr-btn"
                title="Reset to starter template"
                onClick={() => {
                  if (window.confirm('Reset code to the starter template? Your current code will be lost.')) {
                    setCode(TEMPLATES[language]);
                  }
                }}
                style={{ padding: '0.4rem 0.65rem' }}
              >
                <RotateCcw size={14} />
              </button>
              <button className="pr-btn" onClick={handleRun} disabled={isRunning || isLocked}>
                <Play size={14} /> {isRunning ? 'Running...' : 'Run'}
              </button>
              <button className="pr-btn primary" onClick={handleSubmit} disabled={isSubmitting || isLocked}>
                <Send size={14} /> {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="pr-pane-content no-pad" style={{ flex: 1 }}>
            <Editor
              height="100%"
              theme={isDark ? 'vs-dark' : 'light'}
              language={LANG_MONACO[language] || language}
              value={code}
              onChange={(val) => setCode(val)}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 }, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
            />
          </div>

          {/* Console / Testcase Panel */}
          <div className="pr-console-panel" style={{ height: showConsole ? '280px' : '42px', transition: 'height 0.25s ease', display: 'flex', flexDirection: 'column' }}>
            <div className="pr-console-header">
              <span style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowConsole(!showConsole)}>
                {showConsole ? '▼' : '▲'} Testcases &amp; Console
              </span>
              {runStatus && (
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: statusColor(runStatus) }}>
                  {runStatus} {runTime && <span style={{ fontWeight: 400, color: 'var(--pr-text-secondary)', marginLeft: '0.5rem' }}>{runTime}</span>}
                </span>
              )}
            </div>

            {showConsole && (
              <div className="pr-console-body" style={{ flex: 1, overflowY: 'auto' }}>
                <div className="pr-tc-tabs">
                  {problem.testCases && problem.testCases.slice(0, 3).map((tc, idx) => (
                    <button
                      key={idx}
                      className={`pr-tc-tab ${activeTestCaseTab === idx ? 'active' : ''}`}
                      onClick={() => setActiveTestCaseTab(idx)}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                  {problem.testCases && problem.testCases.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--pr-text-secondary)', alignSelf: 'center', marginLeft: '0.5rem', fontStyle: 'italic' }}>
                      + {problem.testCases.length - 3} hidden cases (tested on Submit)
                    </span>
                  )}
                </div>

                <div className="pr-tc-content" style={{ marginTop: '1rem' }}>
                  {problem.testCases?.[activeTestCaseTab] && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pr-text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Input</div>
                        <pre className="pr-example-box" style={{ margin: 0, padding: '0.5rem', fontSize: '0.85rem' }}>
                          {problem.testCases[activeTestCaseTab].input}
                        </pre>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--pr-text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>Expected</div>
                        <pre className="pr-example-box" style={{ margin: 0, padding: '0.5rem', fontSize: '0.85rem' }}>
                          {problem.testCases[activeTestCaseTab].output}
                        </pre>
                      </div>
                      {runStatus && runStatus !== 'Judging' && (
                        <div>
                          <div style={{ fontSize: '0.75rem', marginBottom: '0.3rem', fontWeight: 600, color: statusColor(runStatus) }}>
                            Your Output
                          </div>
                          <pre className="pr-example-box" style={{ margin: 0, padding: '0.5rem', fontSize: '0.85rem', background: (runStatus === 'Accepted') ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)', borderColor: (runStatus === 'Accepted') ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)' }}>
                            {runError || runOutput || '—'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {runStatus === 'Judging' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', color: 'var(--pr-text-secondary)' }}>
                    <div style={{ width: 16, height: 16, border: '2px solid var(--pr-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Running your code...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Submit Modal ── */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'var(--pr-bg-secondary)', border: '1px solid var(--pr-border-color)', borderRadius: '16px', padding: '2.5rem', width: '90%', maxWidth: '560px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowSubmitModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--pr-text-secondary)', cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>

            {!submitResult ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 52, height: 52, border: '4px solid var(--pr-border-color)', borderTopColor: 'var(--pr-primary)', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
                <h2 style={{ marginBottom: '1.25rem' }}>Evaluating All Test Cases...</h2>
                <div style={{ background: 'var(--pr-bg-main)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${submitProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--pr-primary), #818cf8)', transition: 'width 0.3s ease' }} />
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--pr-text-secondary)', marginTop: '0.75rem' }}>
                  Running {problem.testCases?.length || 0} test cases...
                </p>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: statusColor(submitResult.status), textShadow: `0 0 20px ${statusColor(submitResult.status)}55` }}>
                    {submitResult.status === 'Accepted' ? '🎉 Accepted!' : submitResult.status}
                  </h1>
                  <p style={{ color: 'var(--pr-text-secondary)', marginTop: '0.25rem' }}>
                    {submitResult.passed} / {submitResult.total} test cases passed &nbsp;·&nbsp; {submitResult.timeMs}ms total
                  </p>
                </div>

                {submitResult.status === 'Accepted' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Runtime', value: `${submitResult.timeMs}ms` },
                      { label: 'Test Cases', value: `${submitResult.passed}/${submitResult.total}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--pr-bg-main)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--pr-text-secondary)', marginBottom: '0.3rem' }}>{label}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--pr-text-main)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Per test case breakdown */}
                {submitResult.results && submitResult.results.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--pr-text-secondary)', marginBottom: '0.75rem' }}>Test Case Results</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {submitResult.results.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: r.passed ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)', border: `1px solid ${r.passed ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
                          {r.passed
                            ? <CheckCircle size={16} color="#4ade80" />
                            : <XCircle size={16} color="#f87171" />}
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 70 }}>Case {r.caseIndex}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--pr-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.error ? r.error : (r.passed ? '✓ Correct' : `Expected: ${r.expected} | Got: ${r.actual}`)}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--pr-text-secondary)', whiteSpace: 'nowrap' }}>{r.timeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error block */}
                {submitResult.error && (
                  <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.82rem', color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{submitResult.error}</pre>
                  </div>
                )}

                <button className="pr-btn primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} onClick={() => setShowSubmitModal(false)}>
                  {submitResult.status === 'Accepted' ? 'Continue →' : 'Back to Editor'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
