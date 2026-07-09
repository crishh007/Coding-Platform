import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, BookOpen, Layers, Database, Shield, CheckCircle, BrainCircuit, Code2, Target, Menu, X, ArrowLeft } from 'lucide-react';

const TOPICS = [
  { id: 'arrays', label: 'Arrays' },
  { id: 'linked-list', label: 'Linked List' },
  { id: 'stack', label: 'Stack' },
  { id: 'queue', label: 'Queue' },
  { id: 'trees', label: 'Trees' },
  { id: 'graph', label: 'Graph' },
  { id: 'sql', label: 'SQL' },
  { id: 'dbms', label: 'DBMS' },
  { id: 'os', label: 'OS' },
  { id: 'networking', label: 'Networking' },
  { id: 'oop', label: 'OOP' },
  { id: 'system-design', label: 'System Design Basics' }
];

const FEATURES = [
  { id: 'quick-notes', label: 'Quick Notes', icon: <BookOpen size={18} /> },
  { id: 'cheat-sheets', label: 'Cheat Sheets', icon: <Layers size={18} /> },
  { id: 'interview-questions', label: 'Interview Qs', icon: <Database size={18} /> },
  { id: 'common-mistakes', label: 'Common Mistakes', icon: <Shield size={18} /> },
  { id: 'flashcards', label: 'Flashcards', icon: <Layers size={18} /> },
  { id: 'mcqs', label: 'MCQs', icon: <CheckCircle size={18} /> },
  { id: 'quick-quiz', label: 'Quick Quiz', icon: <BrainCircuit size={18} /> },
  { id: 'coding-practice', label: 'Coding Practice', icon: <Code2 size={18} /> },
  { id: 'revision-tracker', label: 'Revision Tracker', icon: <Target size={18} /> }
];

const FoundationalLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract feature and topic from URL: /interviews/foundational/:feature/:topic
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentFeature = pathParts[2] || 'quick-notes';
  const currentTopic = pathParts[3] || 'arrays';

  const featureObj = FEATURES.find(f => f.id === currentFeature) || FEATURES[0];

  return (
    <div className="flex h-screen w-full text-text-primary overflow-hidden" style={{ background: 'var(--bg-main)' }}>
      
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50 glass-panel p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/interviews?mode=foundational')} className="text-text-secondary hover:text-white">
            <ArrowLeft size={20} />
          </button>
          <div className="font-bold">{featureObj.label}</div>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} style={{ color: 'var(--text-primary)' }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 w-72 glass-panel z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col h-full border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5">
          <button 
            onClick={() => navigate('/interviews?mode=foundational')}
            className="flex items-center gap-2 hover:text-white transition-colors mb-6 text-sm font-semibold"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          {/* Feature Selector Dropdown (Simplified as a label for now) */}
          <div className="flex items-center gap-3 p-3 rounded-xl border mb-4" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            {featureObj.icon}
            <span className="font-bold">{featureObj.label}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search topics..."
              className="w-full border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none"
              style={{ background: 'var(--bg-tertiary)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="text-xs font-bold uppercase tracking-wider mb-3 px-3" style={{ color: 'var(--text-tertiary)' }}>
            Topics
          </div>
          <div className="flex flex-col gap-1">
            {TOPICS.map(topic => {
              const isActive = topic.id === currentTopic;
              return (
                <NavLink
                  key={topic.id}
                  to={`/interviews/foundational/${currentFeature}/${topic.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 10px 20px -5px rgba(139, 92, 246, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {topic.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(139, 92, 246, 0.1)' }} />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 z-10 relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FoundationalLayout;
