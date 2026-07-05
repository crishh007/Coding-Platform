import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, BarChart2, BookOpen, ChevronLeft, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import ScoreRing from '../../components/ScoreRing';

const API = 'http://127.0.0.1:8081/api/interview';

const Performance = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await axios.get(`${API}/evaluations`);
        setEvaluations(res.data || []);
      } catch (err) {
        console.error("Failed to fetch evaluations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const totalSessions = evaluations.length;
  const avgScore = totalSessions > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / totalSessions).toFixed(1)
    : '—';

  const stats = [
    { label: 'Sessions Completed', value: totalSessions || '—', icon: <PlayCircle size={18} />, color: '#7c5cfc' }, // accent-primary
    { label: 'Avg Overall Score', value: avgScore, icon: <TrendingUp size={18} />, color: '#22c55e' }, // success
    { label: 'Questions Practiced', value: totalSessions || '—', icon: <BookOpen size={18} />, color: '#f59e0b' }, // warning
    { label: 'Time Practiced', value: totalSessions > 0 ? `${totalSessions * 3} min` : '—', icon: <Clock size={18} />, color: '#38bdf8' }, // accent-tertiary
  ];

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

      <div className="mb-8">
        <h2 className="text-3xl font-extrabold mb-2">Your Performance</h2>
        <p className="text-text-secondary text-base">Track your interview preparation progress over time.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger-children">
        {stats.map(s => (
          <div key={s.label} className="glass-panel p-6 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="text-3xl font-black text-text-primary mb-1">{s.value}</div>
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-14">
          <Spinner size={36} />
        </div>
      ) : totalSessions === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center mb-6 text-text-tertiary border border-border-color">
            <BarChart2 size={36} />
          </div>
          <h3 className="text-xl font-bold mb-2">No Session Data Yet</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-sm">
            Complete a practice session to see your scores and feedback history here.
          </p>
          <button className="primary" onClick={() => navigate('/interview/practice')}>
            <PlayCircle size={16} /> Start Practicing
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 stagger-children">
          <div className="section-heading mb-2">
            <BarChart2 size={14} style={{ color: 'var(--accent-primary)' }} />
            Recent Feedback
          </div>
          {evaluations.slice().reverse().map((ev, i) => (
            <div key={i} className="glass-panel-hover glass-panel p-6 flex flex-col md:flex-row gap-6 md:items-start" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
              <div className="shrink-0 flex justify-center">
                <ScoreRing score={ev.overallScore} max={10} size={64} strokeWidth={5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="m-0 text-lg font-bold">Session {totalSessions - i}</h4>
                  <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                    {new Date(ev.createdAt).toLocaleDateString() || 'Recently'}
                  </span>
                </div>
                <p className="m-0 text-sm text-text-secondary leading-relaxed">
                  {ev.overallFeedback}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Performance;
