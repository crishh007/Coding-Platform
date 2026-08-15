import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  CheckCircle2, 
  CircleDot, 
  Sparkles, 
  Code2, 
  Trophy, 
  Flame, 
  ArrowRight, 
  Filter, 
  Target, 
  Zap,
  BookOpen,
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../api/client';
import './practice.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'solved', 'todo'

  // Stats State
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    totalEasy: 0,
    totalMedium: 0,
    totalHard: 0
  });

  const [solvedIds, setSolvedIds] = useState([]);

  useEffect(() => {
    // Load solved problems from localStorage
    try {
      const storedSolved = JSON.parse(localStorage.getItem('solved_problems') || '[]');
      setSolvedIds(storedSolved);
    } catch (e) {
      setSolvedIds([]);
    }

    // Fetch problems from unified API
    axios.get(`${API_BASE_URL}/problems`)
      .then(res => {
        const data = res.data || [];
        setProblems(data);
        setLoading(false);

        // Compute metrics
        const tEasy = data.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
        const tMedium = data.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
        const tHard = data.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

        const storedSolved = JSON.parse(localStorage.getItem('solved_problems') || '[]');
        let sEasy = 0, sMedium = 0, sHard = 0;
        data.forEach(p => {
          if (storedSolved.includes(p.id)) {
            const diff = p.difficulty?.toLowerCase();
            if (diff === 'easy') sEasy++;
            if (diff === 'medium') sMedium++;
            if (diff === 'hard') sHard++;
          }
        });

        setStats({
          easy: sEasy,
          medium: sMedium,
          hard: sHard,
          totalEasy: tEasy,
          totalMedium: tMedium,
          totalHard: tHard
        });
      })
      .catch(err => {
        console.error("Failed to load problems:", err);
        setLoading(false);
      });
  }, []);

  // Collect all unique topics
  const allTopics = Array.from(
    new Set(problems.flatMap(p => p.topics || []))
  );

  // Filter problems
  const filteredProblems = problems.filter(p => {
    const pId = p.id ? p.id.toString() : '';
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pId.includes(searchQuery.trim());

    const matchesDiff = 
      difficultyFilter === 'all' || 
      p.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();

    const matchesTopic = 
      topicFilter === 'all' || 
      (p.topics && p.topics.includes(topicFilter));

    const isSolved = solvedIds.includes(p.id);
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'solved' && isSolved) || 
      (statusFilter === 'todo' && !isSolved);

    return matchesSearch && matchesDiff && matchesTopic && matchesStatus;
  });

  const totalSolved = stats.easy + stats.medium + stats.hard;
  const totalProblems = stats.totalEasy + stats.totalMedium + stats.totalHard || problems.length;
  const progressPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Pick a random or first problem as featured daily challenge
  const dailyProblem = problems.length > 0 ? problems[0] : null;

  return (
    <div className="practice-page-container">
      
      {/* SVG Gradient Definition for Gauges */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="practice-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Hero Header Card */}
      <motion.div 
        className="practice-hero-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="practice-hero-glow" />
        
        <div>
          <div className="practice-hero-badge">
            <Sparkles size={13} />
            <span>Algorithm & Coding Arena</span>
          </div>
          
          <h1 className="practice-hero-title">Practice Problem Solving</h1>
          <p className="practice-hero-subtitle">
            Sharpen your algorithmic thinking and data structures proficiency with interactive coding challenges and instant compiler verification.
          </p>

          <div className="practice-quick-stats">
            <div className="practice-stat-pill">
              <div className="practice-stat-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                <Code2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Available Problems</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{problems.length} Challenges</div>
              </div>
            </div>

            <div className="practice-stat-pill">
              <div className="practice-stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{totalSolved} Solved</div>
              </div>
            </div>

            <div className="practice-stat-pill">
              <div className="practice-stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Session Completion</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{progressPercent}%</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Left Problems List + Right Stats Sidebar */}
      <div className="practice-dashboard-grid">
        
        {/* Left Section: Filters & Table */}
        <div className="practice-main-panel">
          
          {/* Sleek Horizontal Aligned Filter Toolbar */}
          <div 
            className="practice-toolbar-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              flexWrap: 'nowrap'
            }}
          >
            {/* Search Input (same UI as Learning -> Course page) */}
            <div className="practice-search-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1 1 auto', minWidth: '0' }}>
              <Search 
                size={16} 
                color="var(--text-on-primary)" 
                style={{ position: 'absolute', left: '1rem', pointerEvents: 'none', zIndex: 1 }} 
              />
              <input 
                type="text" 
                className="search-input-glass"
                placeholder="Search challenges by title or #ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', fontSize: '0.88rem', height: '40px', width: '100%' }}
              />
            </div>

            {/* All Difficulties Small Rectangle Box */}
            <select 
              className="practice-dropdown-glass"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ flex: '0 0 auto', height: '40px', padding: '0 0.85rem', width: 'auto', minWidth: '135px' }}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            {/* All Topics Small Rectangle Box */}
            <select 
              className="practice-dropdown-glass"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              style={{ flex: '0 0 auto', height: '40px', padding: '0 0.85rem', width: 'auto', minWidth: '120px' }}
            >
              <option value="all">All Topics</option>
              {allTopics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* All Status Small Rectangle Box */}
            <select 
              className="practice-dropdown-glass"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ flex: '0 0 auto', height: '40px', padding: '0 0.85rem', width: 'auto', minWidth: '115px' }}
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          {/* Problems Table Card */}
          <div className="practice-table-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <Code2 size={32} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 1rem auto', color: 'var(--primary)' }} />
                <p>Loading coding problems...</p>
              </div>
            ) : filteredProblems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Target size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Problems Found</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  No coding challenges matched your selected filters or search keyword.
                </p>
                <button 
                  className="practice-btn-secondary"
                  onClick={() => { setSearchQuery(''); setDifficultyFilter('all'); setTopicFilter('all'); setStatusFilter('all'); }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <table className="practice-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>Status</th>
                    <th>Problem Title & Topics</th>
                    <th style={{ width: '130px' }}>Acceptance</th>
                    <th style={{ width: '120px' }}>Difficulty</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((p) => {
                    const isSolved = solvedIds.includes(p.id);
                    const diff = (p.difficulty || 'Easy').toLowerCase();

                    return (
                      <tr key={p.id}>
                        {/* Status Icon */}
                        <td style={{ textAlign: 'center' }}>
                          {isSolved ? (
                            <CheckCircle2 size={18} style={{ color: '#10b981', display: 'inline' }} />
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>

                        {/* Title & Topic Tags */}
                        <td>
                          <div className="practice-title-cell">
                            <Link to={`/problems/${p.id}`} className="practice-problem-link">
                              <span>{p.id}.</span> {p.title}
                            </Link>
                            {p.topics && p.topics.length > 0 && (
                              <div className="practice-table-topics">
                                {p.topics.map((tag, idx) => (
                                  <span key={idx} className="practice-topic-badge">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Acceptance */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{p.acceptance || '50.0%'}</span>
                            <div style={{ width: '70px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  width: p.acceptance || '50%', 
                                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' 
                                }} 
                              />
                            </div>
                          </div>
                        </td>

                        {/* Difficulty Badge */}
                        <td>
                          <span className={`diff-badge ${diff}`}>
                            {p.difficulty}
                          </span>
                        </td>

                        {/* Solve Button */}
                        <td style={{ textAlign: 'right' }}>
                          <Link 
                            to={`/problems/${p.id}`}
                            className="practice-btn-secondary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            Solve <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* Right Section: Progress & Featured Sidebar */}
        <div className="practice-sidebar">
          
          {/* Progress Card */}
          <div className="practice-glass-card">
            <div className="practice-card-header">
              <h3 className="practice-card-title">
                <Trophy size={18} style={{ color: '#fbbf24' }} /> Session Progress
              </h3>
            </div>

            {/* Circular Gauge */}
            <div className="practice-gauge-container">
              <svg className="practice-gauge-svg" viewBox="0 0 120 120">
                <circle
                  className="practice-gauge-bg"
                  cx="60"
                  cy="60"
                  r="54"
                />
                <circle
                  className="practice-gauge-bar"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="practice-gauge-center">
                <span className="practice-gauge-value">{totalSolved}</span>
                <span className="practice-gauge-label">of {totalProblems} Solved</span>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="practice-breakdown">
              <div className="practice-breakdown-row easy">
                <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>Easy</span>
                <span style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
                  <strong>{stats.easy}</strong> <span style={{ color: 'var(--text-muted)' }}>/ {stats.totalEasy}</span>
                </span>
              </div>

              <div className="practice-breakdown-row medium">
                <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>Medium</span>
                <span style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
                  <strong>{stats.medium}</strong> <span style={{ color: 'var(--text-muted)' }}>/ {stats.totalMedium}</span>
                </span>
              </div>

              <div className="practice-breakdown-row hard">
                <span style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 600 }}>Hard</span>
                <span style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>
                  <strong>{stats.hard}</strong> <span style={{ color: 'var(--text-muted)' }}>/ {stats.totalHard}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Daily Challenge Card */}
          {dailyProblem && (
            <div className="practice-daily-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                <Flame size={16} style={{ color: '#f59e0b' }} />
                <span>Featured Challenge</span>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  {dailyProblem.id}. {dailyProblem.title}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Test your algorithmic speed on this {dailyProblem.difficulty?.toLowerCase()} difficulty challenge.
                </p>
              </div>
              <Link to={`/problems/${dailyProblem.id}`} className="practice-btn-primary" style={{ marginTop: '0.5rem' }}>
                Start Coding <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {/* Topics Navigator */}
          <div className="practice-glass-card">
            <h3 className="practice-card-title" style={{ marginBottom: '1rem' }}>
              <Layers size={17} style={{ color: '#a78bfa' }} /> Popular Topics
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {allTopics.map(t => (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    background: topicFilter === t ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    color: topicFilter === t ? '#c4b5fd' : 'var(--text-secondary)',
                    border: `1px solid ${topicFilter === t ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
