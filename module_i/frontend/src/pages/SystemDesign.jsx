import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Database, Server, Network, Layers, PenTool, ArrowRight, Activity, Workflow } from 'lucide-react';
import axios from 'axios';
import Spinner from '../components/Spinner';

const SystemDesignDashboard = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8080/api/system-design/cases');
        setCases(res.data || []);
      } catch (err) {
        console.error("Failed to fetch cases", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const modules = [
    {
      title: 'Databases & Caching',
      description: 'SQL vs NoSQL, Redis, Memcached, Data Partitioning & Sharding.',
      icon: <Database size={24} />,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.12)'
    },
    {
      title: 'Networking & APIs',
      description: 'REST, gRPC, WebSockets, Load Balancers, API Gateways.',
      icon: <Network size={24} />,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)'
    },
    {
      title: 'Microservices Arch.',
      description: 'Service discovery, Event streaming, Message Queues (Kafka).',
      icon: <Layers size={24} />,
      color: '#fb923c',
      bg: 'rgba(251, 146, 60, 0.12)'
    }
  ];

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto pb-16">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          System <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>Design</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Master High-Level (HLD) and Low-Level (LLD) design concepts to confidently architect scalable systems.
        </p>
      </div>

      <div className="section-heading mb-6">
        <Workflow size={16} style={{ color: 'var(--accent-primary)' }} />
        Core Concepts
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 stagger-children">
        {modules.map((mod, i) => (
          <div key={i} className="glass-panel-hover glass-panel flex flex-col relative overflow-hidden p-8"
               style={{ borderTop: `2px solid ${mod.color}` }}>
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-10 pointer-events-none" style={{ background: mod.color }} />
            
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: mod.bg, color: mod.color }}>
              {mod.icon}
            </div>
            
            <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed m-0">{mod.description}</p>
          </div>
        ))}
      </div>
      
      <div className="section-heading mb-6">
        <Activity size={16} style={{ color: 'var(--accent-secondary)' }} />
        Case Studies & Workbench
      </div>
      
      {loading ? (
        <div className="flex justify-center p-16 glass-panel">
          <Spinner size={36} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 stagger-children">
          {cases.map((system, i) => (
            <div key={system.id || i} className="glass-panel-hover glass-panel flex flex-col md:flex-row justify-between items-center gap-6 p-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-bg-tertiary flex items-center justify-center text-accent-primary shrink-0 border border-border-color transition-colors group-hover:bg-accent-primary group-hover:text-white">
                  <Server size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 transition-colors">{system.systemName}</h3>
                  <p className="text-text-secondary text-sm m-0 leading-relaxed">{system.description}</p>
                </div>
              </div>
              <button 
                className="w-full md:w-auto flex items-center justify-center gap-2 primary whitespace-nowrap px-6 py-2.5"
                onClick={() => navigate(`/system-design/workbench/${system.id || i}`)}
              >
                Design System <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DesignWorkbench = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3 m-0">
            Design Workbench 
            <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-primary)' }}>
              Case #{id}
            </span>
          </h2>
        </div>
        <button className="flex items-center gap-2 text-sm px-4 py-2" onClick={() => navigate('/system-design')} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          Exit Canvas
        </button>
      </div>

      <div className="glass-panel flex-1 flex items-center justify-center relative overflow-hidden" style={{ border: '2px dashed var(--border-color)' }}>
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto p-10 glass-panel border border-border-color shadow-2xl">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-accent-primary blur-xl opacity-20 animate-pulse rounded-full"></div>
            <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl border" style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
              <PenTool size={36} style={{ color: 'var(--accent-primary)' }} />
            </div>
          </div>
          
          <h3 className="text-2xl font-extrabold mb-3">Whiteboard Under Construction</h3>
          <p className="text-text-secondary leading-relaxed mb-8">
            We are building a state-of-the-art interactive canvas for you to practice drawing High Level Designs (HLD) with drag-and-drop components like Load Balancers, Databases, and Message Queues.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            {['Drag & Drop', 'Real-time Collaboration', 'Export to PNG'].map(tag => (
              <span key={tag} className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SystemDesign = () => {
  return (
    <Routes>
      <Route path="/" element={<SystemDesignDashboard />} />
      <Route path="/workbench/:id" element={<DesignWorkbench />} />
    </Routes>
  );
};
