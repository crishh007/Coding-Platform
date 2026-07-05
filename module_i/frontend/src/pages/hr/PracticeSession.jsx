import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Mic, CheckCircle2, FileText, ChevronLeft, RotateCcw,
  Award, Clock, Zap, ChevronRight, Target, MessageSquare, Brain
} from 'lucide-react';
import axios from 'axios';
import ErrorBanner from '../../components/ErrorBanner';
import Spinner from '../../components/Spinner';
import ScoreRing from '../../components/ScoreRing';

const API = 'http://127.0.0.1:8080/api/interview';

const PracticeSession = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultQuestion = 'Describe a time you faced a conflict at work and how you resolved it.';
  const passedQuestion = location.state?.question;
  const [question] = useState(passedQuestion || defaultQuestion);

  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const initialAnswerRef = useRef('');

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
    initialAnswerRef.current = answer;

    rec.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) initialAnswerRef.current = (initialAnswerRef.current + ' ' + final.trim()).trim();
      setAnswer((initialAnswerRef.current + ' ' + interim).trim());
    };
    rec.onerror = (e) => {
      setError(`Microphone error: ${e.error}. Please check your mic permissions.`);
      setIsRecording(false);
    };
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
    if (!timerActive) setTimerActive(true);
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { setError('Please type or record your answer before submitting.'); return; }
    setError('');
    setEvaluating(true);
    setTimerActive(false);
    try {
      const res = await axios.post(`${API}/evaluate`, { qaPairs: [{ question, answer }] });
      setFeedback(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    setError('');
    setElapsed(0);
    setTimerActive(false);
    initialAnswerRef.current = '';
  };

  return (
    <div className="animate-fade-in mx-auto" style={{ maxWidth: 1100 }}>
      <button
        onClick={() => navigate('/interview')}
        className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors duration-200"
        style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      {/* Question Card */}
      <div className="glass-panel relative overflow-hidden mb-8" style={{ borderLeft: '4px solid var(--accent-primary)', padding: '28px 32px' }}>
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-primary)' }} />
        <span className="badge mb-4" style={{ background: 'rgba(124, 92, 252, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(124, 92, 252, 0.2)' }}>
          Practice Question
        </span>
        <h2 className="text-2xl md:text-3xl font-bold leading-snug m-0">{question}</h2>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Answer Panel */}
        <div className="glass-panel lg:col-span-2 p-0 overflow-hidden flex flex-col relative transition-all duration-300"
          style={{ borderColor: isRecording ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)', boxShadow: isRecording ? '0 0 24px rgba(239, 68, 68, 0.1)' : '' }}>
          
          {/* Toolbar */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-bg-tertiary/50" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 font-semibold">
              <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Your Response</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-sm font-semibold transition-colors"
                style={{
                  background: timerActive ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                  color: timerActive ? 'var(--success)' : 'var(--text-secondary)',
                  border: `1px solid ${timerActive ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`
                }}>
                <Clock size={14} /> {formatTime(elapsed)}
              </div>
              
              {/* Record Button */}
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all duration-300 ${isRecording ? 'animate-pulse-glow' : ''}`}
                style={{
                  background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                  color: isRecording ? 'var(--error)' : 'var(--text-primary)',
                  borderColor: isRecording ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)',
                  boxShadow: isRecording ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none'
                }}
              >
                {isRecording ? (
                  <><span className="w-2 h-2 rounded-full bg-error" /> Stop</>
                ) : (
                  <><Mic size={14} /> Record</>
                )}
              </button>
            </div>
          </div>

          <textarea
            value={answer}
            onChange={e => { setAnswer(e.target.value); if (!timerActive && e.target.value) setTimerActive(true); }}
            placeholder="Type your answer here, or click 'Record' to speak your response…"
            className="flex-1 w-full p-6 bg-transparent border-none text-base outline-none resize-none"
            style={{ minHeight: 320, lineHeight: 1.7 }}
          />

          <div className="flex justify-between items-center px-6 py-4 border-t bg-bg-tertiary/50" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-xs font-semibold text-text-tertiary">
              {answer.trim().split(/\s+/).filter(Boolean).length} words
            </span>
            <div className="flex gap-3">
              {(feedback || answer) && (
                <button onClick={handleReset} className="px-4 py-2 text-sm">
                  <RotateCcw size={14} /> Reset
                </button>
              )}
              <button
                className="primary px-6 py-2"
                onClick={handleSubmit}
                disabled={evaluating || !answer.trim()}
              >
                {evaluating ? <Spinner size={16} color="white" /> : <CheckCircle2 size={16} />}
                {evaluating ? 'Evaluating…' : 'Submit for AI Evaluation'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1">
          {feedback ? (
            <div className="glass-panel animate-fade-in" style={{ borderTop: '4px solid var(--success)' }}>
              <h3 className="flex items-center gap-2 mb-6 text-lg">
                <Award size={20} className="text-success" /> AI Feedback
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <ScoreRing score={feedback.overallScore} label="Overall" color="#7c5cfc" size={80} strokeWidth={6} />
                <ScoreRing score={feedback.communicationScore} label="Comm." color="#22c55e" size={80} strokeWidth={6} />
                <ScoreRing score={feedback.confidenceScore} label="Confid." color="#f59e0b" size={80} strokeWidth={6} />
                <ScoreRing score={feedback.technicalScore} label="Tech." color="#38bdf8" size={80} strokeWidth={6} />
              </div>

              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: 'Overall', text: feedback.overallFeedback, icon: <Target size={14} /> },
                  { label: 'Communication', text: feedback.communicationFeedback, icon: <MessageSquare size={14} /> },
                  { label: 'Confidence', text: feedback.confidenceFeedback, icon: <Zap size={14} /> },
                  { label: 'Technical', text: feedback.technicalFeedback, icon: <Brain size={14} /> },
                ].map(({ label, text, icon }) => text && (
                  <div key={label} className="p-3 bg-bg-secondary rounded-lg border border-border-color">
                    <div className="flex items-center gap-2 mb-1.5 font-bold text-text-primary">
                      {icon} {label}
                    </div>
                    <p className="m-0 text-text-secondary leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/interview/questions')}
                className="primary w-full justify-center mt-6 py-3"
              >
                Next Question <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="glass-panel">
              <h3 className="flex items-center gap-2 mb-4 text-base">
                <BookOpen size={18} className="text-accent-tertiary" /> The STAR Method
              </h3>
              <p className="text-sm text-text-secondary mb-5 leading-relaxed p-3 bg-bg-tertiary/50 rounded-lg">
                Structure your answer to provide a clear, concise, and compelling story that demonstrates your skills.
              </p>
              
              <div className="flex flex-col gap-4">
                {[
                  { letter: 'S', name: 'Situation', desc: 'Set the scene and give details.', color: 'var(--accent-primary)' },
                  { letter: 'T', name: 'Task', desc: 'Describe your responsibility.', color: 'var(--accent-secondary)' },
                  { letter: 'A', name: 'Action', desc: 'Explain exactly what you took.', color: '#f59e0b' },
                  { letter: 'R', name: 'Result', desc: 'Share outcomes with numbers.', color: 'var(--success)' },
                ].map(({ letter, name, desc, color }) => (
                  <div key={letter} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ background: `${color}15`, color }}>{letter}</div>
                    <div>
                      <strong className="block text-sm text-text-primary mb-0.5">{name}</strong>
                      <p className="text-xs text-text-secondary m-0">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 rounded-lg text-xs text-text-secondary border" style={{ background: 'rgba(124, 92, 252, 0.05)', borderColor: 'rgba(124, 92, 252, 0.15)' }}>
                💡 <strong className="text-accent-primary">Tip:</strong> Aim for 2–3 minutes. Use the timer above to pace yourself.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
