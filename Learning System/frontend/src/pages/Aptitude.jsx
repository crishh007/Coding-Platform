import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Calculator, Target, Award, BrainCircuit, Activity, ChevronRight, Play, Clock, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ErrorBanner from '../components/ErrorBanner';

const AptitudeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startFullTest = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8081/api/aptitude/generate');
      navigate('/aptitude/test', { state: { test: res.data } });
    } catch (err) {
      console.error(err);
      setError('Failed to generate test. Make sure the backend is running and GEMINI_API_KEY is configured.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Quantitative',
      description: 'Arithmetic, Algebra, Geometry, Data Interpretation.',
      icon: <Calculator size={24} />,
      color: '#38bdf8', // accent-tertiary
      bg: 'rgba(56, 189, 248, 0.12)',
      actionText: 'Practice Math'
    },
    {
      title: 'Logical Reasoning',
      description: 'Puzzles, Series, Syllogisms, Blood Relations.',
      icon: <BrainCircuit size={24} />,
      color: '#e24be5', // accent-secondary
      bg: 'rgba(226, 75, 229, 0.12)',
      actionText: 'Practice Logic'
    },
    {
      title: 'Verbal Ability',
      description: 'Grammar, Comprehension, Vocab, Sentence Correction.',
      icon: <Activity size={24} />,
      color: '#fb923c', // orange-400
      bg: 'rgba(251, 146, 60, 0.12)',
      actionText: 'Practice Verbal'
    }
  ];

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto pb-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Aptitude <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>Tests</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Sharpen your quantitative, logical reasoning, and verbal skills. Essential preparation for initial screening rounds.
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 stagger-children">
        {sections.map((sec, i) => (
          <div key={i} className="glass-panel group flex flex-col relative overflow-hidden transition-all duration-300 p-8"
               style={{ borderTop: `2px solid ${sec.color}` }}
               onMouseEnter={e => {
                 e.currentTarget.style.transform = 'translateY(-4px)';
                 e.currentTarget.style.boxShadow = `0 16px 32px -8px ${sec.color}25`;
               }}
               onMouseLeave={e => {
                 e.currentTarget.style.transform = 'translateY(0)';
                 e.currentTarget.style.boxShadow = '';
               }}
          >
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: sec.color }} />
            
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: sec.bg, color: sec.color }}>
              {sec.icon}
            </div>
            
            <h3 className="text-xl font-bold mb-2 transition-colors">{sec.title}</h3>
            <p className="text-text-secondary text-sm mb-6 flex-grow leading-relaxed">{sec.description}</p>
            
            <button 
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold text-sm transition-all"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => setError(`${sec.title} practice modules are coming soon! Please use the Full Mock Test for now.`)}
              onMouseEnter={e => {
                e.currentTarget.style.background = sec.color;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = sec.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {sec.actionText} <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="glass-panel relative overflow-hidden p-10 flex flex-col md:flex-row justify-between items-center gap-8" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-secondary)' }} />
        <div className="relative z-10">
          <h2 className="flex items-center gap-3 text-2xl font-bold mb-2">
            <Target size={24} style={{ color: 'var(--accent-secondary)' }} /> Full Mock Test
          </h2>
          <p className="text-text-secondary max-w-xl m-0 leading-relaxed">
            Take a comprehensive 60-minute aptitude test covering all sections to simulate a real exam environment.
          </p>
        </div>
        <button 
          className="primary px-8 py-3.5 text-base whitespace-nowrap flex items-center gap-2 relative z-10"
          onClick={startFullTest} 
          disabled={loading}
        >
          {loading ? 'Generating...' : <><Play size={18} fill="currentColor" /> Start Full Test</>}
        </button>
      </div>
    </div>
  );
};

const TestInterface = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(test ? test.duration * 60 : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!test) {
      navigate('/aptitude');
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [test, navigate]);

  useEffect(() => {
    if (timeLeft === 0 && test && !submitting) handleSubmit();
  }, [timeLeft, test, submitting]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIndex = parseInt(e.key) - 1;
        const currentQuestion = test?.questions[currentIdx];
        if (currentQuestion && optionIndex < currentQuestion.options.length) {
          handleSelectOption(optionIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, test]);

  if (!test) return null;

  const questions = test.questions || [];
  const currentQuestion = questions[currentIdx];

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIdx) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const formattedAnswers = {};
      Object.keys(answers).forEach(k => formattedAnswers[k] = answers[k]);
      const res = await axios.post('http://127.0.0.1:8081/api/aptitude/submit', {
        testId: test.id,
        answers: formattedAnswers
      });
      navigate('/aptitude/result', { state: { result: res.data } });
    } catch (err) {
      console.error(err);
      setError('Failed to submit test');
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      
      {/* Header */}
      <div className="glass-panel py-4 px-6 mb-5 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2 m-0">
          <BrainCircuit style={{ color: 'var(--accent-primary)' }} /> Aptitude Test
        </h2>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg border font-mono font-bold text-sm transition-colors"
             style={{
               background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
               borderColor: timeLeft < 300 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)',
               color: timeLeft < 300 ? 'var(--error)' : 'var(--text-primary)'
             }}>
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5 flex-grow min-h-0">
        {/* Main Question Area */}
        <div className="glass-panel flex-grow flex flex-col overflow-y-auto p-8 relative">
          <div className="flex justify-between items-center mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-text-tertiary">Press 1-4 to select</span>
          </div>
          
          <h3 className="text-2xl font-semibold mb-8 leading-snug">
            {currentQuestion?.question}
          </h3>

          <div className="flex flex-col gap-3 mb-8">
            {currentQuestion?.options.map((opt, i) => {
              const isSelected = answers[currentIdx] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className="text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group"
                  style={{
                    background: isSelected ? 'rgba(124, 92, 252, 0.08)' : 'var(--bg-tertiary)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-color)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(124, 92, 252, 0.4)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                       style={{
                         borderColor: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                         background: isSelected ? 'var(--accent-primary)' : 'transparent'
                       }}>
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-base font-medium" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 text-sm"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <ArrowLeft size={16} /> Previous
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="primary px-6 py-2.5 text-sm"
              >
                {submitting ? 'Submitting...' : <><CheckCircle2 size={16} /> Submit Test</>}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-5 py-2.5 text-sm"
                style={{ background: 'var(--bg-secondary)' }}
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="glass-panel w-full md:w-72 shrink-0 flex flex-col p-6 overflow-y-auto">
          <div className="section-heading mb-4">Navigator</div>
          <div className="grid grid-cols-5 md:grid-cols-4 gap-2 mb-8">
            {questions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isActive = currentIdx === i;
              
              let bg = 'var(--bg-tertiary)';
              let color = 'var(--text-secondary)';
              let borderColor = 'var(--border-color)';
              
              if (isActive) {
                bg = 'var(--accent-primary)';
                color = 'white';
                borderColor = 'var(--accent-primary)';
              } else if (isAnswered) {
                bg = 'rgba(124, 92, 252, 0.15)';
                color = 'var(--accent-primary)';
                borderColor = 'rgba(124, 92, 252, 0.3)';
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  className="aspect-square rounded-lg flex items-center justify-center font-bold text-xs p-0 transition-all"
                  style={{ background: bg, color, border: `1px solid ${borderColor}` }}
                  onMouseEnter={e => {
                    if (!isActive && !isAnswered) {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive && !isAnswered) {
                      e.currentTarget.style.background = bg;
                      e.currentTarget.style.color = color;
                    }
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-auto pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary font-medium">Answered</span>
              <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{Object.keys(answers).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary font-medium">Unanswered</span>
              <span className="font-bold text-text-primary">{questions.length - Object.keys(answers).length}</span>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors border"
              style={{
                background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            >
              Finish Early
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="text-2xl mb-4">No result data available</h2>
        <button className="primary px-6 py-2" onClick={() => navigate('/aptitude')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentage = Math.round((result.score / result.total) * 100);
  
  let resultMessage = "Good effort!";
  let resultColor = "var(--warning)";
  let ringColor = "rgba(245, 158, 11, 0.2)";
  
  if (percentage >= 80) {
    resultMessage = "Excellent performance!";
    resultColor = "var(--success)";
    ringColor = "rgba(34, 197, 94, 0.2)";
  } else if (percentage < 50) {
    resultMessage = "Needs more practice.";
    resultColor = "var(--error)";
    ringColor = "rgba(239, 68, 68, 0.2)";
  }

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto mt-10">
      <div className="glass-panel text-center py-16 px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none" style={{ background: ringColor }}></div>

        <Award size={56} className="mx-auto mb-6" style={{ color: resultColor }} />
        
        <h1 className="text-4xl font-extrabold mb-3">Test Complete!</h1>
        <p className="text-text-secondary text-lg mb-10 font-medium">{resultMessage}</p>
        
        <div className="flex justify-center mb-10">
          <div className="relative w-40 h-40 rounded-full flex items-center justify-center border-4" style={{ borderColor: resultColor }}>
             <div className="flex flex-col items-center justify-center relative z-10">
              <span className="text-4xl font-black text-text-primary">
                {result.score} <span className="text-2xl text-text-tertiary">/ {result.total}</span>
              </span>
              <span className="text-text-secondary mt-1 text-xs font-bold uppercase tracking-widest">Score</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-color">
            <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Accuracy</div>
            <div className="text-2xl font-bold">{percentage}%</div>
          </div>
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-color">
            <div className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Questions</div>
            <div className="text-2xl font-bold">{result.total}</div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/aptitude')}
          className="primary px-8 py-3 text-sm inline-flex items-center gap-2"
        >
          Return to Dashboard <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const Aptitude = () => {
  return (
    <Routes>
      <Route path="/" element={<AptitudeDashboard />} />
      <Route path="/test" element={<TestInterface />} />
      <Route path="/result" element={<TestResult />} />
    </Routes>
  );
};
