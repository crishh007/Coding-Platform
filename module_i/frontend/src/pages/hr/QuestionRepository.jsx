import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, Star, FileText, ChevronLeft, Sparkles
} from 'lucide-react';
import axios from 'axios';
import ErrorBanner from '../../components/ErrorBanner';
import Spinner from '../../components/Spinner';

const API = 'http://127.0.0.1:8080/api/interview';

const QuestionRepository = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [file, setFile] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  // Load default questions on mount
  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const res = await axios.get(`${API}/default-questions`);
        const qs = (res.data.questions || []).map((q, i) => ({
          id: i, title: q, category: 'General', source: 'default'
        }));
        setQuestions(qs);
      } catch (err) {
        setError('Failed to load default questions. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchDefaults();
  }, []);

  const handleGenerate = async () => {
    if (!file) { setError('Please select a resume PDF file first.'); return; }
    setError('');
    setGenerating(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await axios.post(`${API}/generate-questions`, formData);
      const aiQs = (res.data.questions || []).map((q, i) => ({
        id: 1000 + i, title: q, category: 'AI-Generated', source: 'ai'
      }));
      setQuestions(prev => [...aiQs, ...prev.filter(q => q.source === 'default')]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filters = ['All', 'AI-Generated', 'General', 'Favorites'];
  const displayed = questions.filter(q => {
    if (filter === 'Favorites') return favorites.has(q.id);
    if (filter === 'All') return true;
    return q.category === filter;
  });

  return (
    <div className="animate-fade-in mx-auto" style={{ maxWidth: 900 }}>
      <button
        onClick={() => navigate('/interview')}
        className="flex items-center gap-2 mb-6 text-sm font-semibold transition-colors duration-200"
        style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {/* Upload Panel */}
      <div className="glass-panel relative overflow-hidden mb-8 p-8" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full blur-[80px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-primary)' }} />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI-Tailored Questions</h2>
            <p className="text-text-secondary m-0">Upload your resume to generate personalized behavioral questions.</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <label className="flex items-center gap-2 px-5 py-2.5 rounded-lg border cursor-pointer font-medium text-sm transition-colors"
              style={{
                borderColor: 'var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--accent-primary)'
              }}
            >
              <FileText size={16} />
              {file ? file.name.slice(0, 20) + (file.name.length > 20 ? '…' : '') : 'Choose Resume (PDF)'}
              <input type="file" className="hidden" accept=".pdf,.txt" onChange={e => { setFile(e.target.files[0]); setError(''); }} />
            </label>
            <button
              className="primary flex items-center gap-2 px-6 py-2.5"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <Spinner size={16} color="white" /> : <Sparkles size={16} />}
              {generating ? 'Generating…' : 'Generate AI Questions'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200"
            style={{
              background: filter === f ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: filter === f ? 'none' : '1px solid var(--border-color)',
              boxShadow: filter === f ? '0 4px 12px var(--accent-glow)' : 'none',
            }}
          >
            {f} {f === 'Favorites' && favorites.size > 0 ? `(${favorites.size})` : ''}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-text-tertiary whitespace-nowrap">
          {displayed.length} questions
        </span>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center p-16"><Spinner size={36} /></div>
      ) : displayed.length === 0 ? (
        <div className="glass-panel text-center p-16 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-tertiary flex items-center justify-center text-text-tertiary mb-4 border border-border-color">
            <BookOpen size={28} />
          </div>
          <h3 className="text-lg font-bold mb-2">No questions found</h3>
          <p className="text-text-secondary text-sm m-0">
            {filter === 'Favorites' ? 'Star some questions to save them here.' : 'Upload your resume to generate AI questions.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 stagger-children">
          {displayed.map((q, idx) => (
            <div key={q.id} className="glass-panel-hover glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5"
                 style={{ borderLeft: q.source === 'ai' ? '2px solid var(--accent-secondary)' : '2px solid transparent' }}>
              <div className="flex gap-4 flex-1 items-start">
                <span className="text-xs font-bold text-text-tertiary pt-1 min-w-[24px]">Q{idx + 1}</span>
                <div className="flex-1">
                  <p className="m-0 mb-3 text-text-primary font-medium leading-relaxed">{q.title}</p>
                  <span className="badge" style={{
                    background: q.source === 'ai' ? 'rgba(226, 75, 229, 0.1)' : 'rgba(124, 92, 252, 0.1)',
                    color: q.source === 'ai' ? 'var(--accent-secondary)' : 'var(--accent-primary)',
                  }}>
                    {q.source === 'ai' ? '✦ AI-Generated' : 'General'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => toggleFavorite(q.id)}
                  className="p-2 rounded-lg transition-colors border"
                  style={{
                    background: 'var(--bg-secondary)', borderColor: 'var(--border-color)'
                  }}
                  title={favorites.has(q.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star size={16} style={{
                    color: favorites.has(q.id) ? 'var(--warning)' : 'var(--text-tertiary)',
                    fill: favorites.has(q.id) ? 'var(--warning)' : 'none'
                  }} />
                </button>
                <button
                  onClick={() => navigate('/interview/practice', { state: { question: q.title } })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors border"
                  style={{
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderColor: 'var(--border-color)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                >
                  Practice <PlayCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionRepository;
