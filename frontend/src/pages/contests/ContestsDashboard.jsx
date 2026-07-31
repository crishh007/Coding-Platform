import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Calendar, Users, Award, Zap, ArrowRight, ChevronRight, Medal, AlertTriangle } from 'lucide-react';
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
  
  const [upcomingContests, setUpcomingContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contestsRes, leaderboardRes, teamsRes, violationsRes] = await Promise.all([
          client.get('/contests'),
          client.get('/leaderboard/global'),
          client.get('/teams'),
          client.get('/violations')
        ]);

        if (contestsRes.data?.data) {
          setUpcomingContests(contestsRes.data.data.upcoming || []);
          setPastContests(contestsRes.data.data.past || []);
        }
        if (leaderboardRes.data?.data) setLeaderboard(leaderboardRes.data.data);
        if (teamsRes.data?.data) setTeams(teamsRes.data.data);
        if (violationsRes.data?.data) setViolations(violationsRes.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
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
                    
                    <button 
                      className="pr-btn primary" 
                      style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                      onClick={() => navigate(`/contests/${c.id}`)}
                    >
                      View Details
                    </button>
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
    </div>
  );
}
