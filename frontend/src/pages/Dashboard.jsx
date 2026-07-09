import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Compass, 
  Code2, 
  Sparkles, 
  Briefcase, 
  Award, 
  Play, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Flame,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import heroImg from '../assets/dashboard_hero_dev.png';
import StatsCards from "../components/Dashboard/StatsCards";
import LearningChart from "../components/Dashboard/LearningChart";
import ActivityHeatmap from "../components/Dashboard/ActivityHeatmap";
import LanguagePieChart from "../components/Dashboard/LanguagePieChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [toastMessage, setToastMessage] = useState('');
  
  // Real-time Countdown Timer for Contest
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 15 * 60 + 34); // 2 hours, 15 minutes, 34 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return { hrs, mins, secs };
  };

  const { hrs, mins, secs } = formatTime(timeLeft);

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const subTabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'learn', label: 'Learn', path: '/modes' },
    { id: 'practice', label: 'Practice', dummy: true },
    { id: 'contests', label: 'Contests', dummy: true },
    { id: 'interview', label: 'Interview Prep', dummy: true },
    { id: 'ai', label: 'AI Learning', dummy: true },
    { id: 'projects', label: 'Projects', dummy: true },
    { id: 'community', label: 'Community', dummy: true }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0.5rem 2rem 0.5rem' }}>
      


      {/* Main content grid */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: '2.3fr 1fr',
        gap: '1.5rem'
      }}>
        
        {/* Left main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Hero Welcome Card */}
          <div style={{
            background: 'linear-gradient(135deg, #131130 0%, #0d0f22 100%)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
            {/* Background glowing decorations */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ maxWidth: '60%', zIndex: 2 }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#fff' }}>Hi, Developer! 👋</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
                Ready to continue your learning journey?
              </p>
              
              {/* Stats Line */}
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Rank</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>#2,543</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>XP</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>12,450</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Level</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Lv. 14</span>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Top Skill</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-hover)' }}>Data Structures</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/modes')}
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  color: '#fff',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
                  transition: 'var(--transition-normal)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                className="hover-card"
              >
                <span>Continue Learning</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Illustration */}
            <div style={{ 
              width: '200px', 
              height: '180px', 
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={heroImg} 
                alt="Developer Illustration" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.2))' 
                }} 
              />
            </div>
          </div>
          <StatsCards />
        

          {/* Continue Where You Left Off */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem 0' }}>
              Continue Where You Left Off
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Arrays and Strings', category: 'Data Structures', pct: 75, icon: Layers, color: 'var(--primary)' },
                { title: 'Binary Search', category: 'Algorithms', pct: 60, icon: Code2, color: 'var(--info)' },
                { title: '0/1 Knapsack', category: 'Dynamic Programming', pct: 30, icon: Sparkles, color: 'var(--success)' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => navigate('/modes')}
                    style={{
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--box-bg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                      }}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>{item.category}</span>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 650, color: '#fff' }}>{item.title}</h4>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      <span>Progress</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{item.pct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '4px', background: 'var(--box-bg)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${item.pct}%`, 
                        height: '100%', 
                        background: item.color, 
                        boxShadow: `0 0 6px ${item.color}`,
                        borderRadius: '10px' 
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <StatsCards />

          <LearningChart />
          <div
           style={{
           display: "grid",
           gridTemplateColumns: "1fr 1fr",
           gap: "20px",
           marginBottom: "30px",
           }}
          >
          <ActivityHeatmap />
          <LanguagePieChart />
           </div>

          {/* Recommended for You */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem 0' }}>
              Recommended for You
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Graph Data Structure', mode: 'Learn', icon: BookOpen, dur: '28 min', diff: 'Intermediate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)', interactive: true },
                { title: 'Top 50 Array Problems', mode: 'Practice', icon: Code2, dur: '50 problems', diff: 'Easy - Hard', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)' },
                { title: 'System Design Basics', mode: 'Interview Prep', icon: Briefcase, dur: '12 lessons', diff: 'Intermediate', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)' },
                { title: 'Build AI Chatbot', mode: 'AI Learning', icon: Sparkles, dur: 'Project', diff: 'Advanced', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.25)' },
              ].map((rec, idx) => {
                const Icon = rec.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (rec.interactive) {
                        navigate('/modes');
                      } else {
                        triggerToast(`'${rec.title}' is a mock recommendation. Click 'Graph Data Structure' or 'Learn' to launch learning pathways.`);
                      }
                    }}
                    style={{
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      position: 'relative'
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '2px 8px', 
                        borderRadius: '30px', 
                        fontWeight: 700, 
                        color: rec.color,
                        background: rec.bg,
                        border: `1px solid ${rec.border}`
                      }}>
                        {rec.mode}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <div style={{ color: rec.color }}>
                        <Icon size={16} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 650, color: '#fff' }}>{rec.title}</h4>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem', marginTop: 'auto' }}>
                      <span>🕒 {rec.dur}</span>
                      <span>{rec.diff}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What's New? */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: '0 0 1rem 0' }}>
              What's New?
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Advanced DP Patterns', desc: 'Level up your DP skills with advanced patterns.', icon: Layers, type: 'New Course', color: 'var(--primary)', isNew: true },
                { title: 'Company Tagged Questions', desc: 'Practice questions asked in top tech companies.', icon: Code2, type: 'New Problems', color: 'var(--success)', isNew: true },
                { title: 'AI Tutor Now Smarter', desc: 'Get better explanations and step-by-step hints.', icon: Sparkles, type: 'Feature Update', color: 'var(--info)', isNew: true },
                { title: 'You ranked in Top 10%!', desc: 'Check out your performance in Weekly Contest 100.', icon: Trophy, type: 'Contest Result', color: 'var(--warning)', isNew: false }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => triggerToast(`'${item.title}' news card is placeholder.`)}
                    style={{
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                    className="hover-card"
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.type}</span>
                        {item.isNew && (
                          <span style={{ 
                            fontSize: '0.55rem', 
                            background: 'rgba(239, 68, 68, 0.15)', 
                            color: '#f87171', 
                            padding: '1px 4px', 
                            borderRadius: '3px',
                            fontWeight: 700
                          }}>
                            New
                          </span>
                        )}
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 650, color: '#fff', lineHeight: 1.3 }}>{item.title}</h4>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right sidebar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Today's Goal */}
          <div className="card" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#fff' }}>Today's Goal</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2/3</span>
            </div>
            
            {/* Goal Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                { text: 'Solve 3 problems', checked: true },
                { text: 'Study for 30 minutes', checked: true },
                { text: 'Take a quiz', checked: false },
              ].map((goal, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: goal.checked ? 'var(--text-secondary)' : '#fff' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: `1px solid ${goal.checked ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: goal.checked ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-hover)',
                    fontSize: '0.7rem'
                  }}>
                    {goal.checked && '✓'}
                  </div>
                  <span style={{ textDecoration: goal.checked ? 'line-through' : 'none', opacity: goal.checked ? 0.7 : 1 }}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Circular or line progress indicator */}
            <div style={{ width: '100%', height: '6px', background: 'var(--box-bg)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: '66%', 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)',
                boxShadow: '0 0 6px var(--primary)',
                borderRadius: '10px' 
              }} />
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              66% Complete
            </div>
          </div>

          {/* Upcoming Contest Card */}
          <div className="card" style={{ 
            padding: '1.25rem', 
            borderColor: 'var(--border-color)',
            background: 'linear-gradient(135deg, rgba(15, 17, 35, 0.9) 0%, rgba(9, 11, 22, 0.9) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* View All link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Upcoming Contest
              </h3>
              <span 
                onClick={() => triggerToast('Contests catalog is dummy.')}
                style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', cursor: 'pointer', fontWeight: 600 }}
              >
                View All
              </span>
            </div>

            {/* Contest Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Weekly Contest 101</span>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--danger)',
                    boxShadow: '0 0 6px var(--danger)',
                    display: 'inline-block'
                  }} />
                  <span style={{ fontSize: '0.6rem', color: 'var(--danger)', textTransform: 'uppercase', fontWeight: 700 }}>Live</span>
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starts in</p>
              </div>
              <Trophy size={36} color="var(--warning)" style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.3))' }} />
            </div>

            {/* Live Count Down Timer Box */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
              {[
                { val: hrs, label: 'HRS' },
                { val: mins, label: 'MIN' },
                { val: secs, label: 'SEC' }
              ].map((time, idx) => (
                <React.Fragment key={idx}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.6rem',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#fff',
                      minWidth: '38px',
                      fontFamily: 'monospace'
                    }}>
                      {time.val}
                    </div>
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem', letterSpacing: '0.5px' }}>{time.label}</span>
                  </div>
                  {idx < 2 && <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', transform: 'translateY(-6px)' }}>:</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Register Trigger */}
            <button
              onClick={() => triggerToast('Successfully registered for Weekly Contest 101!')}
              style={{
                width: '100%',
                padding: '0.6rem',
                fontSize: '0.8rem',
                fontWeight: 650,
                color: '#fff',
                background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
              className="hover-card"
            >
              Register Now
            </button>
          </div>

          {/* Radar Skill Progress Card */}
          <div className="card" style={{ padding: '1.25rem', borderColor: 'var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#fff' }}>Your Progress</h3>
              <span 
                onClick={() => triggerToast('Dashboard analytics page is placeholder.')}
                style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', cursor: 'pointer', fontWeight: 600 }}
              >
                View Dashboard
              </span>
            </div>

            {/* Polygon radar chart using SVG */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <svg width="200" height="200" style={{ overflow: 'visible' }}>
                {/* Outer grid pentagon (100%) */}
                <polygon points="100,30 166.5,78.5 141.5,157 58.5,157 33.5,78.5" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                {/* Mid grid pentagon (60%) */}
                <polygon points="100,58 140,87 125,134 75,134 60,87" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                {/* Inner grid pentagon (30%) */}
                <polygon points="100,79 120,93.5 112.5,117 87.5,117 80,93.5" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                
                {/* Axis lines */}
                <line x1="100" y1="100" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                <line x1="100" y1="100" x2="166.5" y2="78.5" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                <line x1="100" y1="100" x2="141.5" y2="157" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                <line x1="100" y1="100" x2="58.5" y2="157" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
                <line x1="100" y1="100" x2="33.5" y2="78.5" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />

                {/* Filled Radar Polygon representing actual progress:
                    DSA (85%) -> (100, 40.5)
                    Algorithms (70%) -> (146.6, 84.85)
                    System Design (40%) -> (116.46, 122.65)
                    AI/ML (60%) -> (75.3, 134)
                    SQL (75%) -> (50.07, 83.78)
                */}
                <polygon 
                  points="100,40.5 146.6,84.85 116.46,122.65 75.3,134 50.07,83.78" 
                  fill="rgba(139, 92, 246, 0.12)" 
                  stroke="var(--primary)" 
                  strokeWidth="2" 
                  style={{ filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.4))' }}
                />

                {/* Vertices indicator dots */}
                <circle cx="100" cy="40.5" r="3.5" fill="var(--primary)" />
                <circle cx="146.6" cy="84.85" r="3.5" fill="var(--primary)" />
                <circle cx="116.46" cy="122.65" r="3.5" fill="var(--primary)" />
                <circle cx="75.3" cy="134" r="3.5" fill="var(--primary)" />
                <circle cx="50.07" cy="83.78" r="3.5" fill="var(--primary)" />

                {/* Text Labels */}
                <text x="100" y="20" fill="var(--text-main)" fontSize="9" fontWeight="600" textAnchor="middle">DSA (85%)</text>
                <text x="172" y="77" fill="var(--text-secondary)" fontSize="9" textAnchor="start">Algorithms (70%)</text>
                <text x="145" y="170" fill="var(--text-secondary)" fontSize="9" textAnchor="start">System Design (40%)</text>
                <text x="53" y="170" fill="var(--text-secondary)" fontSize="9" textAnchor="end">AI/ML (60%)</text>
                <text x="28" y="77" fill="var(--text-secondary)" fontSize="9" textAnchor="end">SQL (75%)</text>
              </svg>
            </div>
          </div>

        </div>

      </div>

      {/* Local Toast Alert for showcase items */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(9, 11, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          color: '#fff',
          zIndex: 99999,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out forwards'
        }}>
          <span style={{ color: 'var(--primary-hover)' }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
