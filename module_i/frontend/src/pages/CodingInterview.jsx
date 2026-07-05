import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Terminal, Play, Loader2, Sparkles, AlertCircle, Bot, User, Code2, RefreshCw, Mic, MicOff, Trash2, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ErrorBanner from '../components/ErrorBanner';
import Spinner from '../components/Spinner';

const DEFAULT_CODE = '// Write your code here...\nfunction solve(nums, target) {\n  \n}';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'TypeScript', 'C#', 'Rust'];

const CodingInterview = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState('JavaScript');
  const [messages, setMessages] = useState([
    {
      role: 'interviewer',
      message: 'Hello! I will be your technical interviewer today. Let\'s start with a classic problem: "Two Sum".\n\nGiven an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.\n\nCould you discuss your approach before writing the code?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && (!code.trim() || code.trim() === DEFAULT_CODE.trim())) return;

    const newMessages = [...messages, { role: 'user', message: inputValue || `I updated my code (${language}).` }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8080/api/interview/coding', {
        history: newMessages,
        code: code
      });

      if (response.data && response.data.reply) {
        setMessages(prev => [...prev, { role: 'interviewer', message: response.data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'interviewer', 
        message: 'Sorry, I encountered an error. Please make sure the backend is running and the GEMINI_API_KEY is configured.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (isLoading) return;
    
    setCode(DEFAULT_CODE);
    setIsLoading(true);
    setMessages([]);

    const promptMessage = { 
      role: 'user', 
      message: 'Please give me a new, random data structures and algorithms interview problem. State the problem clearly with an example.' 
    };

    try {
      const response = await axios.post('http://127.0.0.1:8080/api/interview/coding', {
        history: [promptMessage],
        code: ''
      });

      if (response.data && response.data.reply) {
        setMessages([{ role: 'interviewer', message: response.data.reply }]);
      }
    } catch (error) {
      console.error(error);
      setMessages([{ 
        role: 'interviewer', 
        message: 'Sorry, I encountered an error. Please make sure the backend is running.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Speech recognition is not supported. Please use Chrome or Edge.');
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    
    let currentFinal = inputValue;

    rec.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) currentFinal = (currentFinal + ' ' + final.trim()).trim();
      setInputValue((currentFinal + ' ' + interim).trim());
    };
    
    rec.onerror = (e) => {
      console.error('Microphone error:', e);
      setIsRecording(false);
    };
    rec.onend = () => setIsRecording(false);
    
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-100px)] max-w-7xl mx-auto pb-6 animate-fade-in gap-5">
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      
      {/* Left Pane: Chat / Problem Statement */}
      <div className="w-full md:w-[45%] flex flex-col glass-panel p-0 overflow-hidden" style={{ minHeight: '500px' }}>
        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-tertiary)' }}>
              <Bot size={18} />
            </div>
            <h2 className="font-bold text-lg m-0 text-text-primary">AI Interviewer</h2>
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-tertiary)'; e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            title="Get a new question"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Next Question
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                   style={{
                     background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-tertiary)',
                     color: msg.role === 'user' ? 'white' : 'var(--accent-tertiary)',
                     border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)'
                   }}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className="px-5 py-4 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm text-sm"
                   style={{
                     background: msg.role === 'user' ? 'rgba(124, 92, 252, 0.1)' : 'var(--bg-tertiary)',
                     color: 'var(--text-primary)',
                     border: `1px solid ${msg.role === 'user' ? 'rgba(124, 92, 252, 0.2)' : 'var(--border-color)'}`,
                     borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                     borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px'
                   }}>
                {msg.message}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border"
                   style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-tertiary)', borderColor: 'var(--border-color)' }}>
                <Bot size={14} />
              </div>
              <div className="px-5 py-4 rounded-2xl border flex items-center gap-3 shadow-sm text-sm"
                   style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', borderTopLeftRadius: '4px' }}>
                <Spinner size={16} color="var(--accent-tertiary)" />
                <span className="font-medium text-text-secondary">Reviewing your code...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-5 border-t shrink-0" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
          <div className="flex relative items-end shadow-sm rounded-xl border focus-within:ring-2 transition-all"
               style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', ringColor: 'rgba(56, 189, 248, 0.2)' }}>
            <textarea
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                  e.target.style.height = 'auto';
                }
              }}
              placeholder="Discuss your approach... (Shift+Enter for new line)"
              className="w-full bg-transparent border-none outline-none pl-4 pr-24 py-4 resize-none custom-scrollbar text-sm"
              style={{ color: 'var(--text-primary)', minHeight: '56px' }}
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1 bg-bg-primary rounded-lg pl-2">
              <button
                onClick={toggleRecording}
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                  color: isRecording ? 'var(--error)' : 'var(--text-muted)'
                }}
                onMouseEnter={e => { if (!isRecording) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!isRecording) e.currentTarget.style.color = 'var(--text-muted)'; }}
                title={isRecording ? "Stop recording" : "Start voice typing"}
              >
                {isRecording ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputValue.trim() && (!code.trim() || code.trim() === DEFAULT_CODE.trim()))}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-tertiary)' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'var(--accent-tertiary)'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; e.currentTarget.style.color = 'var(--accent-tertiary)'; } }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Code Editor */}
      <div className="flex-1 flex flex-col glass-panel p-0 overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center shrink-0" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(226, 75, 229, 0.15)', color: 'var(--accent-secondary)' }}>
                <Code2 size={18} />
              </div>
              <h2 className="font-bold text-lg m-0 text-text-primary">Code Editor</h2>
              
              <div className="relative ml-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none font-medium text-sm rounded-lg pl-3 pr-8 py-1.5 cursor-pointer border transition-colors outline-none"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-tertiary)' }} />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCode(DEFAULT_CODE)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors border"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                title="Clear code"
              >
                <Trash2 size={14} /> Clear
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={isLoading}
                className="primary flex items-center gap-2 px-6 py-2.5 font-bold text-sm"
              >
                {isLoading ? <Spinner size={16} color="white" /> : <Play size={16} fill="currentColor" />}
                Submit Code
              </button>
            </div>
        </div>
        
        <div className="flex-1 relative overflow-hidden" style={{ background: '#1e1e1e' }}>
          <Editor
            height="100%"
            language={language.toLowerCase()}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
              lineHeight: 24,
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
            }}
          />
        </div>
        <div className="px-5 py-2.5 text-xs flex items-center justify-between shrink-0 font-medium tracking-wide" style={{ background: '#181818', color: '#888', borderTop: '1px solid #2a2a2a' }}>
          <span>Monaco Editor integrated • Ctrl+Enter to submit</span>
          <span style={{ color: 'var(--accent-secondary)' }}>{language}</span>
        </div>
      </div>
    </div>
  );
};

export default CodingInterview;
