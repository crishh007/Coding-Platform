import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, Users, ChevronLeft, Shield, AlertTriangle, Code, ArrowRight } from 'lucide-react';
import client from '../../api/client';

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRegistered, setIsRegistered] = useState(() => {
    const registered = JSON.parse(localStorage.getItem('registeredContests') || '[]');
    return registered.includes(id);
  });

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await client.get(`/contests/${id}`);
        if (res.data) {
          setContest(res.data);
          
          if (res.data.status === 'upcoming') {
            const start = new Date(res.data.startTime).getTime();
            const now = new Date().getTime();
            setTimeLeft(Math.max(0, Math.floor((start - now) / 1000)));
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load contest details.");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
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
    const d = Math.floor(totalSeconds / (3600*24));
    const h = Math.floor(totalSeconds % (3600*24) / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
    return `${h}:${m}:${s}`;
  };

  const handleRegister = async () => {
    // In a full backend implementation, this would be an API call.
    // For now, we persist the registration state in localStorage.
    const registered = JSON.parse(localStorage.getItem('registeredContests') || '[]');
    if (!registered.includes(id)) {
      registered.push(id);
      localStorage.setItem('registeredContests', JSON.stringify(registered));
    }
    setIsRegistered(true);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading contest details...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error)' }}>{error}</div>;
  if (!contest) return <div style={{ textAlign: 'center', padding: '4rem' }}>Contest not found.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button 
        onClick={() => navigate('/contests')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', padding: 0, fontSize: '0.95rem' }}
        className="hover-scale"
      >
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="card animate-fade-in" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', marginBottom: '2rem' }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 60%)', opacity: 0.1, pointerEvents: 'none' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <span className={`badge ${contest.status === 'active' ? 'badge-error' : contest.status === 'upcoming' ? 'badge-primary' : ''}`} style={{ fontSize: '0.85rem' }}>
                {contest.status === 'active' ? '🔴 LIVE NOW' : contest.status === 'upcoming' ? 'Scheduled' : 'Completed'}
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{contest.type}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{contest.difficulty}</span>
            </div>
            
            <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0', lineHeight: 1.2 }}>{contest.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: '0 0 2rem 0', maxWidth: '600px' }}>
              {contest.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}><Calendar size={20} color="var(--primary)" /></div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Start Time</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{new Date(contest.startTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}><Clock size={20} color="var(--primary)" /></div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Duration</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{contest.duration} Minutes</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px' }}><Users size={20} color="var(--primary)" /></div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Participants</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Max {contest.maxParticipants}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '2rem', minWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--box-bg)' }}>
            {contest.status === 'upcoming' && (
              <>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Starts In</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)', marginBottom: '1.5rem', letterSpacing: '2px' }}>
                  {formatTime(timeLeft)}
                </div>
                {isRegistered ? (
                  <button className="pr-btn" disabled style={{ width: '100%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: '1px solid rgba(34, 197, 94, 0.2)', padding: '1rem' }}>
                    Registered Successfully
                  </button>
                ) : (
                  <button className="pr-btn primary hover-scale" onClick={handleRegister} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                    Register Now
                  </button>
                )}
              </>
            )}

            {contest.status === 'active' && (
              <>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--error)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--error)', animation: 'pulse 2s infinite' }}></div>
                  CONTEST IS LIVE
                </div>
                <button className="pr-btn hover-scale" onClick={() => navigate(`/contests/${id}/arena`)} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--error)', color: 'white', border: 'none' }}>
                  Join Arena <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
                </button>
              </>
            )}

            {contest.status === 'ended' && (
              <>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  CONTEST ENDED
                </div>
                <button className="pr-btn primary hover-scale" onClick={() => navigate(`/contests/${id}/arena?virtual=true`)} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                  Virtual Practice
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rules & Details Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Problem List */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={22} color="var(--primary)" /> Included Problems
          </h2>
          {contest.problems && contest.problems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {contest.problems.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span style={{ fontWeight: 500 }}>{p.title}</span>
                  </div>
                  {p.points > 0 && <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.points} pts</span>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              Problem details are hidden until the contest begins.
            </div>
          )}
        </div>

        {/* Rules */}
        <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={22} color="var(--primary)" /> Contest Rules
          </h2>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Please ensure you have a stable internet connection before starting.</li>
            <li>The contest timer will begin exactly at the scheduled start time.</li>
            <li>Once you submit a solution, you cannot modify it after the contest ends.</li>
            <li>Plagiarism detection will be strictly enforced on all submissions.</li>
            <li>Use of external AI tools or unauthorized assistance is strictly prohibited and will result in an immediate ban.</li>
          </ul>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', gap: '1rem' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.9rem' }}>
              <strong>Anti-Cheat Active:</strong> This contest is monitored. Navigating away from the arena or pasting large blocks of code will trigger an anomaly report.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
