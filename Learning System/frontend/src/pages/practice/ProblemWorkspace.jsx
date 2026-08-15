import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/client';
import { 
  ChevronLeft, 
  Play, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  History, 
  FileText, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Terminal, 
  Sparkles, 
  Code2, 
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './practice.css';

export default function ProblemWorkspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Left Pane Active Tab: 'description' | 'editorial' | 'submissions'
  const [activeTab, setActiveTab] = useState('description');

  // Interaction State
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Editor State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your solution here\n\ndef solution():\n    pass\n');

  // Starter Code templates for languages
  const starterTemplates = {
    python: '# Write your Python solution here\n\ndef solve(arr, target):\n    # TODO: implement\n    return []\n',
    cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}\n',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}\n',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your Go code here\n    fmt.Println("Hello SkillSync")\n}\n'
  };

  // Execution & Console State
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [execTime, setExecTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  // Submissions State
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/problems/${id}`)
      .then(res => {
        setProblem(res.data);
        setLoading(false);
        if (res.data?.starterCode?.[language]) {
          setCode(res.data.starterCode[language]);
        }
      })
      .catch(err => {
        console.error("Failed to load problem:", err);
        setLoading(false);
      });

    // Load past local submissions
    try {
      const stored = JSON.parse(localStorage.getItem(`submissions_${id}`) || '[]');
      setSubmissions(stored);
    } catch (e) {
      setSubmissions([]);
    }
  }, [id]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (starterTemplates[newLang]) {
      setCode(starterTemplates[newLang]);
    }
  };

  const handleRunCode = async (isSubmission = false) => {
    setIsRunning(true);
    setStatus('Running');
    setOutput('Executing code against test runner...');
    setShowConsole(true);
    setExecTime('');

    try {
      const activeTC = problem?.testCases?.[activeTestCaseTab];
      const res = await axios.post(`${API_BASE_URL}/execute`, {
        problemId: Number(id),
        language,
        code,
        input: activeTC ? activeTC.input : ''
      });

      const resStatus = res.data?.status || 'Executed';
      const resOutput = res.data?.output || res.data?.error || 'Execution completed with no stdout.';
      const resTime = res.data?.time || '18ms';

      setStatus(resStatus);
      setOutput(resOutput);
      setExecTime(resTime);

      // Save submission entry
      const sub = {
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'short', day: 'numeric' }),
        status: resStatus,
        time: resTime,
        language
      };
      const updatedSubs = [sub, ...submissions];
      setSubmissions(updatedSubs);
      localStorage.setItem(`submissions_${id}`, JSON.stringify(updatedSubs));

      // If accepted, record problem as solved
      if (resStatus === 'Accepted' || isSubmission) {
        try {
          const solvedIds = JSON.parse(localStorage.getItem('solved_problems') || '[]');
          if (!solvedIds.includes(Number(id))) {
            solvedIds.push(Number(id));
            localStorage.setItem('solved_problems', JSON.stringify(solvedIds));
          }
        } catch (e) {}
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Execution error';
      setStatus('Error');
      setOutput(errorMsg);
      setExecTime('N/A');

      const sub = {
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
        status: 'Runtime Error',
        time: 'N/A',
        language
      };
      const updatedSubs = [sub, ...submissions];
      setSubmissions(updatedSubs);
      localStorage.setItem(`submissions_${id}`, JSON.stringify(updatedSubs));
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', flexDirection: 'column', gap: '1rem' }}>
        <Code2 size={40} style={{ animation: 'spin 2s linear infinite', color: 'var(--primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Workspace IDE...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
        <h2>Problem Not Found</h2>
        <p style={{ margin: '1rem 0' }}>The requested problem #{id} does not exist or failed to load.</p>
        <Link to="/practice" className="practice-btn-primary">
          <ChevronLeft size={16} /> Return to Practice Arena
        </Link>
      </div>
    );
  }

  const diff = (problem.difficulty || 'Easy').toLowerCase();

  return (
    <div className="workspace-shell">
      
      {/* Top Workspace Header Bar */}
      <div className="workspace-top-bar">
        {/* Left: Breadcrumb & Title */}
        <div className="workspace-breadcrumbs">
          <Link to="/practice" className="workspace-back-btn" title="Back to Practice">
            <ChevronLeft size={18} />
          </Link>
          
          <h2 className="workspace-header-title">
            <span>{problem.id}.</span> {problem.title}
          </h2>

          <span className={`diff-badge ${diff}`} style={{ marginLeft: '0.25rem' }}>
            {problem.difficulty}
          </span>
        </div>

        {/* Center/Right: Interactions + Editor Actions */}
        <div className="workspace-top-actions">
          {/* Reaction Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.75rem' }}>
            <button 
              className="workspace-tab-btn"
              onClick={() => { setIsLiked(!isLiked); setIsDisliked(false); }}
              style={{ color: isLiked ? '#34d399' : undefined }}
              title="Like"
            >
              <ThumbsUp size={14} /> <span>{(problem.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>

            <button 
              className="workspace-tab-btn"
              onClick={() => { setIsDisliked(!isDisliked); setIsLiked(false); }}
              style={{ color: isDisliked ? '#f87171' : undefined }}
              title="Dislike"
            >
              <ThumbsDown size={14} />
            </button>

            <button 
              className="workspace-tab-btn"
              onClick={() => setIsStarred(!isStarred)}
              style={{ color: isStarred ? '#fbbf24' : undefined }}
              title="Star / Bookmark"
            >
              <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Language Selector */}
          <select 
            className="practice-select-glass"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="c">C (Clang)</option>
            <option value="java">Java 21</option>
            <option value="go">Go 1.24</option>
          </select>

          {/* Run Code Button */}
          <button 
            className="practice-btn-secondary"
            onClick={() => handleRunCode(false)}
            disabled={isRunning}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Play size={14} style={{ color: '#38bdf8' }} /> {isRunning ? 'Running...' : 'Run'}
          </button>

          {/* Submit Solution Button */}
          <button 
            className="practice-btn-primary"
            onClick={() => handleRunCode(true)}
            disabled={isRunning}
            style={{ padding: '0.5rem 1.1rem' }}
          >
            <Send size={14} /> Submit
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Grid */}
      <div className="workspace-panes-grid">
        
        {/* Left Pane: Description / Editorial / Submissions */}
        <div className="workspace-left-pane">
          
          {/* Tabs Header */}
          <div className="workspace-tabs-header">
            <button 
              className={`workspace-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              <FileText size={14} /> Description
            </button>

            <button 
              className={`workspace-tab-btn ${activeTab === 'editorial' ? 'active' : ''}`}
              onClick={() => setActiveTab('editorial')}
            >
              <Lightbulb size={14} /> Editorial & Hints
            </button>

            <button 
              className={`workspace-tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <History size={14} /> Submissions ({submissions.length})
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="workspace-pane-scroll">
            
            {/* Description Tab */}
            {activeTab === 'description' && (
              <>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                    {problem.id}. {problem.title}
                  </h1>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <span className={`diff-badge ${diff}`}>{problem.difficulty}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Acceptance: <strong style={{ color: '#ffffff' }}>{problem.acceptance || '55.0%'}</strong>
                    </span>
                  </div>

                  <div className="workspace-desc-text">
                    {problem.description}
                  </div>
                </div>

                {/* Examples Section */}
                {problem.examples && problem.examples.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>
                      Examples
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {problem.examples.map((ex, idx) => (
                        <div key={idx}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#a78bfa' }}>
                            Example {idx + 1}:
                          </span>
                          <div className="workspace-example-box">
                            {ex}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics Tag List */}
                {problem.topics && problem.topics.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
                      Related Topics
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {problem.topics.map((t, idx) => (
                        <span key={idx} className="practice-topic-badge" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Editorial Tab */}
            {activeTab === 'editorial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', fontSize: '1rem', fontWeight: 600 }}>
                  <Lightbulb size={18} /> Algorithmic Approach & Analysis
                </div>

                <div className="workspace-desc-text">
                  <p><strong>Approach Overview:</strong></p>
                  <p>
                    1. <strong>Brute Force:</strong> Check every possible pair of elements with two nested loops. Time complexity: <code>O(n²)</code>, Space: <code>O(1)</code>.
                  </p>
                  <p>
                    2. <strong>Optimal Hash Map:</strong> Maintain a hash map to store each number's complement (<code>target - num</code>) and its index. As you iterate through the list, check if the current number already exists in the map.
                  </p>
                </div>

                <div className="workspace-example-box" style={{ borderLeftColor: '#34d399' }}>
                  <strong>Complexity:</strong><br />
                  • Time Complexity: O(n) single pass scan<br />
                  • Space Complexity: O(n) auxiliary hash storage
                </div>
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem' }}>
                  Submission History
                </h3>

                {submissions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                    <History size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
                    <p>No past submissions recorded for this problem.</p>
                  </div>
                ) : (
                  <table className="practice-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Language</th>
                        <th>Runtime</th>
                        <th>Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((s, idx) => {
                        const isAcc = s.status === 'Accepted';
                        return (
                          <tr key={idx}>
                            <td>
                              <span className={`workspace-status-indicator ${isAcc ? 'accepted' : 'error'}`} style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                                {isAcc ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                {s.status}
                              </span>
                            </td>
                            <td style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{s.language}</td>
                            <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{s.time}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Pane: Monaco Editor & Expandable Console */}
        <div className="workspace-right-pane">
          
          {/* Editor Header Toolbar */}
          <div className="workspace-editor-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <Code2 size={15} style={{ color: '#a78bfa' }} /> Code Editor ({language})
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Monaco Engine (VS Code Core)
            </div>
          </div>

          {/* Monaco Code Editor */}
          <div className="workspace-monaco-wrapper">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'python' ? 'python' : language === 'cpp' || language === 'c' ? 'cpp' : language === 'go' ? 'go' : 'java'}
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                fontLigatures: true,
                padding: { top: 14, bottom: 14 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                automaticLayout: true
              }}
            />
          </div>

          {/* Testcases & Console Drawer */}
          <div 
            className="workspace-console-drawer"
            style={{ height: showConsole ? '260px' : '38px' }}
          >
            {/* Console Drawer Bar */}
            <div 
              className="workspace-console-header"
              onClick={() => setShowConsole(!showConsole)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.85rem', fontWeight: 600 }}>
                <Terminal size={14} style={{ color: '#38bdf8' }} />
                <span>Testcases & Execution Console</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                {status && (
                  <span className={`workspace-status-indicator ${status === 'Accepted' ? 'accepted' : 'error'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>
                    {status} {execTime && `(${execTime})`}
                  </span>
                )}
                {showConsole ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </div>
            </div>

            {/* Console Drawer Body */}
            {showConsole && (
              <div className="workspace-console-body">
                
                {/* Testcases Tabs */}
                <div className="workspace-tc-tabs">
                  {problem.testCases && problem.testCases.map((tc, idx) => (
                    <button
                      key={idx}
                      className={`workspace-tc-tab ${activeTestCaseTab === idx ? 'active' : ''}`}
                      onClick={() => setActiveTestCaseTab(idx)}
                    >
                      Case {idx + 1} {tc.is_hidden && '🔒'}
                    </button>
                  ))}
                </div>

                {/* Testcase Input & Outputs */}
                {problem.testCases && problem.testCases[activeTestCaseTab] && (
                  <div style={{ display: 'grid', gridTemplateColumns: output ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                        Sample Input
                      </div>
                      <pre className="workspace-output-box">
                        {problem.testCases[activeTestCaseTab].input}
                      </pre>
                    </div>

                    {output && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', fontWeight: 600 }}>
                          Compiler Output
                        </div>
                        <pre className="workspace-output-box" style={{ borderColor: status === 'Accepted' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}>
                          {output}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
