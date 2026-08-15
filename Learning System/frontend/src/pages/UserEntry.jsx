import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, GraduationCap, ChevronRight, Search, Award } from 'lucide-react';
import client from '../api/client';

export default function UserEntry() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null); // 'quick_learn', 'course', 'career'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch options based on mode selection
  useEffect(() => {
    if (!selectedMode) {
      setData([]);
      return;
    }

    setLoading(true);
    setSearchQuery('');
    let endpoint = '';
    if (selectedMode === 'quick_learn') {
      endpoint = '/modes/quick-learn/topics';
    } else if (selectedMode === 'course') {
      endpoint = '/modes/course/paths';
    } else if (selectedMode === 'career') {
      endpoint = '/modes/career/paths';
    }

    client.get(endpoint)
      .then((res) => {
        setData(res || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setData([]);
        setLoading(false);
      });
  }, [selectedMode]);

  const handleSelectMode = (mode) => {
    const isAdmin = localStorage.getItem('codemastery_admin_mode') === 'true';
    if (mode === 'career') {
      navigate('/careers');
      return;
    }

    setLoading(true);
    
    if (mode === 'quick_learn') {
      // Just navigate to study page directly, let user pick from sidebar
      navigate('/study?mode=quick_learn');
      return;
    } else if (mode === 'course') {
      navigate('/courses');
    } else if (mode === 'career') {
      client.get('/modes/career/paths')
        .then((res) => {
          if (res && res.length > 0) {
            navigate(`/paths/${res[0].id}?mode=career`);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  const handleItemClick = (item) => {
    const isAdmin = localStorage.getItem('codemastery_admin_mode') === 'true';
    if (selectedMode === 'quick_learn') {
      navigate(`/study?topicId=${item.id}&mode=quick_learn`);
    } else if (selectedMode === 'course') {
      navigate(`/paths/${item.id}?mode=course`);
    } else if (selectedMode === 'career') {
      navigate(`/careers/${item.id}`);
    }
  };

  const modesInfo = [
    {
      id: 'quick_learn',
      title: 'Quick Learn',
      description: 'Single topic deep dive. Jump straight into core concepts like Binary Search or Linked Lists with zero overhead.',
      icon: Compass,
      glow: 'rgba(59, 130, 246, 0.4)',
      badge: 'Topic Focused'
    },
    {
      id: 'course',
      title: 'Course Mode',
      description: 'Full course deep dive. Complete a structured pathway covering all modules, theories, coding, and sequential steps.',
      icon: BookOpen,
      glow: 'rgba(16, 185, 129, 0.4)',
      badge: 'Comprehensive'
    },
    {
      id: 'career',
      title: 'Career Path',
      description: 'End-to-end career prep. Master a series of connected courses (e.g. Backend Developer) to qualify for target roles.',
      icon: GraduationCap,
      glow: 'rgba(139, 92, 246, 0.4)',
      badge: 'Full Roadmap'
    }
  ];

  const filteredData = data.filter(item => {
    const name = item.name || item.title || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Select Your Study Track</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.5' }}>
          SkillSync offers three targeted modes optimized for different learning objectives. Select a pathway below to begin your training.
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid-cols-3">
        {modesInfo.map((mode) => {
          const Icon = mode.icon;
          const isCurrent = selectedMode === mode.id;
          return (
            <div 
              key={mode.id}
              className="card"
              style={{
                cursor: 'pointer',
                borderColor: isCurrent ? 'var(--primary)' : 'var(--border-color)',
                boxShadow: isCurrent ? `0 0 25px ${mode.glow}` : 'var(--shadow-md)',
                transform: isCurrent ? 'translateY(-4px)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: '2rem'
              }}
              onClick={() => handleSelectMode(mode.id)}
            >
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '1.25rem', backgroundColor: isCurrent ? 'var(--primary)' : 'rgba(139,92,246,0.1)', color: isCurrent ? '#fff' : '' }}>
                  {mode.badge}
                </span>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '1.5rem',
                  color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: isCurrent ? `0 0 15px ${mode.glow}` : ''
                }}>
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{mode.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {mode.description}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isCurrent ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                <span>Select this mode</span>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
