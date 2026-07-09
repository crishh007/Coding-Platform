import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, PlayCircle, BarChart2, Users,
  ArrowRight, Zap
} from 'lucide-react';

export const defaultHRQuestions = [
  'Tell me about yourself and your professional journey.',
  'Where do you see yourself in 5 years?',
  'What is your greatest strength and how has it helped you professionally?',
  'What is your greatest weakness and what are you doing to improve it?',
  'Describe a time you faced a significant challenge at work and how you overcame it.',
  'Tell me about a time you worked effectively under pressure or a tight deadline.',
  'Describe a situation where you had a conflict with a teammate. How did you resolve it?',
  'Give an example of a goal you set and how you achieved it.',
  'Describe a time when you showed initiative and led an effort proactively.',
  'Tell me about a time you failed. What did you learn from it?',
  'How do you prioritize tasks when you have multiple competing deadlines?',
  'Describe a time when you had to adapt quickly to a major change.',
  'Give an example of when you went above and beyond your job responsibilities.',
  'Tell me about a time you had to persuade someone to see things your way.',
  'Why are you interested in this role and what makes you the best candidate?',
];

const InterviewDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Question Repository',
      desc: 'Browse 15+ curated HR questions or generate tailored ones from your resume.',
      icon: <BookOpen size={20} />,
      accentColor: '#38bdf8', // accent-tertiary
      bg: 'rgba(56, 189, 248, 0.12)',
      action: () => navigate('/interview/questions'),
      cta: 'Browse Questions',
    },
    {
      title: 'Practice Now',
      desc: 'Start a simulated interview session with voice recording and AI analysis.',
      icon: <PlayCircle size={20} />,
      accentColor: '#e24be5', // accent-secondary
      bg: 'rgba(226, 75, 229, 0.12)',
      action: () => navigate('/interview/practice'),
      cta: 'Start Session',
    },
    {
      title: 'Performance',
      desc: 'Review your historical progress, feedback summaries, and improvement areas.',
      icon: <BarChart2 size={20} />,
      accentColor: '#fb923c', // orange-400
      bg: 'rgba(251, 146, 60, 0.12)',
      action: () => navigate('/interview/performance'),
      cta: 'View Stats',
    },
  ];

  const categories = [
    { name: 'Freshers', count: 15, color: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)', tag: '#38bdf8' },
    { name: 'Experienced', count: 24, color: 'rgba(124, 92, 252, 0.12)', border: 'rgba(124, 92, 252, 0.3)', tag: '#7c5cfc' },
    { name: 'Leadership', count: 12, color: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)', tag: '#22c55e' },
    { name: 'Conflict Resolution', count: 18, color: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.3)', tag: '#fb923c' },
  ];

  return (
    <div className="animate-fade-in mx-auto" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">
          Soft Skills <span className="text-transparent bg-clip-text" style={{
            backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
          }}>Preparation</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl">
          Master behavioral rounds with AI-powered feedback. Practice answering common questions and receive actionable insights.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 stagger-children">
        {cards.map(card => (
          <div
            key={card.title}
            onClick={card.action}
            className="glass-panel group relative flex flex-col p-8 cursor-pointer overflow-hidden transition-all duration-300"
            style={{ borderTop: `2px solid ${card.accentColor}` }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 12px 30px ${card.accentColor}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-10 pointer-events-none" style={{ background: card.accentColor }} />
            
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: card.bg, color: card.accentColor }}>
              {card.icon}
            </div>
            
            <h3 className="text-xl font-bold mb-3">{card.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-6">{card.desc}</p>
            
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: card.accentColor }}>
              {card.cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Practice Banner */}
      <div className="glass-panel mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden" style={{ borderLeft: '4px solid var(--accent-secondary)' }}>
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: 'var(--accent-secondary)' }} />
        
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Zap size={20} style={{ color: 'var(--accent-secondary)' }} /> Quick Practice
          </h3>
          <p className="text-text-secondary text-sm md:text-base m-0">
            Jump into a random practice question instantly — no browsing required.
          </p>
        </div>
        
        <button
          className="primary whitespace-nowrap"
          onClick={() => {
            const randomQ = defaultHRQuestions[Math.floor(Math.random() * defaultHRQuestions.length)];
            navigate('/interview/practice', { state: { question: randomQ } });
          }}
          style={{ padding: '12px 24px' }}
        >
          <PlayCircle size={18} /> Random Question
        </button>
      </div>

      {/* Categories */}
      <div className="section-heading mb-5">
        <Users size={14} style={{ color: 'var(--accent-primary)' }} />
        Recommended Categories
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(cat => (
          <div
            key={cat.name}
            onClick={() => navigate('/interview/questions')}
            className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-transform duration-200"
            style={{
              background: cat.color, border: `1px solid ${cat.border}`,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span className="font-semibold text-text-primary text-sm">{cat.name}</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md" style={{ background: 'var(--bg-primary)', color: cat.tag }}>{cat.count} Qs</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewDashboard;
