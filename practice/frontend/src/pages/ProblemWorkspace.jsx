import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function ProblemWorkspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  
  // Editor State
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your python code here\n');
  const [input, setInput] = useState('');
  
  // Console State
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [execTime, setExecTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:8081/api/v1/problems/${id}`)
      .then(res => setProblem(res.data))
      .catch(err => console.error("Failed to load problem:", err));
  }, [id]);

  const handleRun = async () => {
    setIsRunning(true);
    setStatus('Pending');
    setOutput('Running...');
    setShowConsole(true);
    setExecTime('');

    try {
      const res = await axios.post('http://localhost:8081/api/v1/execute', {
        language,
        code,
        input
      });
      
      setStatus(res.data.status);
      setOutput(res.data.output || res.data.error || 'No Output');
      setExecTime(res.data.time);
    } catch (err) {
      setStatus('Error');
      setOutput(err.response?.data?.error || err.message);
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) return <div style={{ padding: '2rem' }}>Loading problem...</div>;

  return (
    <div className="workspace-container">
      {/* Left Pane - Problem Description */}
      <div className="pane left">
        <div className="pane-header">
          <span className="active">Description</span>
          <span>Editorial</span>
          <span>Solutions</span>
          <span>Submissions</span>
        </div>
        <div className="pane-content">
          <h1 className="problem-title">{problem.id}. {problem.title}</h1>
          <div className="problem-meta">
            <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
          </div>
          <div className="problem-desc">{problem.description}</div>
          
          <div className="examples">
            {problem.examples && problem.examples.map((ex, i) => (
              <div key={i}>
                <p><strong>Example {i + 1}:</strong></p>
                <div className="example-box">{ex}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Editor & Console */}
      <div className="pane">
        <div className="editor-toolbar">
          <select 
            className="lang-select" 
            value={language} 
            onChange={e => setLanguage(e.target.value)}
          >
            <option value="python">Python3</option>
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
          </select>
          <div className="editor-actions">
            <button className="btn" onClick={handleRun} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button className="btn primary">Submit</button>
          </div>
        </div>
        
        <div className="pane-content no-pad">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === 'python' ? 'python' : language === 'cpp' || language === 'c' ? 'cpp' : language}
            value={code}
            onChange={val => setCode(val)}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Console / Output area */}
        {showConsole && (
          <div className="console-panel">
            <div className="console-header">
              <span>Testcase Output</span>
              <button 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setShowConsole(false)}
              >
                Close
              </button>
            </div>
            <div className="console-body">
              {status && (
                <div className={`status-text status-${status.includes('Error') ? 'Error' : status}`}>
                  {status} {execTime && <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1rem' }}>Runtime: {execTime}</span>}
                </div>
              )}
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {output}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
