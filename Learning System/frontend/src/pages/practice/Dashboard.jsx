import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../api/client';
import './practice.css';

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
    totalEasy: 0,
    totalMedium: 0,
    totalHard: 0
  });

  useEffect(() => {
    // Fetch problems from the backend
    axios.get(`${API_BASE_URL}/problems`)
      .then(res => {
        const data = res.data || [];
        setProblems(data);
        
        // Calculate totals for stats
        const tEasy = data.filter(p => p.difficulty === 'Easy').length;
        const tMedium = data.filter(p => p.difficulty === 'Medium').length;
        const tHard = data.filter(p => p.difficulty === 'Hard').length;
        
        // Mock solved stats for now (from localStorage)
        const solvedStr = localStorage.getItem('solved_problems') || '[]';
        const solvedIds = JSON.parse(solvedStr);
        
        let sEasy = 0, sMedium = 0, sHard = 0;
        data.forEach(p => {
          if (solvedIds.includes(p.id)) {
            if (p.difficulty === 'Easy') sEasy++;
            if (p.difficulty === 'Medium') sMedium++;
            if (p.difficulty === 'Hard') sHard++;
          }
        });
        
        setStats({
          easy: sEasy, medium: sMedium, hard: sHard,
          totalEasy: tEasy, totalMedium: tMedium, totalHard: tHard
        });
      })
      .catch(err => console.error("Failed to load problems:", err));
  }, []);

  // Get unique topics for the filter
  const allTopics = Array.from(new Set(problems.flatMap(p => p.topics || [])));

  // Filter problems
  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toString() === searchQuery;
    const matchesDiff = difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter;
    const matchesTopic = topicFilter === 'all' || (p.topics && p.topics.includes(topicFilter));
    return matchesSearch && matchesDiff && matchesTopic;
  });

  const solvedIds = JSON.parse(localStorage.getItem('solved_problems') || '[]');
  const totalSolved = stats.easy + stats.medium + stats.hard;
  const totalProblems = stats.totalEasy + stats.totalMedium + stats.totalHard;
  const progressPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;

  return (
    <div className="pr-theme pr-dashboard-container">
      <div className="pr-dashboard-layout">
        
        {/* Left Side: Problem List */}
        <div className="pr-problems-section">
          <div className="pr-dashboard-header">
            <h1 className="pr-title">Practice Problems</h1>
          </div>

          {/* Toolbar */}
          <div className="pr-toolbar">
            <div className="pr-search-box">
              <Search size={16} className="pr-search-icon" />
              <input 
                type="text" 
                placeholder="Search questions by ID or Title..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="pr-filters">
              <select className="pr-filter-select" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              
              <select className="pr-filter-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
                <option value="all">All Topics</option>
                {allTopics.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <table className="pr-problems-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Status</th>
                <th>Title</th>
                <th style={{ width: '120px' }}>Acceptance</th>
                <th style={{ width: '100px' }}>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map(p => {
                const isSolved = solvedIds.includes(p.id);
                return (
                  <tr key={p.id}>
                    <td style={{ textAlign: 'center' }}>
                      {isSolved ? <CheckCircle2 size={18} color="var(--pr-easy)" /> : <span style={{ color: 'var(--pr-text-secondary)' }}>-</span>}
                    </td>
                    <td>
                      <Link to={`/problems/${p.id}`} className="pr-problem-link">
                        {p.id}. {p.title}
                      </Link>
                      <div className="pr-topic-tags">
                        {(p.topics || []).map((t, idx) => (
                          <span key={idx} className="pr-topic-tag">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>{p.acceptance}</td>
                    <td className={`pr-difficulty ${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </td>
                  </tr>
                );
              })}
              {filteredProblems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                    No problems found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right Side: Stats Panel */}
        <div className="pr-stats-section">
          <div className="pr-stats-card">
            <h3>Session Progress</h3>
            
            <div className="pr-progress-circle-container">
              <svg viewBox="0 0 100 100" className="pr-progress-svg">
                <circle className="pr-progress-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="pr-progress-bar" 
                  cx="50" cy="50" r="45" 
                  strokeDasharray={`${progressPercent * 2.83} 283`}
                />
              </svg>
              <div className="pr-progress-text">
                <span className="pr-progress-count">{totalSolved}</span>
                <span className="pr-progress-total">/ {totalProblems}</span>
                <span className="pr-progress-label">Solved</span>
              </div>
            </div>

            <div className="pr-stats-breakdown">
              <div className="pr-stat-row">
                <span className="pr-stat-label">Easy</span>
                <span className="pr-stat-value">
                  <span style={{ color: 'var(--pr-text-main)', fontWeight: 600 }}>{stats.easy}</span>
                  <span style={{ color: 'var(--pr-text-secondary)' }}> / {stats.totalEasy}</span>
                </span>
              </div>
              <div className="pr-stat-row">
                <span className="pr-stat-label">Medium</span>
                <span className="pr-stat-value">
                  <span style={{ color: 'var(--pr-text-main)', fontWeight: 600 }}>{stats.medium}</span>
                  <span style={{ color: 'var(--pr-text-secondary)' }}> / {stats.totalMedium}</span>
                </span>
              </div>
              <div className="pr-stat-row">
                <span className="pr-stat-label">Hard</span>
                <span className="pr-stat-value">
                  <span style={{ color: 'var(--pr-text-main)', fontWeight: 600 }}>{stats.hard}</span>
                  <span style={{ color: 'var(--pr-text-secondary)' }}> / {stats.totalHard}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
