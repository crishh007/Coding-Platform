import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Code2, BrainCircuit, Network, Sun, Moon, Mic, 
  ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap,
  Lock, BookOpen, Layers, CheckCircle, Monitor, Smartphone, Server, Cloud, Shield, Database, Cpu, Target, Award
} from 'lucide-react';
import './index.css';

import HRInterview from './pages/hr/HRInterview';
import ResumeBuilder from './pages/resume/ResumeBuilder';
import { Aptitude } from './pages/Aptitude';
import { SystemDesign } from './pages/SystemDesign';
import MockInterview from './pages/MockInterview';
import CodingInterview from './pages/CodingInterview';

/* ═══════ CARDS ═══════ */
const ModuleCard = ({ to, icon, iconBg, title, description, badges = [], accentColor, comingSoon = false }) => {
  const content = (
    <>
      {/* Glow orb */}
      <div 
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: accentColor }}
      />
      
      <div className="flex justify-between items-start mb-5">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: iconBg, color: accentColor }}
        >
          {icon}
        </div>
        {comingSoon && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', border: '1px solid var(--border-color)' }}>
            <Lock size={12} /> Coming Soon
          </div>
        )}
      </div>

      <h3 className={`text-lg font-bold mb-2 transition-colors ${comingSoon ? 'text-gray-500' : 'group-hover:text-text-primary'}`} style={{ color: comingSoon ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-1.5 flex-wrap">
          {badges.map((b, i) => (
            <span key={i} className="badge" style={{ 
              background: comingSoon ? 'var(--bg-tertiary)' : (b.highlight ? `${accentColor}15` : 'var(--bg-tertiary)'),
              color: comingSoon ? 'var(--text-tertiary)' : (b.highlight ? accentColor : 'var(--text-tertiary)'),
              border: `1px solid ${comingSoon ? 'var(--border-color)' : (b.highlight ? `${accentColor}25` : 'var(--border-color)')}`
            }}>
              {b.label}
            </span>
          ))}
        </div>
        {!comingSoon && (
          <ArrowRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
            style={{ color: accentColor }} 
          />
        )}
      </div>
    </>
  );

  const className = `glass-panel group relative flex flex-col p-7 overflow-hidden ${comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`;
  const style = { textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' };

  if (comingSoon) {
    return (
      <div className={className} style={style}>
        {content}
      </div>
    );
  }

  return (
    <Link 
      to={to} 
      className={className} 
      style={style}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `0 20px 40px -12px ${accentColor}25`;
        e.currentTarget.style.borderColor = `${accentColor}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      {content}
    </Link>
  );
};

const ActionCard = ({ title, icon, accentColor, comingSoon = false, to = "#" }) => {
  const content = (
    <div className="flex items-center gap-4 w-full">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accentColor}15`, color: accentColor }}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <h4 className="font-semibold text-sm" style={{ color: comingSoon ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{title}</h4>
      </div>
      {comingSoon ? (
        <Lock size={14} style={{ color: 'var(--text-tertiary)' }} />
      ) : (
        <ArrowRight size={14} style={{ color: accentColor }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );

  const className = `glass-panel flex p-4 rounded-xl items-center transition-all duration-200 group ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-opacity-50 cursor-pointer'}`;
  
  if (comingSoon) {
    return <div className={className}>{content}</div>;
  }
  
  return (
    <Link to={to} className={className} style={{ textDecoration: 'none', borderColor: 'var(--border-color)' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${accentColor}50`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      {content}
    </Link>
  );
};

const DomainCard = ({ title, icon, accentColor, comingSoon = false }) => {
  return (
    <div className={`glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300 ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-2'}`}
         style={{ borderColor: 'var(--border-color)' }}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${accentColor}15`, color: accentColor }}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm mb-1" style={{ color: comingSoon ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{title}</h3>
        {comingSoon && <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-tertiary)' }}>Coming Soon</span>}
      </div>
    </div>
  );
};

/* ═══════ INTERVIEWS DASHBOARD ═══════ */
const InterviewsDashboard = () => {
  const [activeMode, setActiveMode] = useState('foundational');
  
  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-8 p-10 md:p-12" style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border-color)'
      }}>
        <div className="absolute top-0 left-0 w-full h-[2px]" style={{
          background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary), var(--accent-tertiary))'
        }} />
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
          style={{ background: 'var(--accent-primary)' }} />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-15 pointer-events-none"
          style={{ background: 'var(--accent-secondary)' }} />
        
        <div className="relative z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(124, 92, 252, 0.1)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(124, 92, 252, 0.2)'
            }}>
            <Sparkles size={12} /> Ultimate Prep Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ letterSpacing: '-0.04em', lineHeight: 1.15 }}>
            Master Your Next{' '}
            <span className="text-transparent bg-clip-text" style={{
              backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
            }}>Interview</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-0" style={{ color: 'var(--text-secondary)', maxWidth: 520 }}>
            From foundational revision to hyper-realistic AI simulations. Choose your stage and begin preparing.
          </p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex p-1.5 rounded-xl glass-panel" style={{ background: 'var(--bg-secondary)' }}>
          {[
            { id: 'foundational', label: 'Foundational', icon: <BookOpen size={16} /> },
            { id: 'specialized', label: 'Specialized', icon: <Layers size={16} /> },
            { id: 'simulations', label: 'Simulations', icon: <Target size={16} /> }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeMode === mode.id ? 'shadow-md' : 'hover:bg-white/5 opacity-70'}`}
              style={{
                background: activeMode === mode.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeMode === mode.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: `1px solid ${activeMode === mode.id ? 'var(--border-color)' : 'transparent'}`,
                cursor: 'pointer'
              }}
            >
              {React.cloneElement(mode.icon, { style: { color: activeMode === mode.id ? 'var(--accent-primary)' : 'inherit' } })}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Content */}
      <div className="stagger-children">
        
        {activeMode === 'foundational' && (
          <div>
            <div className="section-heading"><BookOpen size={14} style={{ color: 'var(--accent-primary)' }}/> Core Concepts & Revision</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <ActionCard to="/aptitude" title="Quick Quizzes (Aptitude)" icon={<BrainCircuit />} accentColor="#22c55e" />
              <ActionCard title="Core Concepts (Notes)" icon={<FileText />} accentColor="#3b82f6" comingSoon />
              <ActionCard title="Cheat Sheets" icon={<Layers />} accentColor="#8b5cf6" comingSoon />
              <ActionCard title="FAQ & Interview Bank" icon={<Database />} accentColor="#f59e0b" comingSoon />
              <ActionCard title="Important Formulas" icon={<Code2 />} accentColor="#ec4899" comingSoon />
              <ActionCard title="Common Mistakes" icon={<Shield />} accentColor="#ef4444" comingSoon />
              <ActionCard title="Concept-wise MCQs" icon={<CheckCircle />} accentColor="#14b8a6" comingSoon />
              <ActionCard title="Flashcards" icon={<Layers />} accentColor="#6366f1" comingSoon />
              <ActionCard title="Topic-wise Coding" icon={<Monitor />} accentColor="#0ea5e9" comingSoon />
              <ActionCard title="Revision Tracker" icon={<Target />} accentColor="#84cc16" comingSoon />
            </div>
          </div>
        )}

        {activeMode === 'specialized' && (
          <div>
             <div className="section-heading"><Layers size={14} style={{ color: 'var(--accent-secondary)' }}/> Domain Specific Prep</div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <DomainCard title="Frontend" icon={<Monitor size={24}/>} accentColor="#06b6d4" comingSoon />
                <DomainCard title="Backend" icon={<Server size={24}/>} accentColor="#10b981" comingSoon />
                <DomainCard title="iOS" icon={<Smartphone size={24}/>} accentColor="#6366f1" comingSoon />
                <DomainCard title="Android" icon={<Smartphone size={24}/>} accentColor="#8b5cf6" comingSoon />
                <DomainCard title="AI / ML" icon={<BrainCircuit size={24}/>} accentColor="#ec4899" comingSoon />
                <DomainCard title="Data Science" icon={<Database size={24}/>} accentColor="#f59e0b" comingSoon />
                <DomainCard title="DevOps" icon={<Layers size={24}/>} accentColor="#3b82f6" comingSoon />
                <DomainCard title="Cybersecurity" icon={<Shield size={24}/>} accentColor="#ef4444" comingSoon />
                <DomainCard title="Cloud" icon={<Cloud size={24}/>} accentColor="#0ea5e9" comingSoon />
                <DomainCard title="Company Specific" icon={<Award size={24}/>} accentColor="#eab308" comingSoon />
             </div>
          </div>
        )}

        {activeMode === 'simulations' && (
          <div>
            <div className="section-heading"><Target size={14} style={{ color: 'var(--warning)' }}/> High-Fidelity Practice</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <ModuleCard
                to="/mock-interview"
                icon={<Mic size={22} />}
                iconBg="rgba(226, 75, 229, 0.12)"
                accentColor="#e24be5"
                title="AI Voice Interviewer"
                description="End-to-end voice interviews tailored to your resume with comprehensive feedback."
                badges={[{ label: 'Voice' }, { label: 'Immersive', highlight: true }]}
              />
              <ModuleCard
                to="/coding-interview"
                icon={<Code2 size={22} />}
                iconBg="rgba(56, 189, 248, 0.12)"
                accentColor="#38bdf8"
                title="Mock Coding Interviews"
                description="Solve algorithmic challenges with an AI interviewer and integrated code editor."
                badges={[{ label: 'DSA' }, { label: 'Monaco IDE', highlight: true }]}
              />
              <ModuleCard
                to="/system-design"
                icon={<Network size={22} />}
                iconBg="rgba(251, 146, 60, 0.12)"
                accentColor="#fb923c"
                title="System Design Interviews"
                description="Practice designing scalable distributed systems with an AI architect."
                badges={[{ label: 'Architecture', highlight: true }, { label: 'HLD/LLD' }]}
              />
              <ModuleCard
                to="/interview"
                icon={<Users size={22} />}
                iconBg="rgba(124, 92, 252, 0.12)"
                accentColor="#7c5cfc"
                title="HR Interview Simulation"
                description="Practice behavioral questions with real-time AI feedback using the STAR method."
                badges={[{ label: 'Behavioral' }, { label: 'AI Feedback' }]}
              />
              <ModuleCard
                title="Resume-based Interview"
                icon={<FileText size={22} />}
                description="Deep dive on your specific past experiences and projects."
                accentColor="#10b981"
                comingSoon
              />
              <ModuleCard
                title="Timed Coding Contests"
                icon={<Zap size={22} />}
                description="Compete in simulated OAs under strict time limits."
                accentColor="#ef4444"
                comingSoon
              />
              <ModuleCard
                title="Feedback & Scoring"
                icon={<Target size={22} />}
                description="Detailed analytics of your performance across all simulations."
                accentColor="#8b5cf6"
                comingSoon
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════ NAVBAR ═══════ */
const Navbar = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/resume', label: 'Resume', icon: <FileText size={16} /> },
    { path: '/interviews', label: 'Interviews', icon: <Users size={16} /> },
  ];

  return (
    <div className="navbar">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate('/')}
          style={{ transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" 
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
            <Zap size={16} />
          </div>
          <span className="font-bold text-base tracking-tight hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            PlacementPrep
          </span>
        </div>

        {/* Separator + Nav arrows */}
        <div className="hidden md:flex items-center gap-1.5 border-l pl-4 ml-1" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ padding: 0, background: 'transparent', border: 'none', color: 'var(--text-tertiary)' }}
            title="Go back"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => navigate(1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ padding: 0, background: 'transparent', border: 'none', color: 'var(--text-tertiary)' }}
            title="Go forward"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <nav className="nav-links">
          {navItems.map((item) => {
            let isActive = location.pathname.startsWith(item.path);
            if (item.path === '/interviews' && (
              location.pathname.startsWith('/interview') ||
              location.pathname.startsWith('/mock-interview') || 
              location.pathname.startsWith('/coding-interview') ||
              location.pathname.startsWith('/aptitude') ||
              location.pathname.startsWith('/system-design')
            )) {
              isActive = true;
            }

            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                title={item.label}
              >
                {React.cloneElement(item.icon, {
                  style: { color: isActive ? 'var(--accent-primary)' : 'inherit' }
                })}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={toggleTheme}
          style={{ 
            background: 'var(--bg-tertiary)', 
            border: '1px solid var(--border-color)',
            width: 36, height: 36, minWidth: 36,
            padding: 0, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme === 'dark' ? 'var(--warning)' : 'var(--accent-primary)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
};

/* ═══════ APP ═══════ */
function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/resume" replace />} />
            <Route path="/resume/*" element={<ResumeBuilder />} />
            
            {/* Dashboard Route */}
            <Route path="/interviews" element={<InterviewsDashboard />} />
            
            {/* Module Routes */}
            <Route path="/interview/*" element={<HRInterview />} />
            <Route path="/mock-interview/*" element={<MockInterview />} />
            <Route path="/coding-interview/*" element={<CodingInterview />} />
            <Route path="/aptitude/*" element={<Aptitude />} />
            <Route path="/system-design/*" element={<SystemDesign />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
