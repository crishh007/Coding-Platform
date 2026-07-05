import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, Mic, MicOff, Volume2, CheckCircle, ChevronRight, BarChart3, Star, AlertCircle, FileText, Loader2, Sparkles, Award, Zap, MessageSquare, Target, Brain } from 'lucide-react';
import ScoreRing from '../components/ScoreRing';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';

const SoundWave = () => (
  <div className="flex items-center gap-1 h-6">
    {[1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className="w-1.5 rounded-full animate-soundwave" 
        style={{ height: '100%', animationDelay: `${i * 0.15}s`, background: 'var(--accent-secondary)' }} 
      />
    ))}
  </div>
);

const MockInterview = () => {
  const [phase, setPhase] = useState('UPLOAD'); // UPLOAD, INTERVIEW, FEEDBACK
  const [resumeFile, setResumeFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Interview State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [qaPairs, setQaPairs] = useState([]);
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // Feedback State
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript + ' ';
        }
        if (finalTranscript) setCurrentAnswer((prev) => prev + finalTranscript);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
    
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setResumeFile(e.target.files[0]);
  };

  const startInterview = async () => {
    if (!resumeFile) return;
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await axios.post('http://127.0.0.1:8081/api/interview/generate-questions', formData);
      if (res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setPhase('INTERVIEW');
        speakQuestion(res.data.questions[0]);
      } else {
        setError('No questions generated. Please try another resume.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate questions. Ensure GEMINI_API_KEY is set in backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) recognitionRef.current?.stop();
    else { recognitionRef.current?.start(); setIsRecording(true); }
  };

  const nextQuestion = async () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); }
    window.speechSynthesis.cancel();

    const newQaPairs = [...qaPairs, { question: questions[currentIndex], answer: currentAnswer }];
    setQaPairs(newQaPairs);
    setCurrentAnswer('');

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      speakQuestion(questions[currentIndex + 1]);
    } else {
      await getFeedback(newQaPairs);
    }
  };

  const getFeedback = async (finalQaPairs) => {
    setIsLoading(true);
    setPhase('FEEDBACK');
    try {
      const res = await axios.post('http://127.0.0.1:8081/api/interview/evaluate', { qaPairs: finalQaPairs });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate interview.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl w-full mx-auto pb-16">
      {/* Header */}
      <div className="mb-14 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider"
             style={{ background: 'rgba(226, 75, 229, 0.1)', color: 'var(--accent-secondary)', border: '1px solid rgba(226, 75, 229, 0.2)' }}>
          <Sparkles size={12} /> AI-Powered Experience
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 flex flex-col items-center justify-center gap-4 tracking-tight">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float shadow-xl"
               style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <Mic className="text-white drop-shadow-md" size={40} />
          </div>
          <div>Mock <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>Interview</span></div>
        </h1>
        <p className="text-text-secondary text-xl max-w-2xl mx-auto leading-relaxed">Experience realistic voice interviews precisely tailored to your resume.</p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* --- UPLOAD PHASE --- */}
      {phase === 'UPLOAD' && (
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel relative overflow-hidden group border-2 border-dashed p-16 flex flex-col items-center justify-center"
               style={{ borderColor: 'var(--border-color)' }}>
            
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[100px] opacity-10 animate-float-slow pointer-events-none" style={{ background: 'var(--accent-primary)' }}></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[100px] opacity-10 animate-float-delayed pointer-events-none" style={{ background: 'var(--accent-secondary)' }}></div>
            
            <div className="w-28 h-28 rounded-full flex items-center justify-center mb-8 border transition-transform duration-500 group-hover:scale-110 relative z-10"
                 style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <UploadCloud size={56} style={{ color: 'var(--accent-primary)' }} />
            </div>
            
            <h3 className="text-3xl font-extrabold mb-4 relative z-10 text-center">Upload your Resume</h3>
            <p className="text-text-secondary mb-10 text-center max-w-lg leading-relaxed text-lg relative z-10">
              Drop your PDF here. Our advanced AI will instantly analyze your background and craft a custom behavioral interview.
            </p>
            
            <input type="file" id="resume-upload" accept=".pdf" className="hidden" onChange={handleFileChange} />
            
            {resumeFile && (
              <div className="px-6 py-3 rounded-2xl flex items-center gap-4 mb-10 border shadow-lg relative z-10 animate-fade-in"
                   style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                <FileText size={24} style={{ color: 'var(--accent-secondary)' }} />
                <span className="text-base font-semibold truncate max-w-[200px]">{resumeFile.name}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.2)', color: 'var(--success)' }}>
                  <CheckCircle size={14} />
                </div>
              </div>
            )}
            
            <div className="relative z-10">
              <button 
                className="primary px-10 py-4 font-bold text-lg flex items-center gap-3"
                onClick={(e) => { e.stopPropagation(); startInterview(); }}
                disabled={isLoading || !resumeFile}
              >
                {isLoading ? <Spinner size={24} color="white" /> : <Sparkles size={24} />}
                {isLoading ? 'Analyzing Background...' : 'Start Interview'}
              </button>
            </div>
            {/* Click target for the whole dropzone */}
            <div className="absolute inset-0 z-0 cursor-pointer" onClick={() => document.getElementById('resume-upload').click()} />
          </div>
        </div>
      )}

      {/* --- INTERVIEW PHASE --- */}
      {phase === 'INTERVIEW' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          {/* Question Card */}
          <div className="glass-panel relative overflow-hidden p-10" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none animate-pulse-glow" style={{ background: 'var(--accent-primary)' }}></div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-text-secondary">Progress</span>
                <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>{currentIndex + 1} of {questions.length}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                     style={{ background: 'rgba(124, 92, 252, 0.15)', color: 'var(--accent-primary)' }}>
                  Q{currentIndex + 1}
                </div>
                <span className="text-text-secondary font-semibold uppercase tracking-widest text-xs">Of {questions.length} Questions</span>
              </div>
              
              {isSpeaking ? (
                <div className="flex items-center gap-3 px-6 py-2.5 rounded-full border" style={{ background: 'rgba(226, 75, 229, 0.1)', borderColor: 'rgba(226, 75, 229, 0.2)' }}>
                  <SoundWave />
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--accent-secondary)' }}>AI Speaking</span>
                </div>
              ) : (
                <button 
                  onClick={() => speakQuestion(questions[currentIndex])} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-colors border"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <Volume2 size={16} /> Replay Audio
                </button>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl leading-snug font-bold m-0">{questions[currentIndex]}</h2>
          </div>

          {/* Answer Area */}
          <div className="glass-panel flex flex-col p-0 overflow-hidden transition-all duration-500 border-2"
               style={{ borderColor: isRecording ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-color)', boxShadow: isRecording ? '0 0 24px rgba(239, 68, 68, 0.15)' : '' }}>
            
            <div className="px-8 py-5 border-b flex flex-col sm:flex-row justify-between items-center gap-4" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-xl flex items-center gap-3 m-0">
                <div className="p-2 rounded-lg" style={{ background: isRecording ? 'rgba(239, 68, 68, 0.15)' : 'rgba(124, 92, 252, 0.15)', color: isRecording ? 'var(--error)' : 'var(--accent-primary)' }}>
                  <Mic className={isRecording ? "animate-pulse" : ""} size={20}/>
                </div>
                Your Response
              </h3>
              
              <button 
                onClick={toggleRecording}
                className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
                style={{
                  background: isRecording ? 'var(--error)' : 'var(--bg-secondary)',
                  color: isRecording ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${isRecording ? 'var(--error)' : 'var(--border-color)'}`
                }}
              >
                {isRecording ? <><MicOff size={18} /> Stop Recording</> : <><Mic size={18} /> Start Recording</>}
              </button>
            </div>
            
            <textarea
              className="w-full h-72 bg-transparent border-none p-8 text-lg leading-relaxed focus:outline-none resize-none"
              style={{ color: 'var(--text-primary)' }}
              placeholder={isRecording ? "Listening... Speak clearly into your microphone." : "Your transcribed answer will appear here. You can also type or edit your response manually..."}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />
            
            <div className="p-6 border-t flex justify-between items-center" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <span className="text-sm font-semibold text-text-tertiary">{currentAnswer.trim().length > 0 ? currentAnswer.trim().split(/\s+/).filter(Boolean).length + ' words' : ''}</span>
              <button 
                onClick={nextQuestion}
                disabled={currentAnswer.trim().length === 0}
                className="primary flex items-center gap-2 px-8 py-3 text-base"
              >
                {currentIndex === questions.length - 1 ? 'Complete & Analyze' : 'Next Question'} <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Interview Tips */}
          <div className="glass-panel p-8" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h3 className="text-lg font-bold mb-5 flex items-center gap-3 m-0">
              <Star size={20} style={{ color: 'var(--warning)' }} />
              Interview Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Be Specific', desc: 'Use concrete examples from your experience. Vague answers score low.' },
                { title: 'STAR Method', desc: 'Structure answers: Situation → Task → Action → Result for clarity.' },
                { title: 'Stay Concise', desc: 'Aim for 1–2 minutes per answer. Quality matters more than quantity.' },
              ].map((tip) => (
                <div key={tip.title} className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed m-0">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- FEEDBACK PHASE --- */}
      {phase === 'FEEDBACK' && (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
          {isLoading ? (
            <div className="glass-panel text-center py-32 flex flex-col items-center">
               <div className="relative w-20 h-20 mb-8 mx-auto flex items-center justify-center">
                 <Spinner size={64} />
                 <Brain size={24} className="absolute text-accent-primary animate-pulse" />
               </div>
               <h2 className="text-3xl font-bold mb-4">AI is crunching the data...</h2>
               <p className="text-text-secondary text-lg max-w-lg mx-auto">Evaluating your communication, confidence, and technical depth across all answers.</p>
            </div>
          ) : feedback && (
            <>
              <div className="glass-panel p-10 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden" style={{ borderLeft: '6px solid var(--success)' }}>
                <div className="absolute right-0 top-0 w-80 h-80 rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: 'var(--success)' }}></div>
                
                <div className="flex-1 text-center md:text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                    <CheckCircle size={14} /> Analysis Complete
                  </div>
                  <h2 className="text-4xl font-extrabold mb-4">Exceptional Effort!</h2>
                  <p className="text-text-secondary text-lg leading-relaxed m-0">Here is your comprehensive performance review. Use these insights to refine your delivery.</p>
                </div>

                <div className="shrink-0 p-6 rounded-[2rem] border relative z-10" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                  <ScoreRing score={feedback.overallScore} label="Overall Score" color="#22c55e" size={120} strokeWidth={8} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
                <ScoreCard title="Communication" score={feedback.communicationScore} feedback={feedback.communicationFeedback} icon={<MessageSquare size={24} />} color="#7c5cfc" bg="rgba(124, 92, 252, 0.12)" />
                <ScoreCard title="Confidence" score={feedback.confidenceScore} feedback={feedback.confidenceFeedback} icon={<Zap size={24} />} color="#f59e0b" bg="rgba(245, 158, 11, 0.12)" />
                <ScoreCard title="Technical Depth" score={feedback.technicalScore} feedback={feedback.technicalFeedback} icon={<Target size={24} />} color="#e24be5" bg="rgba(226, 75, 229, 0.12)" />
              </div>

              <div className="glass-panel mt-10 p-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Award style={{ color: 'var(--accent-secondary)' }} size={28} /> Comprehensive Feedback
                </h3>
                <div className="p-6 rounded-2xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <p className="m-0 leading-relaxed text-base">{feedback.overallFeedback}</p>
                </div>
                
                <div className="mt-10 flex justify-center">
                  <button onClick={() => window.location.reload()} className="primary px-10 py-4 text-base flex items-center gap-2">
                    <Sparkles size={20} /> Practice Another Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const ScoreCard = ({ title, score, feedback, icon, color, bg }) => (
  <div className="glass-panel-hover glass-panel flex flex-col p-8" style={{ borderTop: `4px solid ${color}` }}>
    <div className="flex justify-between items-center mb-6">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>{icon}</div>
      <div className="text-4xl font-black" style={{ color }}>{score}<span className="text-lg text-text-tertiary ml-1">/10</span></div>
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-text-secondary text-sm flex-grow leading-relaxed m-0">{feedback}</p>
  </div>
);

export default MockInterview;
