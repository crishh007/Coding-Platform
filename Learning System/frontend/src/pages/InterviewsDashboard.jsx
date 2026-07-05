import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Users, Mic, Code2, BrainCircuit, Network, ArrowRight,
  Lock, Layers, CheckCircle, Monitor, Smartphone, Server, Cloud, Shield, Database, Target, Award, Zap, FileText,
  Play, Calendar, TrendingUp, Flame, ListChecks, Building2, Briefcase, BookOpen, Search
} from 'lucide-react';

/* ═══════ CARDS ═══════ */
export const ModuleCard = ({ to, icon, iconBg = 'var(--accent-glow)', title, description, badges = [], accentColor = 'var(--accent-primary)', comingSoon = false }) => {
  const content = (
    <>
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

const ActionCard = ({ title, description, icon, accentColor, comingSoon = false, to = "#" }) => {
  const content = (
    <div className="relative flex flex-col h-full z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" 
             style={{ background: `${accentColor}15`, color: accentColor }}>
          {icon}
        </div>
        {comingSoon ? (
          <span style={{ fontSize: '0.65rem', background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border-color)', fontWeight: 600 }}>Locked</span>
        ) : (
          <ArrowRight size={16} style={{ color: accentColor }} className="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
        )}
      </div>
      
      <h4 className="font-bold text-base mb-2" style={{ color: comingSoon ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{title}</h4>
      {description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      )}
    </div>
  );

  const className = `glass-panel group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 ${comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;
  
  if (comingSoon) {
    return <div className={className}>{content}</div>;
  }
  
  return (
    <Link to={to} className={className} style={{ textDecoration: 'none' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 30px -10px ${accentColor}30`;
        e.currentTarget.style.borderColor = `${accentColor}50`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: accentColor, transform: 'translate(30%, -30%)' }}
      />
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

const CompanyCard = ({ name, color }) => {
  return (
    <div className="glass-panel p-5 rounded-xl flex items-center gap-4 transition-all duration-300 cursor-pointer hover:-translate-y-1"
         style={{ borderColor: 'var(--border-color)' }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{ background: `${color}15`, color: color }}>
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{name}</h4>
      </div>
      <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
    </div>
  );
};

/* ═══════ DASHBOARD COMPONENTS ═══════ */
const RevisionDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Continue Revision */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(139, 92, 246, 0.1) 100%)', borderColor: 'var(--primary)' }}>
        <div>
          <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--primary)' }}>
            <Flame size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Up Next</span>
          </div>
          <h3 className="text-lg font-bold mb-1">Binary Search</h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Topic-wise Coding</p>
        </div>
        <button className="btn-primary mt-4 w-full flex items-center justify-center gap-2" style={{ padding: '0.6rem', borderRadius: '0.5rem' }}>
          <Play size={16} fill="currentColor" /> Continue
        </button>
      </div>

      {/* Daily Revision Goal */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={18} />
          <span className="text-sm font-semibold">Daily Goal</span>
        </div>
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl font-bold">3/5</span>
            <span className="text-xs font-semibold mb-1" style={{ color: 'var(--success)' }}>Modules</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full" style={{ background: 'var(--success)', width: '60%' }} />
          </div>
        </div>
      </div>

      {/* Revision Progress */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--text-secondary)' }}>
          <ListChecks size={18} />
          <span className="text-sm font-semibold">Revision Progress</span>
        </div>
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl font-bold">42%</span>
            <span className="text-xs font-semibold mb-1" style={{ color: 'var(--info)' }}>Completion</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full" style={{ background: 'var(--info)', width: '42%' }} />
          </div>
        </div>
      </div>

      {/* Interview Readiness Score */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center">
        <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
          <TrendingUp size={18} />
          <span className="text-sm font-semibold">Readiness Score</span>
        </div>
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeDasharray="72, 100"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold">72</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════ INTERVIEWS DASHBOARD ═══════ */
const InterviewsDashboard = () => {
  const [searchParams] = useSearchParams();
  const activeMode = searchParams.get('mode') || 'foundational';
  
  const getHeaderContent = () => {
    switch (activeMode) {
      case 'foundational':
        return {
          title: 'Build Your Foundation',
          description: 'Revise smarter. Crack interviews faster.'
        };
      case 'specialized':
        return {
          title: 'Specialized Preparation',
          description: 'Prepare for specific roles and target top tech companies.'
        };
      case 'simulations':
        return {
          title: 'High-Fidelity Practice',
          description: 'Experience hyper-realistic interview scenarios with AI.'
        };
      default:
        return { title: 'Interview Preparation', description: 'Choose your stage and begin preparing.' };
    }
  };

  const header = getHeaderContent();

  return (
    <div className="animate-fade-in w-full pb-8" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '3rem' }}>
      
      {/* Top Header */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{header.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
          {header.description}
        </p>
      </div>

      <div className="stagger-children w-full">
        
        {/* ═══════ FOUNDATIONAL MODE ═══════ */}
        {activeMode === 'foundational' && (
          <div>
            {/* Universal Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-10 group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center glass-panel p-2 rounded-2xl border border-white/10" style={{ background: 'var(--bg-secondary)' }}>
                <Search className="ml-3 text-text-tertiary group-focus-within:text-primary transition-colors" size={24} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  placeholder="Search topics, questions, flashcards... (e.g. Binary Search)" 
                  className="w-full bg-transparent border-none focus:outline-none text-text-primary px-4 py-3 placeholder-text-tertiary"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button className="btn-primary rounded-xl px-6 py-2 ml-2 shadow-lg shadow-primary/20 font-semibold" style={{ background: 'var(--primary)', color: 'white' }}>
                  Search
                </button>
              </div>
            </div>

            <RevisionDashboard />
            
            <div className="flex items-center gap-2 mb-6 text-lg font-bold">
              <BookOpen size={20} style={{ color: 'var(--primary)' }} />
              Revision Modules
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-8">
              <ActionCard to="/interviews/foundational/quick-notes" title="Quick Notes" description="One-page summaries of Arrays, OS, Networking, etc." icon={<FileText size={24} />} accentColor="#3b82f6" />
              <ActionCard to="/interviews/foundational/cheat-sheets" title="Cheat Sheets" description="Quick references for Time Complexity, SQL, Git, Linux." icon={<Layers size={24} />} accentColor="#8b5cf6" />
              <ActionCard to="/interviews/foundational/interview-questions" title="Frequently Asked Questions" description="Beginner to advanced questions for every core topic." icon={<Database size={24} />} accentColor="#f59e0b" />
              <ActionCard to="/interviews/foundational/common-mistakes" title="Common Mistakes" description="Learn to avoid typical pitfalls like overflow or infinite loops." icon={<Shield size={24} />} accentColor="#ef4444" />
              <ActionCard to="/interviews/foundational/flashcards" title="Flashcards" description="Spaced repetition for definitions and key facts." icon={<Layers size={24} />} accentColor="#6366f1" />
              <ActionCard to="/interviews/foundational/mcqs" title="MCQs" description="Unlimited practice with easy, medium, and hard questions." icon={<CheckCircle size={24} />} accentColor="#14b8a6" />
              <ActionCard to="/interviews/foundational/quick-quiz" title="Quick Quiz" description="5-minute targeted quizzes for SQL, OS, OOP, and more." icon={<BrainCircuit size={24} />} accentColor="#22c55e" />
              <ActionCard to="/interviews/foundational/coding-practice" title="Coding Questions" description="Topic-wise DSA problems with integrated editor and test cases." icon={<Code2 size={24} />} accentColor="#ec4899" />
              <ActionCard to="/interviews/foundational/revision-tracker" title="Revision Tracker" description="Track streaks, weak topics, and estimated completion times." icon={<Target size={24} />} accentColor="#84cc16" />
            </div>
          </div>
        )}

        {/* ═══════ SPECIALIZED MODE ═══════ */}
        {activeMode === 'specialized' && (
          <div>
             <div className="flex items-center gap-2 mb-6 text-lg font-bold">
               <Briefcase size={20} style={{ color: 'var(--info)' }} />
               Role-Specific Domains
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                <DomainCard title="Frontend" icon={<Monitor size={24}/>} accentColor="#06b6d4" comingSoon />
                <DomainCard title="Backend" icon={<Server size={24}/>} accentColor="#10b981" comingSoon />
                <DomainCard title="Full Stack" icon={<Layers size={24}/>} accentColor="#3b82f6" comingSoon />
                <DomainCard title="Android" icon={<Smartphone size={24}/>} accentColor="#8b5cf6" comingSoon />
                <DomainCard title="iOS" icon={<Smartphone size={24}/>} accentColor="#6366f1" comingSoon />
                <DomainCard title="AI / ML" icon={<BrainCircuit size={24}/>} accentColor="#ec4899" comingSoon />
                <DomainCard title="Data Science" icon={<Database size={24}/>} accentColor="#f59e0b" comingSoon />
                <DomainCard title="DevOps" icon={<Network size={24}/>} accentColor="#3b82f6" comingSoon />
                <DomainCard title="Cybersecurity" icon={<Shield size={24}/>} accentColor="#ef4444" comingSoon />
                <DomainCard title="Cloud" icon={<Cloud size={24}/>} accentColor="#0ea5e9" comingSoon />
             </div>

             <div className="flex items-center gap-2 mb-6 text-lg font-bold">
               <Building2 size={20} style={{ color: 'var(--warning)' }} />
               Company-Specific Preparation
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
               <CompanyCard name="Google" color="#ea4335" />
               <CompanyCard name="Amazon" color="#f90" />
               <CompanyCard name="Microsoft" color="#00a4ef" />
               <CompanyCard name="Apple" color="#a3aaae" />
               <CompanyCard name="Netflix" color="#e50914" />
               <CompanyCard name="Meta" color="#1877f2" />
               <CompanyCard name="Adobe" color="#ff0000" />
               <CompanyCard name="Oracle" color="#f80000" />
               <CompanyCard name="Infosys" color="#007cc3" />
               <CompanyCard name="TCS" color="#000000" />
               <CompanyCard name="Accenture" color="#a100ff" />
             </div>
          </div>
        )}

        {/* ═══════ SIMULATIONS MODE ═══════ */}
        {activeMode === 'simulations' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <ModuleCard
                to="/mock-interview"
                icon={<Mic size={22} />}
                iconBg="rgba(226, 75, 229, 0.12)"
                accentColor="#e24be5"
                title="Mock Technical Interview"
                description="AI-driven technical questioning via voice or text with dynamic follow-ups."
                badges={[{ label: 'Voice/Text' }, { label: 'Live Score', highlight: true }]}
              />
              <ModuleCard
                to="/coding-interview"
                icon={<Code2 size={22} />}
                iconBg="rgba(56, 189, 248, 0.12)"
                accentColor="#38bdf8"
                title="Coding Interview"
                description="Real coding editor with timer, hidden tests, and AI hints."
                badges={[{ label: 'IDE' }, { label: 'Hidden Tests' }]}
              />
              <ModuleCard
                to="/interview"
                icon={<Users size={22} />}
                iconBg="rgba(124, 92, 252, 0.12)"
                accentColor="#7c5cfc"
                title="HR Interview"
                description="Practice behavioral questions with real-time AI feedback using the STAR method."
                badges={[{ label: 'Behavioral' }, { label: 'STAR Method', highlight: true }]}
              />
              <ModuleCard
                to="/system-design"
                icon={<Network size={22} />}
                iconBg="rgba(251, 146, 60, 0.12)"
                accentColor="#fb923c"
                title="System Design Interview"
                description="Design scalable systems (WhatsApp, Uber) with an AI architect probing your choices."
                badges={[{ label: 'Architecture', highlight: true }, { label: 'HLD/LLD' }]}
              />
              <ModuleCard
                title="Resume Interview"
                icon={<FileText size={22} />}
                description="Upload your resume. AI asks targeted questions about your architecture, tech stack, and challenges."
                accentColor="#10b981"
                comingSoon
              />
              <ModuleCard
                title="Timed Coding Contest"
                icon={<Zap size={22} />}
                description="Compete in a 45-minute simulated OA with a live leaderboard and dynamic scoring."
                accentColor="#ef4444"
                comingSoon
              />
              <ModuleCard
                title="AI Interviewer"
                icon={<BrainCircuit size={22} />}
                description="Full voice conversation with interruptions, cross-questioning, and recording."
                accentColor="#0ea5e9"
                comingSoon
              />
              <ModuleCard
                title="Feedback Report"
                icon={<Target size={22} />}
                description="Detailed breakdown of communication, technical accuracy, and improvement tips."
                accentColor="#8b5cf6"
                comingSoon
              />
              <ModuleCard
                title="Performance Analytics"
                icon={<TrendingUp size={22} />}
                description="Dashboard tracking your overall score, weak topics, and readiness percentage over time."
                accentColor="#f59e0b"
                comingSoon
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewsDashboard;
