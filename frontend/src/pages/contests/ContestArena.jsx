import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Clock, AlertTriangle, ChevronLeft, ArrowRight, Activity, CheckCircle, Code, Shield, Award } from 'lucide-react';
import client from '../../api/client';

export default function ContestArena() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('problems');

  const [contest, setContest] = useState({
    id,
    title: `Loading Arena...`,
    description: '',
    timeRemaining: '--:--',
    problems: [],
    leaderboard: [],
    status: 'active'
  });
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  // Mocking "Gained Points" and "Solved Status" for demonstration.
  // In a real app, this would come from a submissions/user-progress API.
  const [solvedProblems, setSolvedProblems] = useState({});

  useEffect(() => {
    // Fetch Contest Details
    client.get(`/contests/${id}`)
      .then(res => {
        if (res.data) {
          setContest(prev => ({...prev, ...res.data}));
          if (res.data.endTime) {
            const end = new Date(res.data.endTime).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));
          }
          
          // Initially set an empty map, it will be populated when leaderboard fetches
          setSolvedProblems({});
        }
      })
      .catch(err => {
        console.error("Failed to fetch contest:", err);
        setError("Failed to load contest arena.");
      })
      .finally(() => setLoading(false));

    // Fetch Live Leaderboard
    client.get(`/contests/${id}/leaderboard`)
      .then(res => {
        if (res.data) {
          setContest(prev => ({ ...prev, leaderboard: res.data }));
          
          // Determine solved problems for current user from leaderboard
          const userEntry = res.data.find(l => l.handle === currentUser?.username || l.userId === currentUser?.id);
          if (userEntry && userEntry.solvedProblems) {
             const solvedMap = {};
             contest.problems?.forEach(p => {
                if (userEntry.solvedProblems[p.problemId] !== undefined) {
                   const maxScore = userEntry.solvedProblems[p.problemId];
                   solvedMap[p.problemId] = { 
                       solved: maxScore > 0, // Mark as solved if ANY points are gained
                       gainedPoints: maxScore 
                   };
                }
             });
             setSolvedProblems(solvedMap);
          }
        }
      })
      .catch(console.error);
      
    // Auto-refresh leaderboard every 30 seconds
    const interval = setInterval(() => {
      client.get(`/contests/${id}/leaderboard`)
        .then(res => {
          if (res.data) {
            setContest(prev => ({ ...prev, leaderboard: res.data }));
            
            // Also refresh solved problems
            const userEntry = res.data.find(l => l.handle === currentUser?.username || l.userId === currentUser?.id);
            if (userEntry && userEntry.solvedProblems) {
               setSolvedProblems(prevSolved => {
                  const newSolved = { ...prevSolved };
                  contest.problems?.forEach(p => {
                     if (userEntry.solvedProblems[p.problemId] !== undefined) {
                        const maxScore = userEntry.solvedProblems[p.problemId];
                        newSolved[p.problemId] = { 
                            solved: maxScore === p.points,
                            gainedPoints: maxScore 
                        };
                     }
                  });
                  return newSolved;
               });
            }
          }
        }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
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
    switch(diff?.toLowerCase()) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return 'var(--text-main)';
    }
  };

  // Calculate total points
  const totalMaxPoints = contest.problems?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
  const totalGainedPoints = Object.values(solvedProblems).reduce((sum, s) => sum + (s.gainedPoints || 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Entering Arena...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error)' }}>{error}</div>;

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'var(--bg-main)', padding: '2rem 3rem' }}>
      {/* Premium Header */}
      <div className="card glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '2px solid var(--primary)', borderRadius: '16px' }}>
        <div>
          <button 
            className="pr-btn-icon hover-scale" 
            style={{ padding: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
            onClick={() => navigate('/contests')}
          >
            <ChevronLeft size={16} /> Exit Arena
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: timeLeft === 0 ? 'var(--text-secondary)' : 'var(--error)', animation: timeLeft > 0 ? 'pulse 2s infinite' : 'none' }}></div>
            {contest.title}
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {totalGainedPoints} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {totalMaxPoints}</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{timeLeft === 0 ? 'Contest Ended' : 'Time Remaining'}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'monospace', color: timeLeft === 0 ? 'var(--text-secondary)' : 'var(--text-main)', letterSpacing: '1px' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button 
              onClick={() => setActiveTab('problems')}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: activeTab === 'problems' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'problems' ? 700 : 500, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
            >
              <Code size={20} /> Problems
              {activeTab === 'problems' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px 3px 0 0' }}></div>}
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: activeTab === 'leaderboard' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'leaderboard' ? 700 : 500, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
            >
              <Activity size={20} /> Live Leaderboard
              {activeTab === 'leaderboard' && <div style={{ position: 'absolute', bottom: '-0.6rem', left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px 3px 0 0' }}></div>}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'problems' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {contest.problems && contest.problems.length > 0 ? contest.problems.map((prob, idx) => {
                const isSolved = solvedProblems[prob.problemId]?.solved;
                const gained = solvedProblems[prob.problemId]?.gainedPoints || 0;
                
                return (
                  <div key={prob.problemId || idx} className="card hover-scale" style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', cursor: 'pointer', 
                    border: isSolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                    background: isSolved ? 'rgba(16, 185, 129, 0.02)' : 'var(--box-bg)',
                    position: 'relative', overflow: 'hidden'
                  }} onClick={() => navigate(`/practice/problems/${prob.problemId || 'two-sum'}?contestId=${contest.id}`)}>
                    
                    {/* Solved Progress Bar Background */}
                    {isSolved && <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: 'var(--success)', width: '100%' }}></div>}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ 
                        width: '45px', height: '45px', borderRadius: '12px', 
                        background: isSolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                        color: isSolved ? 'var(--success)' : 'var(--text-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      
                      <div>
                        <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {prob.title}
                          {isSolved && <CheckCircle size={18} color="var(--success)" />}
                        </h3>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem' }}>
                          <span style={{ color: getDifficultyColor(prob.difficulty), fontWeight: 600 }}>{prob.difficulty || 'Standard'}</span>
                          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Award size={14} /> Max {prob.points} Pts
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        {isSolved ? (
                          <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Solved ({gained}/{prob.points})</span>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gained</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: gained > 0 ? '#f59e0b' : 'var(--text-main)' }}>
                              {gained} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {prob.points}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <button className={`pr-btn ${isSolved ? '' : 'primary'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: isSolved ? 'rgba(255,255,255,0.05)' : 'var(--primary)' }}>
                        {isSolved ? 'Review' : 'Solve'} <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                  No problems have been added to this contest yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="animate-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '1.25rem 1.5rem', width: '80px' }}>Rank</th>
                    <th style={{ padding: '1.25rem 1.5rem' }}>User</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Score</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>Penalty</th>
                  </tr>
                </thead>
                <tbody>
                  {contest.leaderboard && contest.leaderboard.length > 0 ? contest.leaderboard.map((user) => (
                    <tr key={user.handle} style={{ borderBottom: '1px solid var(--border-color)' }} className="hover:bg-box-bg">
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, fontSize: '1.1rem', color: user.rank <= 3 ? '#eab308' : 'var(--text-secondary)' }}>
                        #{user.rank}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        @{user.handle}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {user.score}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {user.penalty}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Leaderboard is empty. Be the first to solve a problem!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', fontSize: '1.1rem' }}>
              <Shield size={20} /> Strict Anti-Cheat Active
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your session is being monitored. Navigating away from the arena tab, pasting large blocks of code, or disabling your network will instantly flag your submission for review.
            </p>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <AlertTriangle size={20} color="var(--primary)" /> Contest Rules
            </h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>Submitting a wrong answer incurs a <strong>5-minute time penalty</strong>.</li>
              <li>Your total score is the sum of points from all solved problems.</li>
              <li>Ties on the leaderboard are broken by the lowest total time penalty.</li>
              <li>Code execution time limits are strictly enforced. Optimize your logic!</li>
            </ul>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Contest Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type</span>
                <span style={{ fontWeight: 600 }}>{contest.type || 'Custom'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Difficulty</span>
                <span style={{ fontWeight: 600 }}>{contest.difficulty || 'Mixed'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                <span style={{ fontWeight: 600 }}>{contest.duration} mins</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Problems</span>
                <span style={{ fontWeight: 600 }}>{contest.problems?.length || 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
