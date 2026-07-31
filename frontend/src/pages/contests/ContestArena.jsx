import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Clock, AlertTriangle, ChevronLeft, ArrowRight, Activity } from 'lucide-react';
import client from '../../api/client';

export default function ContestArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('problems');

  // Dummy data for a contest
  const [contest, setContest] = useState({
    id,
    title: `Loading...`,
    timeRemaining: '--:--',
    problems: [],
    leaderboard: []
  });
  const [timeLeft, setTimeLeft] = useState(null);
  
  useEffect(() => {
    client.get(`/contests/${id}`)
      .then(res => {
        if (res.data) {
          setContest(res.data);
          if (res.data.endTime) {
            const end = new Date(res.data.endTime).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
          }
        }
      })
      .catch(err => console.error("Failed to fetch contest:", err));
  }, [id]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return '--:--:--';
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'Hard': return '#ef4444';
      default: return 'var(--text-main)';
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            className="pr-btn-icon" 
            style={{ marginBottom: '1rem' }}
            onClick={() => navigate('/contests')}
          >
            <ChevronLeft size={20} /> Back to Contests
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{contest.title}</h1>
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
              <Clock size={16} /> {timeLeft === 0 ? 'Ended' : formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('problems')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'problems' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'problems' ? 'var(--text-main)' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Trophy size={18} /> Problems
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'leaderboard' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'leaderboard' ? 'var(--text-main)' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Activity size={18} /> Live Leaderboard
        </button>
      </div>

      {activeTab === 'problems' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <AlertTriangle color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b' }}>Contest Rules</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You have {timeLeft === 0 ? '00:00' : formatTime(timeLeft)} left. Submitting a wrong answer incurs a 5-minute penalty. Your score is based on the points of problems solved. Ties are broken by total time penalty.
              </p>
            </div>
          </div>

          {contest.problems && contest.problems.map(prob => (
            <div key={prob.id} className="card hover-scale" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', cursor: 'pointer' }} onClick={() => navigate(`/practice/problems/two-sum?contestId=${contest.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--border-color)' }}>
                  {prob.id}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{prob.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                    <span style={{ color: getDifficultyColor(prob.difficulty), fontWeight: 600 }}>{prob.difficulty}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{prob.points} Points</span>
                  </div>
                </div>
              </div>
              
              <button className="pr-btn primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Solve <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="animate-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--box-bg)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', width: '80px' }}>Rank</th>
                <th style={{ padding: '1rem 1.5rem' }}>User</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Score</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {contest.leaderboard && contest.leaderboard.map((user) => (
                <tr key={user.handle} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-box-bg">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 800, fontSize: '1.1rem', color: user.rank <= 3 ? '#eab308' : 'var(--text-secondary)' }}>
                    #{user.rank}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    @{user.handle}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                    {user.score}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {user.penalty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
