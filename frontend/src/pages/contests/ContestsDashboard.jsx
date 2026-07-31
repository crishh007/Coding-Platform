import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Calendar, Users, Award, Zap, ChevronRight, Medal, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import client from '../../api/client';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '50px', color: 'red'}}><h1>React Error</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children;
  }
}

export default function ContestsDashboardWrapper() {
  return <ErrorBoundary><ContestsDashboard /></ErrorBoundary>;
}

function ContestsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contests'); // 'contests' or 'leaderboard'
  
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [ongoingContests, setOngoingContests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(() => {
    return sessionStorage.getItem('showContestDraft') === 'true';
  });
  const [modalError, setModalError] = useState(null);
  const [globalProblems, setGlobalProblems] = useState([]);
  
  const [createForm, setCreateForm] = useState(() => {
    const saved = sessionStorage.getItem('contestDraft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { title: '', description: '', startTime: '', duration: 60, maxParticipants: 50, problems: [] };
  });

  useEffect(() => {
    sessionStorage.setItem('contestDraft', JSON.stringify(createForm));
  }, [createForm]);

  useEffect(() => {
    sessionStorage.setItem('showContestDraft', showCreateModal);
  }, [showCreateModal]);

  // Fetch problems for the modal
  useEffect(() => {
    if (showCreateModal && globalProblems.length === 0) {
      client.get('/problems').then(res => setGlobalProblems(res || [])).catch(console.error);
    }
  }, [showCreateModal]);

  const handleCreateContest = async (e) => {
    e.preventDefault();
    setModalError(null);
    try {
      const payload = {
        ...createForm,
        startTime: new Date(createForm.startTime).toISOString(),
        problems: createForm.problems.map(pid => {
          const p = globalProblems.find(x => x.id === pid);
          return { problemId: pid, title: p?.title || 'Unknown' };
        })
      };
      await client.post('/contests', payload);
      sessionStorage.removeItem('contestDraft');
      sessionStorage.removeItem('showContestDraft');
      setShowCreateModal(false);
      window.location.reload(); // Quick refresh to see the new contest
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error || "Failed to create contest. Please try again.");
    }
  };

  const handleDeleteContest = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this custom contest?")) return;
    try {
      await client.delete(`/contests/${id}`);
      setUpcomingContests(prev => prev.filter(c => c.id !== id));
      setOngoingContests(prev => prev.filter(c => c.id !== id));
      setPastContests(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to delete contest.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          client.get('/contests'),
          client.get('/leaderboard/global'),
          client.get('/teams'),
          client.get('/violations')
        ]);

        const [contestsRes, leaderboardRes, teamsRes, violationsRes] = results;

        if (contestsRes.status === 'fulfilled' && contestsRes.value.data?.data) {
          setUpcomingContests(contestsRes.value.data.data.upcoming || []);
          setPastContests(contestsRes.value.data.data.past || []);
          setOngoingContests(contestsRes.value.data.data.ongoing || []);
        } else if (contestsRes.status === 'rejected') {
          console.error("Failed to fetch contests:", contestsRes.reason);
          setError("Failed to load contests data. Please make sure you are logged in.");
        }

        if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.data?.data) {
          setLeaderboard(leaderboardRes.value.data.data);
        }
        if (teamsRes.status === 'fulfilled' && teamsRes.value.data?.data) {
          setTeams(teamsRes.value.data.data);
        }
        if (violationsRes.status === 'fulfilled' && violationsRes.value.data?.data) {
          setViolations(violationsRes.value.data.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data. Please make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRankColor = (rank) => {
    if (rank === 1) return '#eab308'; // Gold
    if (rank === 2) return '#94a3b8'; // Silver
    if (rank === 3) return '#b45309'; // Bronze
    return 'var(--text-secondary)';
  };

  const getTierBadge = (tier) => {
    let bg = 'rgba(59, 130, 246, 0.1)';
    let color = '#3b82f6';
    if (tier === 'Grandmaster') { bg = 'rgba(239, 68, 68, 0.1)'; color = '#ef4444'; }
    else if (tier === 'Master') { bg = 'rgba(245, 158, 11, 0.1)'; color = '#f59e0b'; }
    else if (tier === 'Candidate Master') { bg = 'rgba(168, 85, 247, 0.1)'; color = '#a855f7'; }

    return (
      <span style={{ 
        padding: '0.25rem 0.75rem', 
        borderRadius: '50px', 
        background: bg, 
        color: color, 
        fontSize: '0.75rem', 
        fontWeight: 600 
      }}>
        {tier}
      </span>
    );
  };

  return (
    <div className="page-container" style={{ paddingTop: '3rem' }}>
      <div style={{ textAlign: 'center', width: '100%', margin: '0 auto 2.5rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Trophy size={24} />
          </div>
          <h1 className="pr-title" style={{ fontSize: '2.5rem', margin: 0, letterSpacing: '-0.02em', fontWeight: '700' }}>Contests & Ranks</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.5', maxWidth: '700px', margin: '0 auto' }}>
          Compete with others, climb the leaderboard, and improve your skills.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '850px', margin: '0 auto 3rem auto' }}>
        <button 
          onClick={() => setActiveTab('contests')}
          style={{
            padding: '0 1.2rem',
            height: '42px',
            borderRadius: '8px',
            background: activeTab === 'contests' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'contests' ? 'var(--text-main)' : 'var(--text-secondary)',
            border: activeTab === 'contests' ? 'none' : '1px solid rgba(255,255,255,0.12)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        >
          <Zap size={16} /> Contests
        </button>
        <button 
          onClick={() => setActiveTab('leaderboard')}
          style={{
            padding: '0 1.2rem',
            height: '42px',
            borderRadius: '8px',
            background: activeTab === 'leaderboard' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'leaderboard' ? 'var(--text-main)' : 'var(--text-secondary)',
            border: activeTab === 'leaderboard' ? 'none' : '1px solid rgba(255,255,255,0.12)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        >
          <Award size={16} /> Global Leaderboard
        </button>
        <button 
          onClick={() => setActiveTab('teams')}
          style={{
            padding: '0 1.2rem',
            height: '42px',
            borderRadius: '8px',
            background: activeTab === 'teams' ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'teams' ? 'var(--text-main)' : 'var(--text-secondary)',
            border: activeTab === 'teams' ? 'none' : '1px solid rgba(255,255,255,0.12)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        >
          <Users size={16} /> Teams
        </button>
        <button 
          onClick={() => setActiveTab('violations')}
          style={{
            padding: '0 1.2rem',
            height: '42px',
            borderRadius: '8px',
            background: activeTab === 'violations' ? 'var(--error)' : 'rgba(255,255,255,0.06)',
            color: activeTab === 'violations' ? '#fff' : 'var(--text-secondary)',
            border: activeTab === 'violations' ? 'none' : '1px solid rgba(255,255,255,0.12)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        >
          <AlertTriangle size={16} /> Anti-Cheat
        </button>
      </div>

      <div className="page-content">
        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading dashboard data...</div>}
        {error && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        {!loading && !error && activeTab === 'contests' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-1rem' }}>
              <button 
                className="pr-btn primary"
                onClick={() => setShowCreateModal(true)}
                style={{ background: 'var(--primary)', color: 'var(--text-main)', border: 'none', fontWeight: 'bold' }}
              >
                + Create Custom Contest
              </button>
            </div>

            {/* Ongoing Contests */}
            {ongoingContests.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--error)', animation: 'pulse 2s infinite' }}></div>
                  Live Now
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                  {ongoingContests.map(c => (
                    <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--error)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.title}</h3>
                        <span className="badge badge-error">Live</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} /> Ends {new Date(c.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={16} /> {c.maxParticipants} Registered
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {c.isCustom && currentUser && c.creatorId === currentUser.id && (
                          <button 
                            onClick={(e) => handleDeleteContest(c.id, e)}
                            className="pr-btn" 
                            style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button className="pr-btn primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/contests/${c.id}`)}>
                          Enter Arena
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Contests */}
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--primary)" /> Upcoming Contests
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
                {upcomingContests.map(c => (
                  <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{c.title}</h3>
                      <span className="badge badge-primary">Scheduled</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} /> {new Date(c.startTime).toLocaleDateString()} at {new Date(c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {c.duration} mins
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> {c.maxParticipants} Registered
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      {c.isCustom && currentUser && c.creatorId === currentUser.id && (
                        <button 
                          onClick={(e) => handleDeleteContest(c.id, e)}
                          className="pr-btn" 
                          style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button 
                        className="pr-btn primary" 
                        style={{ flex: 1, justifyContent: 'center' }}
                        onClick={() => navigate(`/contests/${c.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Contests */}
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={20} color="var(--text-secondary)" /> Past Contests (Virtual Participation)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pastContests.map(c => (
                  <div key={c.id} className="card hover-scale" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', cursor: 'pointer' }} onClick={() => navigate(`/contests/${c.id}?virtual=true`)}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{c.title}</h4>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14}/> {new Date(c.startTime).toLocaleDateString()}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14}/> {c.maxParticipants} Participants</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Virtual Practice</span>
                      <ChevronRight size={20} color="var(--text-muted)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && activeTab === 'leaderboard' && (
          <div className="animate-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Medal size={24} color="#eab308" /> Global Rankings
              </h2>
              <div className="search-input-glass" style={{ width: '250px', padding: '0.5rem 1rem' }}>
                <input type="text" placeholder="Search users..." style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--box-bg)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem', width: '80px' }}>Rank</th>
                  <th style={{ padding: '1rem 1.5rem' }}>User</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Tier</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Problems Solved</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Contest Rating</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user) => (
                  <tr key={user.handle} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-box-bg">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 800, fontSize: '1.1rem', color: getRankColor(user.rank) }}>
                      #{user.rank}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--box-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {getTierBadge(user.tier)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: 'var(--text-main)' }}>
                      {user.solveCount}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                      {user.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === 'teams' && (
          <div className="animate-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={24} color="var(--primary)" /> Teams
              </h2>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Create Team</button>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--box-bg)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>Team Name</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Members</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>Contests Won</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Team Rating</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-box-bg">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {team.name}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {(team.members || []).length} / 5
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: 'var(--success)' }}>
                      {team.stats?.contestsWon || 0}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}>
                      {team.stats?.rating || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && activeTab === 'violations' && (
          <div className="animate-fade-in card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={24} color="var(--error)" /> Anti-Cheat & Violations
              </h2>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--box-bg)', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem' }}>User</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Violation Type</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Severity</th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover:bg-box-bg">
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      @{v.userId || v.user}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                      {v.type}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span className={`badge ${v.severity === 'High' ? 'badge-error' : 'badge-warning'}`}>{v.severity}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <span style={{ color: v.status === 'Resolved' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateContestModal 
        show={showCreateModal} 
        onClose={() => {
          sessionStorage.removeItem('contestDraft');
          sessionStorage.removeItem('showContestDraft');
          setShowCreateModal(false);
        }}
        form={createForm}
        setForm={setCreateForm}
        problems={globalProblems}
        onSubmit={handleCreateContest}
        error={modalError}
        onPreview={(id) => navigate(`/practice/problems/${id}?preview=true`)}
      />
    </div>
  );
}

// Minimal Create Contest Modal inline component
function CreateContestModal({ show, onClose, form, setForm, problems, onSubmit, error, onPreview }) {
  if (!show) return null;
  
  const toggleProblem = (id) => {
    if (form.problems.includes(id)) {
      setForm({...form, problems: form.problems.filter(p => p !== id)});
    } else {
      setForm({...form, problems: [...form.problems, id]});
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '850px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Create Custom Contest</h2>
        
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Left Pane: Details */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Contest Title</label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', transition: 'border 0.2s' }} placeholder="e.g. Weekly Study Group" />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Description</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', minHeight: '120px', resize: 'vertical' }} placeholder="Contest rules and details..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Start Date & Time</label>
                  <input required type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Duration (mins)</label>
                  <input required type="number" min="15" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white' }} />
                </div>
              </div>
            </div>

            {/* Right Pane: Problem Selection */}
            <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Select Problems</span>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                  {form.problems.length} Selected
                </span>
              </label>
              
              <div style={{ 
                display: 'flex', flexDirection: 'column', gap: '0.75rem', 
                maxHeight: '400px', overflowY: 'auto', 
                padding: '0.5rem', background: 'var(--box-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' 
              }}>
                {problems.map(p => {
                  const isSelected = form.problems.includes(p.id);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleProblem(p.id)}
                      className="hover-card"
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)',
                        border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '18px', height: '18px', borderRadius: '4px', 
                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{p.title}</h4>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button 
                            type="button"
                            title="Preview Problem"
                            onClick={(e) => { e.stopPropagation(); onPreview(p.id); }}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                          >
                            <Eye size={16} className="hover:text-primary transition-colors" />
                          </button>
                          <span className={`badge badge-${p.difficulty === 'Easy' ? 'success' : (p.difficulty === 'Medium' ? 'warning' : 'error')}`} style={{ fontSize: '0.7rem' }}>
                            {p.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      {p.topics && p.topics.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginLeft: '28px' }}>
                          {p.topics.slice(0, 4).map(t => (
                            <span key={t} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {problems.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading problems...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="pr-btn" style={{ padding: '0.75rem 2rem' }}>Cancel</button>
            <button type="submit" className="pr-btn primary" style={{ padding: '0.75rem 2rem' }}>Launch Contest</button>
          </div>
        </form>
      </div>
    </div>
  );
}
