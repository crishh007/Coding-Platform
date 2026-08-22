import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { Search, Check, Circle, Shuffle } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import './practice.css';

export default function Dashboard() {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  // ── Load problems + solved IDs ──
  useEffect(() => {
    document.title = "Practice Dashboard | SkillSync";
      
      const loadData = async () => {
        setIsLoading(true);
        try {
          const data = await client.get('/problems');
          const probs = Array.isArray(data) ? data : data?.problems || [];
          setProblems(probs);
        } catch (err) {
          console.error('Failed to load problems:', err);
        }

        if (user) {
          try {
            const data = await client.get('/user/problems/solved');
            const ids = data?.solved || [];
            setSolvedIds(ids);
            localStorage.setItem('solved_problems', JSON.stringify(ids));
          } catch (err) {
            const local = JSON.parse(localStorage.getItem('solved_problems') || '[]');
            setSolvedIds(local);
          }
        } else {
          const local = JSON.parse(localStorage.getItem('solved_problems') || '[]');
          setSolvedIds(local);
        }
        
        setIsLoading(false);
      };
      
      loadData();
  }, [user]);

  // ── Stats from solved IDs + problems ──
  const stats = useMemo(() => {
    const tEasy   = problems.filter(p => p.difficulty === 'Easy').length;
    const tMedium = problems.filter(p => p.difficulty === 'Medium').length;
    const tHard   = problems.filter(p => p.difficulty === 'Hard').length;
    let sEasy = 0, sMedium = 0, sHard = 0;
    problems.forEach(p => {
      if (solvedIds.includes(p.id)) {
        if (p.difficulty === 'Easy')   sEasy++;
        if (p.difficulty === 'Medium') sMedium++;
        if (p.difficulty === 'Hard')   sHard++;
      }
    });
    return { easy: sEasy, medium: sMedium, hard: sHard, totalEasy: tEasy, totalMedium: tMedium, totalHard: tHard };
  }, [problems, solvedIds]);

  // ── Unique topics ──
  const allTopics = useMemo(() =>
    Array.from(new Set(problems.flatMap(p => p.topics || []))).sort()
  , [problems]);

  // ── Filter + paginate ──
  const filteredProblems = useMemo(() => problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id === searchQuery;
    const matchesDiff   = difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter;
    const matchesTopic  = topicFilter === 'all' || (p.topics && p.topics.includes(topicFilter));
    return matchesSearch && matchesDiff && matchesTopic;
  }), [problems, searchQuery, difficultyFilter, topicFilter]);

  // Reset to page 1 on filter change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, difficultyFilter, topicFilter]);

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const currentProblems = filteredProblems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalSolved  = stats.easy + stats.medium + stats.hard;
  const totalProblems = stats.totalEasy + stats.totalMedium + stats.totalHard;
  const progressPercent = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;

  // ── Acceptance rate helper ──
  const acceptanceRate = (p) => {
    if (!p.submissionCount || p.submissionCount === 0) return 'N/A';
    return `${Math.round((p.acceptedCount / p.submissionCount) * 100)}%`;
  };

  // ── Random Problem ──
  const goRandom = () => {
    if (filteredProblems.length === 0) return;
    const pick = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];
    navigate(`/practice/problems/${pick.id}`);
  };

  // ── Topic Radar ──
  const { radarData, allTopicData } = useMemo(() => {
    const topicCounts  = {};
    const solvedCounts = {};
    problems.forEach(p => {
      (p.topics || []).forEach(t => {
        topicCounts[t]  = (topicCounts[t]  || 0) + 1;
        if (solvedIds.includes(p.id)) solvedCounts[t] = (solvedCounts[t] || 0) + 1;
      });
    });
    const data = Object.keys(topicCounts).map(topic => {
      const total  = topicCounts[topic];
      const solved = solvedCounts[topic] || 0;
      return { topic, mastery: total > 0 ? Math.round((solved / total) * 100) : 0, fullMark: 100, solved, total };
    }).sort((a, b) => topicCounts[b.topic] - topicCounts[a.topic]);

    return { allTopicData: data, radarData: data.slice(0, 6) };
  }, [problems, solvedIds]);

  return (
    <div className={`pr-theme ${theme === 'light' ? 'light-mode' : ''} pr-dashboard-container`} style={{ paddingTop: '3rem' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', width: '100%', margin: '0 auto 2.5rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="pr-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em', fontWeight: '700' }}>Practice Problems</h1>
        <p style={{ color: 'var(--pr-text-secondary)', fontSize: '1.1rem', lineHeight: '1.5', maxWidth: '700px', margin: '0 auto' }}>
          Solve algorithmic challenges to improve your coding skills and prepare for technical interviews.
        </p>
      </div>

      {/* Search + Filters + Random */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', width: '100%', maxWidth: '850px', margin: '0 auto 3rem auto' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '250px' }}>
          <Search size={16} color="var(--pr-text-secondary)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
          <input
            type="text"
            className="search-input-glass"
            placeholder="Search questions by ID or Title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.5rem', margin: 0 }}
          />
        </div>

        <select className="pr-filter-select" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} style={{ width: '160px', height: '36px', padding: '0 0.8rem', flexShrink: 0, boxSizing: 'border-box', lineHeight: '36px' }}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select className="pr-filter-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ width: '160px', height: '36px', padding: '0 0.8rem', flexShrink: 0, boxSizing: 'border-box', lineHeight: '36px' }}>
          <option value="all">All Topics</option>
          {allTopics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Random Problem Button */}
        <button
          onClick={goRandom}
          title="Random Problem"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            height: '36px', padding: '0 1rem', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'var(--pr-text-main)', cursor: 'pointer', whiteSpace: 'nowrap',
            fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.2s', boxSizing: 'border-box'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        >
          <Shuffle size={15} /> Random
        </button>
      </div>

      <div className="pr-dashboard-layout">

        {/* Left: Problem Table */}
        <div className="pr-problems-section">
          <table className="pr-problems-table">
            <thead>
              <tr>
                <th style={{ width: '55px' }}>S.No.</th>
                <th style={{ width: '55px' }}>Status</th>
                <th>Title</th>
                <th style={{ width: '110px' }}>Acceptance</th>
                <th style={{ width: '95px' }}>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--pr-text-secondary)' }}>
                    Loading problems...
                  </td>
                </tr>
              ) : currentProblems.length > 0 ? (
                currentProblems.map((p, idx) => {
                  const isSolved = solvedIds.includes(p.id);
                  const serialNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  return (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center', color: 'var(--pr-text-secondary)', fontWeight: 'bold' }}>
                        {serialNumber}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="pr-status-icon">
                          {isSolved ? (
                            <div style={{
                              backgroundColor: '#4ade80', borderRadius: '50%',
                              width: '24px', height: '24px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'transform 0.2s ease'
                            }} className="pr-solved-filled">
                              <Check size={16} strokeWidth={3.5} style={{ color: theme === 'light' ? '#000' : '#fff' }} />
                            </div>
                          ) : (
                            <Circle size={22} className="pr-unsolved-icon" strokeWidth={1.5} />
                          )}
                        </div>
                      </td>
                      <td>
                        <Link to={`/practice/problems/${p.id}`} className="pr-problem-link">{p.title}</Link>
                        <div className="pr-topic-tags">
                          {(p.topics || []).map((t, i) => <span key={i} className="pr-topic-tag">{t}</span>)}
                        </div>
                      </td>
                      <td style={{ color: 'var(--pr-text-secondary)', fontSize: '0.88rem' }}>
                        {acceptanceRate(p)}
                      </td>
                      <td className={`pr-difficulty ${p.difficulty.toLowerCase()}`}>{p.difficulty}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--pr-text-secondary)' }}>
                    No problems found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="pr-pagination-btn">«</button>
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="pr-pagination-btn">‹ Prev</button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = totalPages <= 7 ? i + 1
                  : currentPage <= 4 ? i + 1
                  : currentPage >= totalPages - 3 ? totalPages - 6 + i
                  : currentPage - 3 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="pr-pagination-btn"
                    style={{ background: page === currentPage ? 'var(--pr-primary)' : undefined, color: page === currentPage ? '#fff' : undefined, minWidth: '36px' }}
                  >
                    {page}
                  </button>
                );
              })}

              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="pr-pagination-btn">Next ›</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="pr-pagination-btn">»</button>
              <span style={{ color: 'var(--pr-text-secondary)', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                {filteredProblems.length} problems
              </span>
            </div>
          )}
        </div>

        {/* Right: Stats Panel */}
        <div className="pr-stats-section">
          <div className="pr-stats-card">
            <h3>Session Progress</h3>

            {/* Circle Progress */}
            <div className="pr-progress-circle-container">
              <svg viewBox="0 0 100 100" className="pr-progress-svg">
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2ed573" />
                    <stop offset="100%" stopColor="#1e90ff" />
                  </linearGradient>
                </defs>
                <circle className="pr-progress-bg" cx="50" cy="50" r="45" />
                <circle className="pr-progress-bar" cx="50" cy="50" r="45" strokeDasharray={`${progressPercent * 2.83} 283`} />
              </svg>
              <div className="pr-progress-text">
                <span className="pr-progress-count">{totalSolved}</span>
                <span className="pr-progress-label">Solved</span>
              </div>
            </div>

            {/* Difficulty Bars */}
            <div className="pr-stats-breakdown">
              {[
                { label: 'Easy',   solved: stats.easy,   total: stats.totalEasy,   cls: 'easy'   },
                { label: 'Medium', solved: stats.medium, total: stats.totalMedium, cls: 'medium' },
                { label: 'Hard',   solved: stats.hard,   total: stats.totalHard,   cls: 'hard'   },
              ].map(({ label, solved, total, cls }) => (
                <div key={label} className="pr-difficulty-progress-container">
                  <div className="pr-difficulty-header">
                    <span className={`pr-diff-label ${cls}`}>{label}</span>
                    <span className="pr-diff-counts">
                      <span className="pr-diff-solved">{solved}</span>
                      <span className="pr-diff-total"> / {total}</span>
                    </span>
                  </div>
                  <div className="pr-diff-track">
                    <div className={`pr-diff-fill ${cls}`} style={{ width: `${total > 0 ? (solved / total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Topic Mastery */}
            {radarData.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--pr-text-secondary)', marginBottom: '1rem', textAlign: 'center' }}>Topic Mastery</h3>

                {radarData.length > 2 && (
                  <div style={{ height: '220px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--pr-text-secondary)', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Mastery" dataKey="mastery" stroke="var(--pr-primary)" strokeWidth={2} fill="var(--pr-primary)" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Topic breakdown — only attempted topics */}
                <div className="pr-topic-analysis-list" style={{ marginTop: radarData.length > 2 ? '1.5rem' : '0', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {allTopicData.filter(item => item.solved > 0).length === 0
                    ? (
                      <div style={{ textAlign: 'center', color: 'var(--pr-text-secondary)', fontSize: '0.9rem', padding: '1rem 0' }}>
                        Solve some problems to see your topic analysis!
                      </div>
                    )
                    : allTopicData.filter(item => item.solved > 0).map(item => (
                      <div key={item.topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--pr-text-main)' }}>{item.topic}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: 'var(--pr-text-secondary)', fontSize: '0.8rem' }}>{item.solved}/{item.total}</span>
                          <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.mastery}%`, height: '100%', background: 'var(--pr-primary)' }} />
                          </div>
                          <span style={{ color: 'var(--pr-text-secondary)', fontSize: '0.8rem', width: '35px', textAlign: 'right', fontWeight: 'bold' }}>{item.mastery}%</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
