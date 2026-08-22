import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressContext } from '../context/ProgressContext';
import { AuthContext } from '../context/AuthContext';
import { 
  Trophy, 
  Code2, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ChevronRight, 
  Flame,
  Users,
  FileText
} from 'lucide-react';
import heroImg from '../assets/dashboard_hero_dev.png';
import StatsCards from "../components/Dashboard/StatsCards";
import LearningChart from "../components/Dashboard/LearningChart";
import ActivityHeatmap from "../components/Dashboard/ActivityHeatmap";
import LanguagePieChart from "../components/Dashboard/LanguagePieChart";
import DifficultyDonutChart from "../components/Dashboard/DifficultyDonutChart";

export default function Dashboard() {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');
  const { progress } = useContext(ProgressContext);
  const { user } = useContext(AuthContext);
  
  const [problemStats, setProblemStats] = useState({ easy: 0, medium: 0, hard: 0, solved: [], history: [] });
  const [streakStats, setStreakStats] = useState({ currentStreak: 0, longestStreak: 0 });
  const [streakLoaded, setStreakLoaded] = useState(false);
  const [topicTree, setTopicTree] = useState([]);

  // Local state to track non-database interactive goals completed today
  const [reviewedInterviews, setReviewedInterviews] = useState(false);
  const [registeredContest, setRegisteredContest] = useState(false);
  const [updatedResume, setUpdatedResume] = useState(false);

  useEffect(() => {
    document.title = "Dashboard | SkillSync";
    
    const fetchDashboardData = async () => {
      try {
        const { default: client } = await import('../api/client');
        
        const pStats = await client.get('/user/problems/stats');
        if (pStats) {
          setProblemStats({
            easy: pStats.easy || 0,
            medium: pStats.medium || 0,
            hard: pStats.hard || 0,
            solved: pStats.solved || [],
            history: pStats.history || []
          });
        }
        
        const sStats = await client.get('/user/streak');
        if (sStats) {
          setStreakStats(sStats);
          setStreakLoaded(true);
        }

        const contestsRes = await client.get('/contests');
        if (contestsRes?.data) {
          setDashboardContests({
            live: contestsRes.data.ongoing?.[0] || null,
            upcoming: contestsRes.data.upcoming?.[0] || null
          });
        }

        const tree = await client.get('/topics/tree');
        if (tree) {
          setTopicTree(tree);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      }
    };
    
    fetchDashboardData();

    // Ping the streak endpoint once per day to keep the streak alive
    const pingStreak = async () => {
      const todayKey = new Date().toDateString();
      const lastPing = localStorage.getItem('streak_last_ping');
      if (lastPing === todayKey) return; // already pinged today
      try {
        const { default: client } = await import('../api/client');
        await client.post('/user/streak/ping');
        localStorage.setItem('streak_last_ping', todayKey);
      } catch (e) {}
    };
    pingStreak();
  }, [progress]);

  // Gamification Metrics
  const completedLessonsCount = progress.completedLessonIds ? progress.completedLessonIds.length : 0;
  const solvedProblemsCount = problemStats.solved ? problemStats.solved.length : 0;

  const totalXP = useMemo(() => {
    const lessonXP = completedLessonsCount * 100;
    const easyXP = (problemStats.easy || 0) * 50;
    const mediumXP = (problemStats.medium || 0) * 100;
    const hardXP = (problemStats.hard || 0) * 200;
    return lessonXP + easyXP + mediumXP + hardXP;
  }, [completedLessonsCount, problemStats]);

  const currentLevel = Math.floor(totalXP / 1000) + 1;
  const userRank = Math.max(1, 5000 - Math.floor(totalXP / 5));

  // Option A: Dynamic Motivational Quote
  const motivationalQuote = useMemo(() => {
    const quotes = [
      "Success in coding is the sum of small efforts, repeated day in and day out.",
      "Consistency is the key to mastering algorithms. One step at a time!",
      "Great coders are not born, they are made through daily practice and focus.",
      "The best way to predict the future is to build it. Let's solve a problem today!",
      "Every challenge you complete makes you a stronger software engineer. Keep learning!",
    ];
    return quotes[new Date().getDate() % quotes.length];
  }, []);

  // Determine top skill dynamically
  const topSkill = useMemo(() => {
    if (solvedProblemsCount === 0) return "Beginner";
    
    const topicMap = {};
    topicTree.forEach(course => {
      if (course.children) {
        course.children.forEach(topic => {
          if (topic.children) {
            topic.children.forEach(lesson => {
              if (progress.completedLessonIds?.includes(lesson.id)) {
                topicMap[topic.title] = (topicMap[topic.title] || 0) + 1;
              }
            });
          }
        });
      }
    });

    let bestTopic = "Problem Solving";
    let maxSolves = 0;
    Object.keys(topicMap).forEach(topic => {
      if (topicMap[topic] > maxSolves) {
        maxSolves = topicMap[topic];
        bestTopic = topic;
      }
    });
    return bestTopic;
  }, [solvedProblemsCount, topicTree, progress]);

  // Real-time Countdown Timer for Contest
  const [dashboardContests, setDashboardContests] = useState({ live: null, upcoming: null });
  const [currentTime, setCurrentTime] = useState(new Date()); 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (targetDate) => {
    if (!targetDate) return { hrs: '00', mins: '00', secs: '00', total: 0 };
    const diff = Math.max(0, Math.floor((new Date(targetDate) - currentTime) / 1000));
    return {
      hrs: Math.floor(diff / 3600).toString().padStart(2, '0'),
      mins: Math.floor((diff % 3600) / 60).toString().padStart(2, '0'),
      secs: (diff % 60).toString().padStart(2, '0'),
      total: diff
    };
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return { hrs, mins, secs };
  };

  const { hrs, mins, secs } = formatTime(dashboardContests.upcoming ? getCountdown(dashboardContests.upcoming.startTime).total : 0);

  const triggerToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Continue Where You Left Off
  const continueLessons = useMemo(() => {
    // 1. Map all lessons in course order
    const allOrderedLessons = [];
    topicTree.forEach(course => {
      if (course.children) {
        course.children.forEach(topic => {
          if (topic.children) {
            topic.children.forEach(lesson => {
              allOrderedLessons.push({
                id: lesson.id,
                title: lesson.title,
                category: topic.title,
                topicId: topic.id
              });
            });
          }
        });
      }
    });

    const completedSet = new Set(progress.completedLessonIds || []);

    // 2. Find in-progress lessons (interacted with but not marked completed or at 100%)
    const inProgressDetails = (progress.details || []).filter(
      d => !completedSet.has(d.lessonId) && (d.progressPercent || 0) < 100
    );

    // 2b. Check localStorage for the user's last viewed lesson
    const lastViewedStr = localStorage.getItem('last_viewed_lesson');
    if (lastViewedStr) {
      try {
        const lastViewed = JSON.parse(lastViewedStr);
        if (lastViewed && lastViewed.lessonId && lastViewed.topicId) {
          // If the last viewed lesson is NOT marked completed, prioritize it!
          if (!completedSet.has(lastViewed.lessonId)) {
            const info = allOrderedLessons.find(l => l.id === lastViewed.lessonId);
            if (info) {
              const progressDb = (progress.details || []).find(d => d.lessonId === lastViewed.lessonId);
              const pct = progressDb ? (progressDb.progressPercent || 0) : 0;
              
              const firstItem = {
                id: lastViewed.lessonId,
                title: info.title,
                category: info.category,
                topicId: lastViewed.topicId,
                pct: pct,
                color: 'var(--primary)'
              };

              const remaining = inProgressDetails
                .filter(d => d.lessonId !== lastViewed.lessonId)
                .slice(0, 2)
                .map((d, idx) => {
                  const rInfo = allOrderedLessons.find(l => l.id === d.lessonId) || { title: `Lesson ${d.lessonId}`, category: 'Curriculum' };
                  const colors = ['var(--info)', 'var(--success)'];
                  return {
                    id: d.lessonId,
                    title: rInfo.title,
                    category: rInfo.category,
                    topicId: rInfo.topicId,
                    pct: d.progressPercent || 0,
                    color: colors[idx % colors.length]
                  };
                });

              return [firstItem, ...remaining];
            }
          }
        }
      } catch (e) {
        console.error("Failed to parse last viewed lesson", e);
      }
    }

    // 3. If in-progress lessons exist, display up to 3 of them
    if (inProgressDetails.length > 0) {
      const colors = ['var(--primary)', 'var(--info)', 'var(--success)'];
      return inProgressDetails.slice(0, 3).map((d, idx) => {
        const info = allOrderedLessons.find(l => l.id === d.lessonId) || { title: `Lesson ${d.lessonId}`, category: 'Curriculum' };
        return {
          id: d.lessonId,
          title: info.title,
          category: info.category,
          topicId: info.topicId,
          pct: d.progressPercent || 0,
          color: colors[idx % colors.length]
        };
      });
    }

    // 4. If everything started is completed, find the next sequential lesson in curriculum order
    if (progress.details && progress.details.length > 0) {
      const lastCompleted = progress.details[0]; // Most recently updated/completed lesson
      const completedIdx = allOrderedLessons.findIndex(l => l.id === lastCompleted.lessonId);
      if (completedIdx !== -1 && completedIdx + 1 < allOrderedLessons.length) {
        const nextLesson = allOrderedLessons[completedIdx + 1];
        return [
          {
            id: nextLesson.id,
            title: nextLesson.title,
            category: nextLesson.category,
            topicId: nextLesson.topicId,
            pct: 0,
            color: 'var(--primary)'
          }
        ];
      }
    }

    // 5. General Fallback: suggest first 3 lessons of the curriculum tree
    const colors = ['var(--primary)', 'var(--info)', 'var(--success)'];
    return allOrderedLessons.slice(0, 3).map((lesson, idx) => {
      return {
        id: lesson.id,
        title: lesson.title,
        category: lesson.category,
        topicId: lesson.topicId,
        pct: 0,
        color: colors[idx % colors.length]
      };
    });
  }, [progress, topicTree]);

  // Option C: 7-day Visual Streak Calendar
  const streakDays = useMemo(() => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const list = [];
    
    const activeDates = new Set();
    problemStats.history.forEach(item => {
      if (item.solvedAt) {
        activeDates.add(new Date(item.solvedAt).toDateString());
      }
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      const isCompleted = activeDates.has(d.toDateString());
      list.push({
        dayLabel: days[d.getDay()],
        isToday,
        isCompleted,
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      });
    }
    return list;
  }, [problemStats.history]);

  // Calculate actual progress increments since the start of today
  const lessonsCompletedToday = useMemo(() => {
    const todayKey = new Date().toDateString();
    const storedDate = localStorage.getItem("goal_lessons_date");
    const currentCompleted = progress.completedLessonIds ? progress.completedLessonIds.length : 0;
    
    if (storedDate !== todayKey) {
      localStorage.setItem("goal_lessons_date", todayKey);
      localStorage.setItem("goal_lessons_initial_count", currentCompleted.toString());
      return 0;
    }
    
    const initialCount = parseInt(localStorage.getItem("goal_lessons_initial_count") || "0", 10);
    return Math.max(0, currentCompleted - initialCount);
  }, [progress.completedLessonIds]);

  const solvedTodayCount = useMemo(() => {
    const todayStr = new Date().toDateString();
    return problemStats.history.filter(item => {
      if (item.solvedAt) {
        return new Date(item.solvedAt).toDateString() === todayStr;
      }
      return false;
    }).length;
  }, [problemStats.history]);

  const [currentDay, setCurrentDay] = useState(new Date().getDay());

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const msUntilMidnight = nextMidnight - now;
    const timeout = setTimeout(() => setCurrentDay(new Date().getDay()), msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [currentDay]);

  const dailyQuests = useMemo(() => {
    const dayIndex = currentDay; // 0 = Sunday, 1 = Monday, etc.

    const questPools = [
      // Sunday
      [
        { id: "solve_problems", text: "Solve 4 problems (Sunday Marathon)", current: solvedTodayCount, target: 4, path: "/practice" },
        { id: "study_lesson", text: "Complete 1 study lesson", current: lessonsCompletedToday, target: 1, path: "/modes" },
        { id: "resume", text: "Build or download resume", current: updatedResume ? 1 : 0, target: 1, path: "/resume", stateSetter: setUpdatedResume }
      ],
      // Monday
      [
        { id: "solve_problems", text: "Solve 2 problems", current: solvedTodayCount, target: 2, path: "/practice" },
        { id: "study_lesson", text: "Complete 1 study lesson", current: lessonsCompletedToday, target: 1, path: "/modes" },
        { id: "streak", text: "Keep active learning streak", current: streakStats.currentStreak >= 1 ? 1 : 0, target: 1, path: "/practice" }
      ],
      // Tuesday
      [
        { id: "solve_problems", text: "Solve 1 problem", current: solvedTodayCount, target: 1, path: "/practice" },
        { id: "study_lesson", text: "Complete 2 study lessons", current: lessonsCompletedToday, target: 2, path: "/modes" },
        { id: "interviews", text: "Explore System Design sheets", current: reviewedInterviews ? 1 : 0, target: 1, path: "/interviews", stateSetter: setReviewedInterviews }
      ],
      // Wednesday
      [
        { id: "solve_problems", text: "Solve 3 problems", current: solvedTodayCount, target: 3, path: "/practice" },
        { id: "study_lesson", text: "Complete 1 study lesson", current: lessonsCompletedToday, target: 1, path: "/modes" },
        { id: "streak", text: "Keep active learning streak", current: streakStats.currentStreak >= 1 ? 1 : 0, target: 1, path: "/practice" }
      ],
      // Thursday
      [
        { id: "solve_problems", text: "Solve 2 problems", current: solvedTodayCount, target: 2, path: "/practice" },
        { id: "study_lesson", text: "Complete 1 study lesson", current: lessonsCompletedToday, target: 1, path: "/modes" },
        { id: "interviews", text: "Study foundational core subjects", current: reviewedInterviews ? 1 : 0, target: 1, path: "/interviews", stateSetter: setReviewedInterviews }
      ],
      // Friday
      [
        { id: "solve_problems", text: "Solve 3 problems", current: solvedTodayCount, target: 3, path: "/practice" },
        { id: "study_lesson", text: "Complete 1 study lesson", current: lessonsCompletedToday, target: 1, path: "/modes" },
        { id: "contest", text: "Register / check Contest details", current: registeredContest ? 1 : 0, target: 1, path: "/contests", stateSetter: setRegisteredContest }
      ],
      // Saturday
      [
        { id: "solve_problems", text: "Solve 4 problems (Weekend goal)", current: solvedTodayCount, target: 4, path: "/practice" },
        { id: "study_lesson", text: "Complete 2 study lessons", current: lessonsCompletedToday, target: 2, path: "/modes" },
        { id: "resume", text: "Review and refresh Resume", current: updatedResume ? 1 : 0, target: 1, path: "/resume", stateSetter: setUpdatedResume }
      ]
    ];

    return questPools[dayIndex];
  }, [solvedTodayCount, lessonsCompletedToday, streakStats.currentStreak, reviewedInterviews, registeredContest, updatedResume, currentDay]);

  const completedQuestsCount = useMemo(() => {
    return dailyQuests.filter(q => q.current >= q.target).length;
  }, [dailyQuests]);

  const handleQuestClick = (quest) => {
    if (quest.stateSetter) {
      quest.stateSetter(true);
    }
    navigate(quest.path);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0.5rem 2rem 0.5rem' }}>
      
      {/* Main content grid */}
      <div className="dashboard-grid dashboard-layout">
        
        {/* Left main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Hero Welcome Card */}
          <div style={{
            background: 'linear-gradient(135deg, #09090b 0%, #062f21 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '2.25rem 2rem',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '-50px',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none'
            }} />
            
            <div style={{ maxWidth: '65%', zIndex: 2 }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#ffffff' }}>Welcome back, {user?.username || 'Developer'}! 👋</h2>
              
              <p style={{ 
                color: '#e2e8f0', 
                fontSize: '0.88rem', 
                margin: '0 0 1.25rem 0',
                lineHeight: 1.5,
                fontStyle: 'italic',
                borderLeft: '2px solid #10b981',
                paddingLeft: '0.75rem'
              }}>
                "{motivationalQuote}"
              </p>

              {continueLessons && continueLessons.length > 0 && continueLessons[0].topicId && (
                <p style={{ 
                  fontSize: '0.78rem', 
                  color: '#cbd5e1', 
                  margin: '0 0 0.85rem 0', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  fontWeight: 500
                }}>
                  <span style={{ color: '#34d399', fontWeight: 700 }}>✦ Resume Lesson:</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{continueLessons[0].title}</span>
                  <span style={{ color: '#94a3b8' }}>({continueLessons[0].category} • {continueLessons[0].pct}%)</span>
                </p>
              )}
              
              {/* Action Button */}
              <button
                onClick={() => {
                  if (continueLessons && continueLessons.length > 0 && continueLessons[0].topicId) {
                    navigate(`/study?topicId=${continueLessons[0].topicId}&lessonId=${continueLessons[0].id}&mode=quick_learn`);
                  } else {
                    navigate('/modes');
                  }
                }}
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 650,
                  color: 'var(--text-main)',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
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
              width: '180px', 
              height: '160px', 
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
                  filter: 'drop-shadow(0 0 15px rgba(16, 185, 129, 0.2))' 
                }} 
              />
            </div>
          </div>

          <StatsCards 
            solvedCount={solvedProblemsCount} 
            streak={streakStats.currentStreak} 
            completedLessons={completedLessonsCount} 
            xp={totalXP} 
            easyCount={problemStats.easy}
            mediumCount={problemStats.medium}
            hardCount={problemStats.hard}
          />
        
          {/* Continue Where You Left Off */}
          {continueLessons.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
                Continue Where You Left Off
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {continueLessons.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/study?topicId=${item.topicId}&lessonId=${item.id}&mode=quick_learn`)}
                    style={{
                      background: 'var(--bg-card)',
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
                        <Layers size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.category}</span>
                        <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</h4>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      <span>Progress</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.pct}%</span>
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
                ))}
              </div>
            </div>
          )}

          {/* Interview Preparation Hub */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  Interview Preparation Hub
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  Simulate live interviews, build resumes, and review core systems architecture.
                </span>
              </div>
              <span 
                onClick={() => navigate('/interviews')}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Go to Prep Hub
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'AI Technical Mock Coding', desc: 'Solve live whiteboarding problems explaining details to the AI.', icon: Code2, path: '/coding-interview', color: '#10b981', key: 'prep_mock_coding' },
                { title: 'AI Behavioral Roleplay', desc: 'Simulate conversational HR interview rounds with feedback.', icon: Users, path: '/mock-interview', color: '#3b82f6', key: 'prep_behavioral' },
                { title: 'ATS Resume Builder', desc: 'Generate a clean, single-page, ATS-optimized developer resume.', icon: FileText, path: '/resume', color: '#f59e0b', key: 'prep_resume' },
                { title: 'System Design & Subjects', desc: 'Browse cheat sheets on scalability, patterns, and databases.', icon: Layers, path: '/interviews', color: '#8b5cf6', key: 'prep_system_design' },
              ].map((item, idx) => {
                const Icon = item.icon;
                const sessions = parseInt(localStorage.getItem(item.key) || '0', 10);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      localStorage.setItem(item.key, String(sessions + 1));
                      navigate(item.path);
                    }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                    className="hover-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-xs)',
                        background: `${item.color}18`,
                        border: `1px solid ${item.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.color
                      }}>
                        <Icon size={16} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>{item.title}</h4>
                      <span style={{
                        fontSize: '0.6rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '100px',
                        background: sessions > 0 ? `${item.color}15` : 'var(--box-bg)',
                        color: sessions > 0 ? item.color : 'var(--text-muted)',
                        border: `1px solid ${sessions > 0 ? item.color + '30' : 'transparent'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {sessions > 0 ? `${sessions} session${sessions !== 1 ? 's' : ''}` : 'Not started'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Unified Goal Tracking Chart */}
          <div style={{ display: "flex", width: "100%" }}>
            <LearningChart history={problemStats.history} />
          </div>

          <div className="charts-grid">
            <ActivityHeatmap history={problemStats.history} />
            <LanguagePieChart history={problemStats.history} />
          </div>

        </div>

        {/* Right sidebar column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Daily Quests Checklist */}
          <div className="card" style={{ padding: '1.25rem', borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Today's Quests</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Interactive Daily Challenges</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {completedQuestsCount}/3 Completed
              </span>
            </div>
            
            {/* Goal Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {dailyQuests.map((quest, idx) => {
                const isDone = quest.current >= quest.target;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleQuestClick(quest)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.65rem', 
                      fontSize: '0.78rem', 
                      color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'background 0.2s'
                    }}
                    className="hover-card-subtle"
                  >
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: `1px solid ${isDone ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      flexShrink: 0
                    }}>
                      {isDone && '✓'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1, display: 'block', fontWeight: 600 }}>
                        {quest.text}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>
                        {quest.id === "streak" || quest.id === "resume" || quest.id === "contest" || quest.id === "interviews"
                          ? (isDone ? "Completed!" : "Click to complete") 
                          : `${quest.current} / ${quest.target} completed`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Progress Tracker */}
            <div style={{ width: '100%', height: '6px', background: 'var(--box-bg)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, Math.round((completedQuestsCount / 3) * 100))}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, #3b82f6 100%)',
                boxShadow: '0 0 6px var(--primary)',
                borderRadius: '10px' 
              }} />
            </div>
          </div>

          {/* Option C: 7-day Visual Streak Calendar Widget */}
          <div className="card animate-fade-in" style={{ padding: '1.25rem', borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flame size={24} color="#F97316" className="pulse-glow" />
                <span>Streak Tracker</span>
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#F97316', fontWeight: 750 }}>
                {streakLoaded ? `${streakStats.currentStreak} Days 🔥` : 'Loading…'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
              {streakDays.map((day, idx) => (
                <div key={idx} title={day.dateStr}>
                  <div style={{
                    aspectRatio: '1/1',
                    borderRadius: '50%',
                    background: day.isCompleted ? 'var(--primary)' : 'transparent',
                    border: `1px solid ${day.isToday ? 'var(--primary)' : (day.isCompleted ? 'var(--primary)' : 'var(--border-color)')}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: day.isCompleted ? '#fff' : (day.isToday ? 'var(--primary)' : 'var(--text-muted)'),
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    marginBottom: '4px',
                    boxShadow: day.isToday ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none'
                  }}>
                    {day.isCompleted ? '✓' : day.dayLabel}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contests Arena Card */}
          <div className="card" style={{ 
            padding: '1.25rem', 
            borderColor: 'var(--border-color)',
            background: 'var(--bg-card)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Contests Arena
              </h3>
              <span 
                onClick={() => navigate('/contests')}
                style={{ fontSize: '0.75rem', color: 'var(--primary-hover)', cursor: 'pointer', fontWeight: 600 }}
              >
                View All
              </span>
            </div>

            {/* Live Contest Sub-Card */}
            {dashboardContests.live ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--error)', boxShadow: '0 0 8px var(--error)', animation: 'pulse 2s infinite' }}></div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--error)', fontWeight: 800, textTransform: 'uppercase' }}>Live</span>
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>{dashboardContests.live.title}</h4>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Ends in {getCountdown(dashboardContests.live.endTime).hrs}h {getCountdown(dashboardContests.live.endTime).mins}m
                </p>
                <button
                  onClick={() => navigate(`/contests/${dashboardContests.live.id}`)}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Enter Arena
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                No active contests right now.
              </div>
            )}

            {/* Upcoming Contest Sub-Card */}
            {dashboardContests.upcoming ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-main)' }}>{dashboardContests.upcoming.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Starts in</p>
                  </div>
                  <Trophy size={18} color="var(--primary)" />
                </div>
                
                <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {[ 
                    { val: getCountdown(dashboardContests.upcoming.startTime).hrs, label: 'h' }, 
                    { val: getCountdown(dashboardContests.upcoming.startTime).mins, label: 'm' }, 
                    { val: getCountdown(dashboardContests.upcoming.startTime).secs, label: 's' } 
                  ].map((time, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{time.val}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{time.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setRegisteredContest(true); triggerToast(`Successfully registered for ${dashboardContests.upcoming.title}!`); setTimeout(() => navigate('/contests'), 1500); }}
                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, background: 'linear-gradient(90deg, var(--primary), #3b82f6)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Register
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                No upcoming contests.
              </div>
            )}
          </div>

          {/* Difficulty Donut Chart */}
          <DifficultyDonutChart 
            easy={problemStats.easy} 
            medium={problemStats.medium} 
            hard={problemStats.hard} 
          />

        </div>

      </div>

      {/* Local Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(9, 11, 22, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-main)',
          zIndex: 99999,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ color: 'var(--primary)' }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
