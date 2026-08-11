import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/client';
import { ThumbsUp, ThumbsDown, Star, ChevronLeft, Play, Send, History } from 'lucide-react';
import './practice.css';

export default function ProblemWorkspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  
  // Left Pane Tabs
  const [activeTab, setActiveTab] = useState('description'); // description, submissions
  
  // Interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // Editor State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your python code here\n');
  
  // Console State
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [execTime, setExecTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);

  // Submissions State
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/problems/${id}`)
      .then(res => setProblem(res.data))
      .catch(err => console.error("Failed to load problem:", err));

    // Load local history
    const stored = JSON.parse(localStorage.getItem(`submissions_${id}`) || '[]');
    setSubmissions(stored);
  }, [id]);

  const handleRun = async () => {
    setIsRunning(true);
    setStatus('Pending');
    setOutput('Running...');
    setShowConsole(true);
    setExecTime('');

    try {
      const tc = problem.testCases[activeTestCaseTab];
      const res = await axios.post(`${API_BASE_URL}/execute`, {
        problemId: id,
        language,
        code,
        input: tc ? tc.input : ''
      });
      
      setStatus(res.data.status);
      setOutput(res.data.output || res.data.error || 'No Output');
      setExecTime(res.data.time);
      
      // Save submission if it's Accepted or Error
      if (res.data.status !== 'Pending') {
        saveSubmission(res.data.status, res.data.time);
      }
    } catch (err) {
      setStatus('Error');
      setOutput(err.response?.data?.error || err.message);
      saveSubmission('Error', 'N/A');
    } finally {
      setIsRunning(false);
    }
  };

  const saveSubmission = (stat, time) => {
    const sub = {
      date: new Date().toLocaleString(),
      status: stat,
      time: time || 'N/A',
      language
    };
    const newSubs = [sub, ...submissions];
    setSubmissions(newSubs);
    localStorage.setItem(`submissions_${id}`, JSON.stringify(newSubs));
    
    // Mark as solved globally if Accepted
    if (stat === 'Accepted' && problem) {
      const solvedIds = JSON.parse(localStorage.getItem('solved_problems') || '[]');
      if (!solvedIds.includes(problem.id)) {
        solvedIds.push(problem.id);
        localStorage.setItem('solved_problems', JSON.stringify(solvedIds));
      }
    }
  };

  if (!problem) return <div style={{ padding: '2rem' }}>Loading problem...</div>;

  return (
    <div className="pr-theme pr-workspace-container">
      {/* Left Pane */}
      <div className="pr-pane left">
        <div className="pr-pane-header">
          <Link to="/practice" className="pr-back-btn">
            <ChevronLeft size={20} />
          </Link>
          <span className={activeTab === 'description' ? 'active' : ''} onClick={() => setActiveTab('description')}>Description</span>
          <span className={activeTab === 'submissions' ? 'active' : ''} onClick={() => setActiveTab('submissions')}>
            <History size={14} style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'text-bottom' }}/> Submissions
          </span>
        </div>

        <div className="pr-pane-content">
          {activeTab === 'description' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h1 className="pr-problem-title">{problem.id}. {problem.title}</h1>
              </div>
              
              <div className="pr-problem-meta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`pr-difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                
                {/* Interactions */}
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

              {/* Topics Pills */}
              {problem.topics && problem.topics.length > 0 && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--pr-border-color)', paddingTop: '1rem' }}>
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

          {activeTab === 'submissions' && (
            <div className="pr-submissions-tab">
              {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--pr-text-secondary)', marginTop: '2rem' }}>No past submissions.</div>
              ) : (
                <table className="pr-problems-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Runtime</th>
                      <th>Time Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s, i) => (
                      <tr key={i}>
                        <td className={`status-${s.status === 'Error' ? 'Error' : s.status === 'Accepted' ? 'Accepted' : 'Pending'}`}>
                          {s.status}
                        </td>
                        <td>{s.language}</td>
                        <td>{s.time}</td>
                        <td style={{ color: 'var(--pr-text-secondary)' }}>{s.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Editor & Console */}
      <div className="pr-pane" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="pr-editor-toolbar">
          <select className="pr-lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="python">Python3</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
          <div className="pr-editor-actions">
            <button className="pr-btn" onClick={handleRun} disabled={isRunning}>
              <Play size={14} /> {isRunning ? 'Running...' : 'Run'}
            </button>
            <button className="pr-btn primary" onClick={handleRun} disabled={isRunning}>
              <Send size={14} /> Submit
            </button>
          </div>
        </div>
        
        <div className="pr-pane-content no-pad" style={{ flex: 1 }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'python' ? 'python' : language === 'cpp' || language === 'c' ? 'cpp' : language}
            value={code}
            onChange={val => setCode(val)}
            options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
          />
        </div>

        {/* Console / Testcases area */}
        <div className="pr-console-panel" style={{ height: showConsole ? '250px' : '40px', transition: 'height 0.2s', display: 'flex', flexDirection: 'column' }}>
          <div className="pr-console-header">
            <span style={{ cursor: 'pointer' }} onClick={() => setShowConsole(!showConsole)}>
              {showConsole ? '▼' : '▲'} Testcases & Console
            </span>
          </div>
          
          {showConsole && (
            <div className="pr-console-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              {status && (
                <div className={`pr-status-text status-${status.includes('Error') ? 'Error' : status}`}>
                  {status} {execTime && <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--pr-text-secondary)', marginLeft: '1rem' }}>Runtime: {execTime}</span>}
                </div>
              )}

              {/* Testcases Tabs */}
              <div className="pr-tc-tabs">
                {problem.testCases && problem.testCases.map((tc, idx) => (
                  <button 
                    key={idx} 
                    className={`pr-tc-tab ${activeTestCaseTab === idx ? 'active' : ''}`}
                    onClick={() => setActiveTestCaseTab(idx)}
                  >
                    Case {idx + 1} {tc.is_hidden && '(Hidden)'}
                  </button>
                ))}
              </div>

              <div className="pr-tc-content" style={{ marginTop: '1rem' }}>
                {problem.testCases && problem.testCases[activeTestCaseTab] && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--pr-text-secondary)', marginBottom: '0.2rem' }}>Input</div>
                      <pre className="pr-example-box" style={{ margin: 0, padding: '0.5rem' }}>
                        {problem.testCases[activeTestCaseTab].input}
                      </pre>
                    </div>
                    {status && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--pr-text-secondary)', marginBottom: '0.2rem' }}>Your Output</div>
                        <pre className="pr-example-box" style={{ margin: 0, padding: '0.5rem', background: status.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)' }}>
                          {output}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
