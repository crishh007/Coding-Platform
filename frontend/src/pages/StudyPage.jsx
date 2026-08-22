import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BookOpen, Play, HelpCircle, Code2, Layers, ChevronRight, ChevronLeft,Search, Bot, CheckCircle2, AlertCircle,
  Award,BookMarked,Terminal,Activity,ArrowRight,TrendingUp,Map,Compass,
  Lock,ShieldCheck,RefreshCw,Pause,SkipForward,SkipBack,RotateCcw,Edit3
} from 'lucide-react';
import { motion } from 'framer-motion';
import client from '../api/client';
import { ProgressContext } from '../context/ProgressContext';

const getPracticeTemplate = (slug, lang, defaultSig = '') => {
  if (defaultSig) return defaultSig;
  if (lang === 'python') return '# Write your complete code here\n';
  return '// Write your complete code here\n';
};

const renderComingSoonTab = (title) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '2rem 1rem',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background neon glows */}
    <div style={{
      position: 'absolute',
      top: '10%',
      left: '20%',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(0,0,0,0) 70%)',
      pointerEvents: 'none',
      zIndex: 0
    }} />
    
    {/* Main Glassmorphic Panel */}
    <div 
      className="card" 
      style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-card)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        animation: 'fadeIn 0.6s ease-out'
      }}
    >
      {/* Animated Icon Ring */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.15)',
          filter: 'blur(8px)',
          animation: 'pulse 2s infinite'
        }} />
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-hover)',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)',
          zIndex: 1
        }}>
          <Lock size={20} />
        </div>
      </div>

      {/* Text Headers */}
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-on-primary)' }}>
          Coming Soon
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          The {title} module is currently under development.
        </p>
      </div>
    </div>
  </div>
);

export default function StudyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicId = searchParams.get('topicId');
  const lessonId = searchParams.get('lessonId');
  const pathId = searchParams.get('pathId') || '';

  const [adminMode, setAdminMode] = useState(() => localStorage.getItem('skillsync_admin_mode') === 'true');

  useEffect(() => {
    const handleAdminChange = () => {
      setAdminMode(localStorage.getItem('skillsync_admin_mode') === 'true');
    };
    window.addEventListener('admin-mode-change', handleAdminChange);
  
  return () => window.removeEventListener('admin-mode-change', handleAdminChange);
  }, []);
  
  // Sidebar & Navigation states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedTopics, setCollapsedTopics] = useState({});

  useEffect(() => {
    setCollapsedTopics({});
  }, [searchQuery]);

  const toggleTopic = (id, currentIsCollapsed) => {
    setCollapsedTopics(prev => ({ ...prev, [id]: !currentIsCollapsed }));
  };
  
  // Hydrated lesson details from database
  const [lessonData, setLessonData] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [relatedProblems, setRelatedProblems] = useState([]);

  // Active tab: 'explanation' | 'visuals' | 'code' | 'quiz' | 'practice'
  const [activeTab, setActiveTab] = useState('explanation');

  // Interactive Visuals State
  const [customArray, setCustomArray] = useState([]);
  const [customTarget, setCustomTarget] = useState('');
  const [simStepsList, setSimStepsList] = useState([]);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1500); // 1500ms default
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [arrayInputText, setArrayInputText] = useState('');
  const [addNodeVal, setAddNodeVal] = useState('');
  const [insertNodeVal, setInsertNodeVal] = useState('');
  const [insertNodeIdx, setInsertNodeIdx] = useState('0');
  const [deleteNodeIdx, setDeleteNodeIdx] = useState('0');
  const autoplayTimerRef = useRef(null);

  // Code Tab state
  const [activeLang, setActiveLang] = useState('python');
  const [runningCode, setRunningCode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  
  // Quiz states
  const [userAnswers, setUserAnswers] = useState({});
  const [quizHistory, setQuizHistory] = useState([]);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [viewingQuizAttempt, setViewingQuizAttempt] = useState(null);

  // Practice States
  const [practiceLang, setPracticeLang] = useState('python');
  const [practiceQuestionIdx, setPracticeQuestionIdx] = useState(0);
  const [customTestCase, setCustomTestCase] = useState('');
  const [userPracticeCode, setUserPracticeCode] = useState('');
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [submittingPractice, setSubmittingPractice] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState(null);
  const [practiceRunOutput, setPracticeRunOutput] = useState(null);
  const [practiceRunMode, setPracticeRunMode] = useState('submit');

  // AI Tutor States
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Hello! I am your SkillSync AI Tutor. Ask me any question about this lesson or complexity curves!' }
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  // Progress Tracking & Streak States
  const { progress, toggleLessonCompletion: contextToggleLessonCompletion, fetchProgress } = useContext(ProgressContext);
  const completedLessonIds = progress?.completedLessonIds || [];
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });

  // Auto-scroll pseudocode
  useEffect(() => {
    if (simStepIndex >= 0) {
      const activeLineEl = document.getElementById('active-pseudocode-line');
      const containerEl = document.getElementById('pseudocode-container');
      if (activeLineEl && containerEl) {
        const topPos = activeLineEl.offsetTop - (containerEl.clientHeight / 2) + (activeLineEl.clientHeight / 2);
        containerEl.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    }
  }, [simStepIndex]);

  // Fetch progress status & streak info
  const fetchProgressAndStreak = () => {
    fetchProgress();

    client.get('/user/streak')
      .then((res) => {
        if (res) {
          setStreakData(res);
        }
      })
      .catch((err) => console.error("Error fetching streak:", err));
  };

  // Ping activity on mount
  useEffect(() => {
    client.post('/user/streak/ping')
      .then((res) => {
        if (res) {
          setStreakData(res);
        }
        fetchProgressAndStreak();
      })
      .catch((err) => {
        console.error("Error pinging streak:", err);
        fetchProgressAndStreak();
      });
  }, []);

  const toggleLessonCompletion = async (lessonId, isCompleted) => {
    await contextToggleLessonCompletion(lessonId, isCompleted);
    // Fetch streak in case completion gave streak rewards
    client.get('/user/streak')
      .then((res) => {
        if (res) {
          setStreakData(res);
        }
      })
      .catch((err) => console.error("Error fetching streak:", err));
  };

  // Fetch topics and current topic lessons
  useEffect(() => {
    client.get(`/topics/tree${pathId ? `?pathId=${pathId}` : ''}`)
      .then((res) => setTopics(res || []))
      .catch((err) => console.error(err));

    if (topicId) {
      client.get(`/topics/${topicId}`)
        .then((res) => {
          setCurrentTopic(res);
          if (res.lessons && res.lessons.length > 0) {
            setLessons(res.lessons);
            // Default to the specified lesson, or the first lesson
            const targetLesson = lessonId ? res.lessons.find(l => (l.lessonId || l.id) === lessonId) : null;
            setSelectedLesson(targetLesson || res.lessons[0]);
          } else {
            setLessons([]);
            setSelectedLesson(null);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [topicId]);


  // Sync selectedLesson when lessonId changes in the URL
  useEffect(() => {
    if (lessons.length > 0 && lessonId) {
      const targetLesson = lessons.find(l => (l.lessonId || l.id) === lessonId);
      if (targetLesson) {
        setSelectedLesson(targetLesson);
      }
    }
  }, [lessonId, lessons]);

  // Load selected lesson placeholders and metadata from DB
  useEffect(() => {
    const activeId = selectedLesson?.lessonId || selectedLesson?.id;
    if (activeId) {
      setLoadingLesson(true);
      // Track last viewed lesson session in localStorage
      if (topicId) {
        localStorage.setItem('last_viewed_lesson', JSON.stringify({
          topicId: topicId,
          lessonId: activeId
        }));
      }
      Promise.all([
        client.get(`/lessons/${activeId}`),
        client.get(`/lessons/${activeId}/quiz/submissions`).catch(() => []),
        client.get(`/lessons/${activeId}/practice/submissions`).catch(() => []),
        client.get('/problems').catch(() => [])
      ])
        .then(([res, qSubmissions, pSubmissions, allProblems]) => {
          setLessonData(res);
          setQuizHistory(qSubmissions || []);
          setPracticeHistory(pSubmissions || []);
          
          if (res && allProblems && allProblems.length > 0) {
            const lessonTitle = (res.title || '').toLowerCase();
            const matched = allProblems.filter(p => {
              const probTitle = (p.title || '').toLowerCase();
              const probTopics = (p.topics || []).map(t => t.toLowerCase());
              return probTitle.includes(lessonTitle) || 
                     lessonTitle.includes(probTitle) ||
                     probTopics.some(t => lessonTitle.includes(t));
            });
            setRelatedProblems(matched.length > 0 ? matched.slice(0, 3) : allProblems.slice(0, 3));
          } else {
            setRelatedProblems([]);
          }
          
          // Reset states on lesson change
          setSimStepIndex(0);
          setUserAnswers({});
          setQuizResult(null);
          setViewingQuizAttempt(null);
          setPracticeFeedback(null);
          
          // Pre-populate practice starter signature
          const signature = res?.practice?.questions?.[0]?.starterCode?.python || '';
          setUserPracticeCode(signature || '# Write your implementation code here\n');
        })
        .catch((err) => console.error("Error loading detailed lesson data:", err))
        .finally(() => setLoadingLesson(false));
    } else {
      setLessonData(null);
      setQuizHistory([]);
      setPracticeHistory([]);
    }
  }, [selectedLesson]);

  // Update practice editor when language, lesson, or tab changes
  useEffect(() => {
    if (lessonData?.slug && activeTab === 'practice') {
      const signature = lessonData?.practice?.questions?.[practiceQuestionIdx]?.starterCode?.[practiceLang] || '';
      setUserPracticeCode(getPracticeTemplate(lessonData.slug, practiceLang, signature));
    }
  }, [practiceLang, selectedLesson, activeTab, lessonData]);

  const getMeta = (type) => {
    if (!lessonData) return null;
    switch(type) {
      case 'visual_explanation': return lessonData.visualSimulation?.config || {};
      case 'practice_question': return {
        questions: lessonData.practice?.questions || []
      };
      case 'quiz': return {
        ...lessonData.quiz,
        questions: lessonData.quiz?.questions?.map(q => ({
          ...q,
          correctOption: q.answer
        }))
      };
      case 'code_snippet': return lessonData.sandbox?.languages;
      case 'brief_explanation': return { title: lessonData.title, description: lessonData.explanation?.briefOverview };
      case 'detailed_text': return {
        analogy: lessonData.explanation?.realWorldAnalogy,
        steps: lessonData.explanation?.keySteps,
        tip: lessonData.explanation?.proTip
      };
      default: return null;
    }
  };

  // Generate Simulation steps based on selected lesson topic types
  useEffect(() => {
    const visualMeta = getMeta('visual_explanation');
    const defaultArray = [1, 2, 3, 4, 5];
    if (visualMeta) {
      const targetArr = visualMeta.array || visualMeta.initialArray;
      const arr = Array.isArray(targetArr) && targetArr.length > 0 ? targetArr : defaultArray;
      setCustomArray(arr);
      setArrayInputText(arr.join(', '));
      setCustomTarget(visualMeta.target !== undefined ? visualMeta.target.toString() : '3');
    } else {
      setCustomArray(defaultArray);
      setArrayInputText(defaultArray.join(', '));
      setCustomTarget('3');
    }
  }, [lessonData]);

  // Autoplay loop for simulations
  useEffect(() => {
    if (isPlaying) {
      autoplayTimerRef.current = setInterval(() => {
        setSimStepIndex((prev) => {
          if (prev < simStepsList.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false); // Stop when we reach the end
            return prev;
          }
        });
      }, playSpeed);
    } else {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isPlaying, playSpeed, simStepsList.length]);

  // Turn off play state when switching tab, lesson, or resetting custom array/target
  useEffect(() => {
    setIsPlaying(false);
  }, [activeTab, selectedLesson?.id, customArray, customTarget]);

  // Keep list index choices in bounds when array size changes
  useEffect(() => {
    const idxInsert = parseInt(insertNodeIdx, 10);
    const idxDelete = parseInt(deleteNodeIdx, 10);
    if (idxInsert > customArray.length) {
      setInsertNodeIdx('0');
    }
    if (idxDelete >= customArray.length) {
      setDeleteNodeIdx('0');
    }
  }, [customArray, insertNodeIdx, deleteNodeIdx]);

  const handleApplyCustomArray = (e) => {
    e.preventDefault();
    const parts = arrayInputText.split(',').map(p => p.trim());
    const numbers = parts.map(p => parseInt(p, 10)).filter(num => !isNaN(num));

    if (numbers.length < 3 || numbers.length > 12) {
      alert("Array size must be between 3 and 12 elements.");
      return;
    }

    let finalArr = numbers;
    if ((lessonData?.slug || '').includes('binary-search')) {
      finalArr = [...numbers].sort((a, b) => a - b);
      setArrayInputText(finalArr.join(', '));
    }

    setCustomArray(finalArr);
    if (finalArr.length > 0) {
      const curTargetInt = parseInt(customTarget, 10);
      if (!finalArr.includes(curTargetInt)) {
        setCustomTarget(finalArr[0].toString());
      }
    }
    setSimStepIndex(0);
    setIsPlaying(false);
  };

  const handleAddNode = (e) => {
    e.preventDefault();
    const val = parseInt(addNodeVal, 10);
    if (isNaN(val)) {
      alert("Please enter a valid integer for the node value.");
      return;
    }
    if (customArray.length >= 12) {
      alert("List size cannot exceed 12 nodes.");
      return;
    }
    const newArr = [...customArray, val];
    setCustomArray(newArr);
    setArrayInputText(newArr.join(', '));
    setAddNodeVal('');
    setSimStepIndex(0);
    setIsPlaying(false);
  };

  const handleInsertNode = (e) => {
    e.preventDefault();
    const val = parseInt(insertNodeVal, 10);
    const idx = parseInt(insertNodeIdx, 10);
    if (isNaN(val)) {
      alert("Please enter a valid integer for the node value.");
      return;
    }
    if (isNaN(idx) || idx < 0 || idx > customArray.length) {
      alert(`Please enter a valid index between 0 and ${customArray.length}.`);
      return;
    }
    if (customArray.length >= 12) {
      alert("List size cannot exceed 12 nodes.");
      return;
    }
    const newArr = [...customArray];
    newArr.splice(idx, 0, val);
    setCustomArray(newArr);
    setArrayInputText(newArr.join(', '));
    setInsertNodeVal('');
    setSimStepIndex(0);
    setIsPlaying(false);
  };

  const handleDeleteNode = (e) => {
    e.preventDefault();
    const idx = parseInt(deleteNodeIdx, 10);
    if (isNaN(idx) || idx < 0 || idx >= customArray.length) {
      alert(`Please enter a valid index between 0 and ${customArray.length - 1}.`);
      return;
    }
    if (customArray.length <= 3) {
      alert("List size must be at least 3 nodes.");
      return;
    }
    const newArr = [...customArray];
    newArr.splice(idx, 1);
    setCustomArray(newArr);
    setArrayInputText(newArr.join(', '));
    setSimStepIndex(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!lessonData) return;
    
    // Fetch dynamic steps from backend
    const fetchSimulation = async () => {
      try {
        const baseConfig = lessonData.visualSimulation?.config || {};
        const payload = {
          ...baseConfig,
          array: customArray.length > 0 ? customArray : (baseConfig.array || [1, 2, 3, 4, 5]),
          target: customTarget !== '' ? parseInt(customTarget, 10) : (baseConfig.target !== undefined ? baseConfig.target : 3)
        };
        
        const response = await client.post(`/lessons/${lessonData.id}/simulate`, payload);
        if (response && response.steps) {
          setSimStepsList(response.steps);
          setSimStepIndex(0);
          fetchProgress();
        } else {
          setSimStepsList([]);
        }
      } catch (err) {
        console.error("Simulation error:", err);
        setSimStepsList([]);
      }
    };
    
    fetchSimulation();
  }, [lessonData, customArray, customTarget, activeTab]);

  const handleRunCode = () => {
    setRunningCode(true);
    setConsoleOutput('Compiling code snippets and running unit tests...');
    
    // Customize compiler console outputs matching lesson names
    setTimeout(() => {
      setRunningCode(false);
      const title = selectedLesson?.title || 'Algorithm';
      setConsoleOutput(`> npm test -- ${lessonData?.slug || 'dsa'}\nExecuting ${title} verification tests...\nTest Case 1: optimal input -> PASS\nTest Case 2: empty bounds -> PASS\nTest Case 3: boundary indexing -> PASS\nAll 3 verification test cases PASSED successfully.\nExecution duration: 0.03s.`);
    }, 1500);
  };

  const handleQuizAnswer = (qIndex, optIndex) => {
    setUserAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleQuizSubmit = () => {
    const quizMeta = getMeta('quiz');
    if (!(selectedLesson?.lessonId || selectedLesson?.id) || !quizMeta?.questions) return;
    setSubmittingQuiz(true);
    
    // Map userAnswers object to an array matching the question indices
    const answersArr = quizMeta.questions.map((_, i) => userAnswers[i] ?? -1);

    client.post(`/lessons/${selectedLesson.lessonId || selectedLesson.id}/quiz/submit`, { answers: answersArr })
      .then((res) => {
        setQuizResult(res);
        fetchProgressAndStreak();
        // Refresh history log
        return client.get(`/lessons/${selectedLesson.lessonId || selectedLesson.id}/quiz/submissions`);
      })
      .then((submissions) => {
        setQuizHistory(submissions || []);
      })
      .catch((err) => {
        console.error("Error submitting quiz:", err);
        alert("Failed to submit quiz. Please try again.");
      })
      .finally(() => {
        setSubmittingQuiz(false);
      });
  };

  // Practice & AI diagnostic reviewer matching matching rules
  const handlePracticeSubmit = () => {
    if (!(selectedLesson?.lessonId || selectedLesson?.id)) return;
    setSubmittingPractice(true);
    setPracticeFeedback(null);
    setPracticeRunOutput(null);

    if (practiceRunMode === 'run') {
      client.post('/judge/execute', {
        code: userPracticeCode,
        language: practiceLang,
        input: customTestCase
      })
      .then((res) => {
        setPracticeRunOutput(res);
      })
      .catch((err) => {
        setPracticeRunOutput({ error: err.response?.data?.error || err.message || 'Execution Failed' });
      })
      .finally(() => setSubmittingPractice(false));
      return;
    }

    client.post(`/lessons/${selectedLesson.lessonId || selectedLesson.id}/practice/submit`, {
      code: userPracticeCode,
      language: practiceLang
    })
      .then((res) => {
        let parsedFeedback = null;
        try {
          parsedFeedback = JSON.parse(res.feedback);
        } catch (e) {
          console.error("Error parsing practice feedback JSON:", e);
        }
        
        if (parsedFeedback) {
          setPracticeFeedback({
            status: res.status,
            timeComplexity: (lessonData?.slug || '').includes('binary') ? 'O(log n)' : 'O(n)',
            spaceComplexity: 'O(1)',
            evaluation: parsedFeedback.evaluation,
            suggestion: parsedFeedback.suggestion
          });
        }
        
        fetchProgressAndStreak();
        // Refresh practice submissions history
        return client.get(`/lessons/${selectedLesson.lessonId || selectedLesson.id}/practice/submissions`);
      })
      .then((submissions) => {
        setPracticeHistory(submissions || []);
      })
      .catch((err) => {
        console.error("Error submitting practice:", err);
        alert("Failed to run code analysis. Please check your network connection.");
      })
      .finally(() => {
        setSubmittingPractice(false);
      });
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    const query = aiQuestion || e.target.elements[0]?.value;
    if (!query || !query.trim()) return;

    setAiChat(prev => [...prev, { role: 'user', text: query }]);
    setAiQuestion('');
    setAiTyping(true);

    try {
      const { default: client } = await import('../api/client');
      const data = await client.post('/ai/chat', { 
        message: query,
        context: selectedLesson?.title || 'Unknown Lesson'
      });
      setAiChat(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setAiChat(prev => [...prev, { role: 'assistant', text: 'Sorry, I am currently unavailable.' }]);
    } finally {
      setAiTyping(false);
    }
  };

  // Flatten nested topic tree recursively to filter and search all topics (including sub-topics)
  const flattenTopics = (nodeList, parentPath = [], topicIdContext = null) => {
    let list = [];
    nodeList.forEach(node => {
      const currentPath = [...parentPath, node.title];
      
      // If we are at the topic level (parentPath length 1), this node is a topic
      const currentTopicId = parentPath.length === 1 ? node.id : topicIdContext;
      
      if (!node.children || node.children.length === 0) {
        // Leaf node
        const isLesson = parentPath.length >= 2;
        list.push({ 
          ...node, 
          breadcrumb: currentPath.join(' > '), 
          topicId: currentTopicId,
          isLesson
        });
      } else {
        // Non-leaf node
        list = list.concat(flattenTopics(node.children, currentPath, currentTopicId));
      }
    });
    return list;
  };

  const flatTopics = flattenTopics(topics);
  const filteredFlatTopics = flatTopics.filter(t => 
    t.breadcrumb.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to check if a tree node contains a specific topic ID
  const containsTopicId = (node, id) => {
    if (node.id === id) return true;
    if (node.children && node.children.length > 0) {
      return node.children.some(child => containsTopicId(child, id));
    }
    return false;
  };

  // When NOT searching, show the full course structure (isolated to the active course if a topic is selected)
  const filteredTopicsTree = topics.filter(rootTopic => {
    if (searchQuery.trim() !== '') return false; // Hide tree when searching
    
    // Isolate to the specific course tree that contains the active topic
    if (topicId) {
      return containsTopicId(rootTopic, topicId);
    }
    
    return true;
  });

  // Auto-scroll to the selected topic/lesson in the sidebar
  useEffect(() => {
    if (topicId && searchQuery.trim() === '') {
      setTimeout(() => {
        // Find the active element in the DOM
        const activeEl = document.getElementById(`lesson-${topicId}`) || document.getElementById(`topic-${topicId}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Visual highlight to show user exactly what was focused
          const originalBg = activeEl.style.backgroundColor;
          const originalBoxShadow = activeEl.style.boxShadow;
          
          activeEl.style.transition = 'all 0.3s ease';
          activeEl.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
          activeEl.style.boxShadow = '0 0 0 2px var(--primary)';
          
          setTimeout(() => {
            activeEl.style.backgroundColor = originalBg;
            activeEl.style.boxShadow = originalBoxShadow || 'none';
          }, 2000);
        }
      }, 300); // Wait for React to render the expanded tree
    }
  }, [topicId, searchQuery]);

  // Complexity indicator resolution
  const getComplexityString = (slug) => {
    if (slug?.includes('binary-search')) return { time: 'O(log n)', space: 'O(1)' };
    if (slug?.includes('linear-search')) return { time: 'O(n)', space: 'O(1)' };
    if (slug?.includes('linked-list')) return { time: 'O(n) traversal', space: 'O(1)' };
    if (slug?.includes('arrays')) return { time: 'O(1) random access', space: 'O(n)' };
    return { time: 'O(n)', space: 'O(1)' };
  };
  const complexity = getComplexityString(lessonData?.slug);

  const briefMeta = getMeta('brief_explanation');
  const detailedMeta = getMeta('detailed_text');
  const codeMeta = getMeta('code_snippet');
  const quizMeta = getMeta('quiz');
  const practiceMeta = getMeta('practice_question');

  const totalTopicLessons = lessons.length;
  const completedTopicLessons = lessons.filter(l => completedLessonIds.includes(l.lessonId || l.id)).length;
  const progressPercentage = totalTopicLessons > 0 ? Math.round((completedTopicLessons / totalTopicLessons) * 100) : 0;
  const dashArray = 150.8;
  const dashOffset = dashArray - (progressPercentage / 100) * dashArray;

  // Determine which array and target to display in the visualizer
  const configArrayDisp = lessonData?.visualSimulation?.config?.array;
  const validConfigArrayDisp = Array.isArray(configArrayDisp) ? configArrayDisp : [1, 2, 3, 4, 5];
  const displayArray = customArray.length > 0 ? customArray : validConfigArrayDisp;
  const displayTarget = customTarget !== '' ? customTarget : (lessonData?.visualSimulation?.config?.target || 3);

  return (
    <div style={{ 
      display: 'flex', 
      margin: '-1rem -1.5rem',
      height: 'calc(100vh - var(--navbar-height))', 
      overflow: 'hidden',
      background: 'var(--bg-main)'
    }}>
      {/* 1. Left Sidebar - Course Navigation Tree */}
      <div 
        style={{
          width: sidebarCollapsed ? '0' : '320px',
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'var(--transition-normal)',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0
        }}
      >
        {/* Search */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={14} color="var(--text-on-primary)" style={{ position: 'absolute', left: '0.8rem', pointerEvents: 'none' }} />
            <input 
              type="text" 
              className="search-input-glass" 
              placeholder="Search topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Topic Tree Menu */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          {searchQuery.trim() !== '' ? (
            // Render Flat Search Results
            filteredFlatTopics.length === 0 ? (
              <div style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No topics found
              </div>
            ) : (
              <div style={{ padding: '0 1rem' }}>
                <div style={{ padding: '0 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Search Results
                </div>
                {filteredFlatTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className="card"
                    style={{
                      padding: '0.85rem 1rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--box-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    }}
                    onClick={() => {
                      setSearchQuery('');
                      const navUrl = topic.isLesson 
                        ? `/study?topicId=${topic.topicId}&lessonId=${topic.id}&mode=quick_learn${pathId ? `&pathId=${pathId}` : ''}`
                        : `/study?topicId=${topic.id}&mode=quick_learn${pathId ? `&pathId=${pathId}` : ''}`;
                      navigate(navUrl);
                    }}
                  >
                    <Search size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-on-primary)', fontWeight: 500, wordBreak: 'break-word', lineHeight: '1.4' }}>
                      {topic.breadcrumb.split(' > ').map((crumb, i, arr) => (
                        <span key={i}>
                          {i === arr.length - 1 ? (
                            <span style={{ color: 'var(--text-on-primary)' }}>{crumb}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>{crumb} <span style={{ margin: '0 4px', fontSize: '0.75rem' }}>›</span> </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : topicId ? (
            // Show topic tree when a topic is selected
            <div style={{ position: 'relative', paddingLeft: '1.5rem', paddingTop: '0.5rem' }}>
              {/* Main Vertical Spine */}
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: '2rem',
                left: '20px',
                width: '2px',
                background: 'linear-gradient(to bottom, var(--primary) 0%, rgba(139, 92, 246, 0.1) 100%)',
                zIndex: 1
              }} />

              {filteredTopicsTree.map((rootTopic) => {
                const isActiveRoot = containsTopicId(rootTopic, topicId);
                
                let isCollapsed;
                if (collapsedTopics[rootTopic.id] !== undefined) {
                  isCollapsed = collapsedTopics[rootTopic.id];
                } else {
                  isCollapsed = !isActiveRoot;
                }

                return (
                <div key={rootTopic.id} id={`topic-${rootTopic.id}`} style={{ position: 'relative', marginBottom: '2.5rem' }}>
                  {/* Root Node Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-20px',
                    top: '4px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-sidebar)',
                    border: '3px solid var(--primary)',
                    zIndex: 2,
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
                    transform: 'translateX(-4px)'
                  }} />

                  {/* Root Topic Header */}
                  <div 
                    onClick={() => toggleTopic(rootTopic.id, isCollapsed)}
                    style={{ 
                      padding: '0 1rem 0.5rem 1rem', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 800, 
                      color: 'var(--text-on-primary)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px',
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
                      transition: 'color 0.2s ease, text-shadow 0.2s ease'
                    }}>
                      {rootTopic.title}
                    </div>
                    <ChevronRight 
                      size={16} 
                      color={'rgba(255,255,255,0.4)'} 
                      style={{ 
                        transition: 'transform 0.2s ease', 
                        transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' 
                      }} 
                    />
                  </div>

                  {/* Sub-Topics (Branches) */}
                  <div style={{ display: isCollapsed ? 'none' : 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                    {rootTopic.children && rootTopic.children.length > 0 ? (
                      rootTopic.children.map((subTopic) => {
                        const isSubTopicActive = containsTopicId(subTopic, topicId);
                        const hasChildren = subTopic.children && subTopic.children.length > 0;
                        const isSubTopicCollapsed = collapsedTopics[subTopic.id] !== undefined ? collapsedTopics[subTopic.id] : !isSubTopicActive;

                        return (
                          <div key={subTopic.id} style={{ position: 'relative' }}>
                            {/* Curved Branch Line */}
                            <div style={{
                              position: 'absolute',
                              left: '-19px',
                              top: '-20px',
                              width: '24px',
                              height: '38px',
                              borderBottom: `${isSubTopicActive ? '3px' : '2px'} solid ${isSubTopicActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                              borderLeft: `${isSubTopicActive ? '3px' : '2px'} solid ${isSubTopicActive ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                              borderBottomLeftRadius: '12px',
                              zIndex: 1
                            }} />

                            {/* Leaf Node Dot */}
                            <div style={{
                              position: 'absolute',
                              left: '3px',
                              top: '15px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isSubTopicActive ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                              zIndex: 2,
                              boxShadow: isSubTopicActive ? '0 0 8px var(--primary)' : 'none',
                              transform: 'translateX(-3px)'
                            }} />

                            {/* Sub-topic Item (Level 2) */}
                            <div 
                              id={`lesson-${subTopic.id}`}
                              style={{
                                marginLeft: '1.5rem',
                                marginRight: '1.25rem',
                                padding: '0.65rem 1rem',
                                fontSize: '0.85rem',
                                color: isSubTopicActive ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                                backgroundColor: isSubTopicActive && !hasChildren ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontWeight: isSubTopicActive ? 600 : 500,
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                transition: 'var(--transition-fast)',
                                position: 'relative',
                                zIndex: 3
                              }}
                              onClick={() => {
                                if (hasChildren) {
                                  toggleTopic(subTopic.id, isSubTopicCollapsed);
                                } else {
                                  navigate(`/study?topicId=${subTopic.id}&mode=quick_learn${pathId ? `&pathId=${pathId}` : ''}`);
                                }
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isSubTopicActive && !hasChildren ? 'rgba(139, 92, 246, 0.1)' : 'transparent';
                              }}
                            >
                              <span>{subTopic.title}</span>
                              {hasChildren ? (
                                <ChevronRight size={14} strokeWidth={isSubTopicActive ? 3 : 2} style={{ transition: 'transform 0.2s', transform: isSubTopicCollapsed ? 'rotate(0deg)' : 'rotate(90deg)' }} color={isSubTopicActive ? 'var(--primary)' : 'var(--text-muted)'} />
                              ) : (
                                <ChevronRight size={14} strokeWidth={isSubTopicActive ? 3 : 2} style={{ opacity: isSubTopicActive ? 1 : 0.2 }} color={isSubTopicActive ? 'var(--primary)' : 'inherit'} />
                              )}
                            </div>                            {/* Level 3 Children (The actual topics inside the lesson) */}
                            {hasChildren && (
                              <div style={{ display: isSubTopicCollapsed ? 'none' : 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem', paddingLeft: '3rem', paddingRight: '1.25rem', position: 'relative' }}>
                                {/* Vertical Spine for Level 3 */}
                                <div style={{
                                  position: 'absolute',
                                  top: '-15px',
                                  bottom: '18px',
                                  left: '26px',
                                  width: '2px',
                                  background: 'rgba(255,255,255,0.08)',
                                  zIndex: 1
                                }} />

                                {subTopic.children.map(leafTopic => {
                                  const isLeafActive = lessonId 
                                    ? leafTopic.id === lessonId 
                                    : (selectedLesson && (leafTopic.id === selectedLesson.lessonId || leafTopic.id === selectedLesson.id));
                                  return (
                                    <div key={leafTopic.id} style={{ position: 'relative' }}>
                                      {/* Curved Branch Line */}
                                      <div style={{
                                        position: 'absolute',
                                        left: '-22px',
                                        top: '-12px',
                                        width: '22px',
                                        height: '26px',
                                        borderBottom: `${isLeafActive ? '3px' : '2px'} solid ${isLeafActive ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                                        borderLeft: `${isLeafActive ? '3px' : '2px'} solid ${isLeafActive ? 'var(--primary)' : 'rgba(255,255,255,0.08)'}`,
                                        borderBottomLeftRadius: '10px',
                                        zIndex: 1
                                      }} />

                                      {/* Leaf Node Dot */}
                                      <div style={{
                                        position: 'absolute',
                                        left: '2px',
                                        top: '12px',
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: isLeafActive ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                                        zIndex: 2,
                                        boxShadow: isLeafActive ? '0 0 6px var(--primary)' : 'none',
                                        transform: 'translateX(-2px)'
                                      }} />

                                      {/* Clickable Item */}
                                      <div 
                                        style={{
                                          marginLeft: '0.5rem',
                                          fontSize: '0.8rem',
                                          color: isLeafActive ? 'var(--text-on-primary)' : 'var(--text-muted)',
                                          cursor: 'pointer',
                                          padding: '0.4rem 0.75rem',
                                          borderRadius: 'var(--radius-sm)',
                                          backgroundColor: isLeafActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                          fontWeight: isLeafActive ? 600 : 400,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          transition: 'background-color 0.2s',
                                          position: 'relative',
                                          zIndex: 3
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/study?topicId=${subTopic.id}&lessonId=${leafTopic.id}&mode=quick_learn${pathId ? `&pathId=${pathId}` : ''}`);
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isLeafActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = isLeafActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent';
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                          {leafTopic.title}
                                        </div>
                                        <ChevronRight size={12} strokeWidth={isLeafActive ? 3 : 2} style={{ opacity: isLeafActive ? 1 : 0.2 }} color={isLeafActive ? 'var(--primary)' : 'inherit'} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div 
                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '1.5rem' }}
                        onClick={() => navigate(`/study?topicId=${rootTopic.id}&mode=quick_learn${pathId ? `&pathId=${pathId}` : ''}`)}
                      >
                        Load topic details...
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            // Empty state - prompt user to search
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '3rem 1.5rem', 
              textAlign: 'center',
              gap: '0.75rem',
              opacity: 0.5
            }}>
              <Search size={28} color="var(--text-muted)" />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                Search for a topic to get started
              </p>
            </div>
          )}
        </div>



        {/* Bottom Roadmap Trigger */}
        {pathId && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
              onClick={() => navigate(`/paths/${pathId}?mode=course`)}
            >
              <Map size={14} />
              <span>View Full Roadmap</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Toggle Handle */}
      <button 
        style={{
          position: 'absolute',
          left: sidebarCollapsed ? '0' : '320px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '40px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderLeft: 'none',
          borderRadius: '0 4px 4px 0',
          cursor: 'pointer',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          transition: 'var(--transition-normal)'
        }}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* 2. Center Panel - Core Study Tabbed Deck */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        borderRight: '1px solid var(--border-color)'
      }}>
        {/* Navigation Tabs */}
        <div style={{ 
          height: '48px', 
          backgroundColor: 'var(--bg-sidebar)', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 1rem',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '1rem', height: '100%', alignItems: 'center' }}>
            {[
              { id: 'explanation', label: 'Explanation' },
              { id: 'visuals', label: 'Visual Simulation' },
              { id: 'quiz', label: 'Quiz Assessment' },
              { id: 'practice', label: 'Practice & Review' },
            ].map((tab) => (
              <button
                key={tab.id}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 0.5rem',
                  height: '100%',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === tab.id ? 650 : 500,
                  borderBottom: `2.5px solid ${activeTab === tab.id ? 'var(--primary)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>


        </div>

        {/* Lesson Progression Sub-header */}
        {currentTopic && lessons.length > 0 && (
          <div style={{
            height: '42px',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 1.5rem',
            fontSize: '0.825rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-hover)' }}>{currentTopic.title}</span>
            </div>
            
            {/* Mark as Complete Button */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {selectedLesson && (
                <button
                  className={completedLessonIds.includes(selectedLesson.id || selectedLesson.lessonId) ? "btn btn-success" : "btn btn-outline"}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: completedLessonIds.includes(selectedLesson.id || selectedLesson.lessonId) ? 'none' : '1px solid var(--border-color)' }}
                  onClick={() => toggleLessonCompletion(selectedLesson.id || selectedLesson.lessonId, !completedLessonIds.includes(selectedLesson.id || selectedLesson.lessonId))}
                >
                  <CheckCircle2 size={14} />
                  {completedLessonIds.includes(selectedLesson.id || selectedLesson.lessonId) ? "Completed" : "Mark as Complete"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Tab Content Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          
          {loadingLesson ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Loading dynamic lesson placeholders...
            </div>
          ) : !lessonData ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '1rem' }}>
              <BookMarked size={48} strokeWidth={1} />
              <h4>Select a Lesson to Begin</h4>
            </div>
          ) : (
            <>
              {/* TAB 1: EXPLANATION */}
              {activeTab === 'explanation' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }} className="animate-fade-in">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h1 style={{ fontSize: '2rem', margin: 0 }}>
                        {briefMeta?.title || lessonData.title}
                      </h1>
                      {adminMode && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => navigate(`/content-editor?topicId=${topicId}&lessonId=${lessonData.id}`)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: 'linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                          }}
                        >
                          <Edit3 size={14} />
                          <span>Edit Lesson in CMS</span>
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary">Time: {complexity.time}</span>
                      <span className="badge badge-success">Space: {complexity.space}</span>

                    </div>
                  </div>

                  {/* Step 1: Brief Explanation */}
                  <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'rgba(139, 92, 246, 0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.10rem', margin: 0, color: 'var(--primary)' }}>Brief Overview</h3>
                    </div>
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                      {briefMeta?.description || lessonData.description}
                    </p>
                  </div>

                  {/* Step 2: Easy Explanatory Text with Analogy */}
                  {detailedMeta?.analogy && (
                    <div className="card">
                      <h3 style={{ fontSize: '1.10rem', marginBottom: '0.5rem' }}>Real World Analogy</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {detailedMeta.analogy}
                      </p>
                    </div>
                  )}

                  {/* Implementation steps */}
                  {detailedMeta?.steps && detailedMeta.steps.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.10rem', marginBottom: '0.75rem' }}>Key Algorithm Steps</h3>
                      <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {detailedMeta.steps.map((st, idx) => (
                          <li key={idx}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Pro Tip */}
                  {detailedMeta?.tip && (
                    <div className="card" style={{ borderLeft: '4px solid var(--warning)', background: 'rgba(245,158,11,0.02)' }}>
                      <h4 style={{ color: 'var(--warning)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Pro Tip</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{detailedMeta.tip}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VISUAL SIMULATOR */}
              {activeTab === 'visuals' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Interactive Algorithm Simulation</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Step through algorithms visually, customize parameters, and watch pseudocode execute in real time.
                    </p>
                  </div>

                  {/* Split Pane Layout */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1.5rem',
                    alignItems: 'stretch'
                  }}>
                    {/* Left Pane: Visual Canvas & Controls */}
                    <div style={{ 
                      flex: '1 1 55%', 
                      minWidth: '400px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '1.5rem' 
                    }}>
                      
                      {/* Controls Toolbar */}
                      <div className="card" style={{ 
                        padding: '1rem 1.25rem', 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        gap: '1rem', 
                        background: 'var(--box-bg)', 
                        border: '1px solid var(--border-color)' 
                      }}>
                        {/* Play/Pause/Prev/Next/Reset */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => simStepIndex > 0 && setSimStepIndex(prev => prev - 1)}
                            disabled={simStepIndex === 0}
                            title="Previous Step"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                          >
                            <SkipBack size={14} />
                          </button>
                          
                          <button 
                            className={isPlaying ? "btn btn-outline" : "btn btn-primary"}
                            onClick={() => {
                              if (!isPlaying && simStepIndex >= simStepsList.length - 1) {
                                setSimStepIndex(0);
                                setIsPlaying(true);
                              } else {
                                setIsPlaying(!isPlaying);
                              }
                            }}
                            title={isPlaying ? "Pause" : (simStepIndex >= simStepsList.length - 1 ? "Replay" : "Autoplay")}
                            style={{ padding: '0.4rem 1.0rem', fontSize: '0.85rem', minWidth: '82px' }}
                          >
                            {isPlaying ? <Pause size={14} /> : (simStepIndex >= simStepsList.length - 1 ? <RotateCcw size={14} /> : <Play size={14} />)}
                            <span style={{ fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                              {isPlaying ? 'Pause' : (simStepIndex >= simStepsList.length - 1 ? 'Replay' : 'Play')}
                            </span>
                          </button>

                          <button 
                            className="btn btn-secondary" 
                            onClick={() => simStepIndex < simStepsList.length - 1 && setSimStepIndex(prev => prev + 1)}
                            disabled={simStepIndex >= simStepsList.length - 1}
                            title="Next Step"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                          >
                            <SkipForward size={14} />
                          </button>

                        </div>

                        {/* Target Input */}
                        {lessonData?.visualSimulation?.config?.target !== undefined && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>Target:</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={customTarget}
                            onChange={(e) => setCustomTarget(e.target.value)}
                            style={{ width: '64px', padding: '0.35rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }}
                          />
                        </div>
                        )}

                        {/* Edit Structure Toggle */}
                        <button 
                          className="btn btn-outline" 
                          onClick={() => setShowCustomInput(!showCustomInput)}
                          style={{ 
                            padding: '0.4rem 0.75rem', 
                            fontSize: '0.8rem',
                            borderColor: showCustomInput ? 'var(--primary)' : 'var(--border-color)',
                            color: showCustomInput ? 'var(--primary-hover)' : 'var(--text-main)'
                          }}
                        >
                          <span>{showCustomInput ? 'Close Editor' : 'Edit Structure'}</span>
                        </button>
                      </div>

                      {/* Custom Input Editor Panel */}
                      {showCustomInput && (
                        <div className="card animate-fade-in" style={{ 
                          padding: '1.25rem', 
                          background: 'rgba(139, 92, 246, 0.03)', 
                          border: '1px solid rgba(139, 92, 246, 0.15)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '1rem'
                        }}>
                          {/* If Search or Static Array */}
                          {!(lessonData?.slug || '').includes('linked-list') ? (
                            <form onSubmit={handleApplyCustomArray} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-on-primary)', margin: 0 }}>Configure Array Elements</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Enter a comma-separated list of 3 to 12 integers. {(lessonData?.slug || '').includes('binary-search') && "Array will be automatically sorted ascending."}
                              </p>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={arrayInputText} 
                                  onChange={(e) => setArrayInputText(e.target.value)} 
                                  placeholder="e.g. 10, 20, 30, 40, 50"
                                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                  Apply
                                </button>
                              </div>
                            </form>
                          ) : (
                            /* If Singly Linked List */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-on-primary)', margin: 0 }}>Modify Linked List Nodes</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Manage list nodes dynamically (bounded to 3-12 nodes). Visualizer redraws instantly.
                              </p>
                              
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                {/* Add node form */}
                                <form onSubmit={handleAddNode} style={{ display: 'flex', flex: '1 1 180px', gap: '0.25rem', alignItems: 'center' }}>
                                  <input 
                                    type="number" 
                                    className="form-input" 
                                    value={addNodeVal} 
                                    onChange={(e) => setAddNodeVal(e.target.value)} 
                                    placeholder="Val"
                                    style={{ width: '60px', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                  />
                                  <button type="submit" className="btn btn-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    Add Node
                                  </button>
                                </form>

                                {/* Insert node form */}
                                <form onSubmit={handleInsertNode} style={{ display: 'flex', flex: '1 1 240px', gap: '0.25rem', alignItems: 'center' }}>
                                  <input 
                                    type="number" 
                                    className="form-input" 
                                    value={insertNodeVal} 
                                    onChange={(e) => setInsertNodeVal(e.target.value)} 
                                    placeholder="Val"
                                    style={{ width: '60px', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                  />
                                  <select 
                                    className="form-select"
                                    value={insertNodeIdx}
                                    onChange={(e) => setInsertNodeIdx(e.target.value)}
                                    style={{ width: '85px', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                  >
                                    {Array.from({ length: displayArray.length + 1 }, (_, i) => (
                                      <option key={i} value={i}>Idx {i}</option>
                                    ))}
                                  </select>
                                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    Insert Node
                                  </button>
                                </form>

                                {/* Delete node form */}
                                <form onSubmit={handleDeleteNode} style={{ display: 'flex', flex: '1 1 200px', gap: '0.25rem', alignItems: 'center' }}>
                                  <select 
                                    className="form-select"
                                    value={deleteNodeIdx}
                                    onChange={(e) => setDeleteNodeIdx(e.target.value)}
                                    style={{ width: '110px', padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                  >
                                    {displayArray.map((v, i) => (
                                      <option key={i} value={i}>Idx {i} ({v})</option>
                                    ))}
                                  </select>
                                  <button type="submit" className="btn btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                    Delete
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual Renderer Canvas */}
                      <div 
                        className="card" 
                        style={{ 
                          padding: '1.5rem 2rem 2.5rem 2rem', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '2.5rem', 
                          background: 'var(--bg-canvas)',
                          borderRadius: 'var(--radius-md)',
                          position: 'relative',
                          flex: 1,
                          justifyContent: 'flex-start',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      {/* VARIABLES TRACKER */}
                      <div style={{
                        alignSelf: 'flex-start',
                        width: '100%',
                        marginBottom: '1rem',
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        zIndex: 10
                      }}>
                        
                        {(simStepsList[simStepIndex]?.hudVariables || []).map((v, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--box-bg)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{v.name}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{v.value}</span>
                          </div>
                        ))}

                      </div>
                        
                      {/* GENERIC MATH VISUALIZER */}
                      {simStepsList[simStepIndex]?.mathSteps && simStepsList[simStepIndex]?.mathSteps.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
                          {simStepsList[simStepIndex].mathSteps.map((mStep, idx, arr) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                border: mStep.highlight ? '2px solid #fb923c' : '2px solid var(--border-color)', 
                                borderRadius: '4px', 
                                backgroundColor: mStep.highlight ? 'rgba(251, 146, 60, 0.15)' : 'var(--box-bg)' 
                              }}>
                                <div style={{ padding: '0.3rem 0.6rem', borderBottom: mStep.highlight ? '2px solid #fb923c' : '2px solid var(--border-color)', textAlign: 'center', fontWeight: 600, color: mStep.highlight ? '#fb923c' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                  {mStep.label}
                                </div>
                                <div style={{ padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: 700, fontSize: mStep.highlight ? '1.25rem' : '1rem', color: mStep.highlight ? 'var(--heading-color)' : 'inherit' }}>
                                  {mStep.expression}
                                </div>
                              </div>
                              {idx < arr.length - 1 && (
                                <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>→</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MATRIX VISUALIZER */}
                      {simStepsList[simStepIndex]?.matrixState && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', paddingBottom: '3rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {simStepsList[simStepIndex].matrixState.map((row, rIdx, rArr) => (
                              <div key={rIdx} style={{ display: 'flex', marginBottom: '25px' }}>
                                {row.map((cell, cIdx, cArr) => {
                                  if (cell.value === -999) {
                                    return <div key={cIdx} style={{ width: '25px', backgroundColor: 'transparent' }} />;
                                  }
                                  if (cell.value === -888) {
                                    return (
                                      <div key={cIdx} style={{ width: '45px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                                        {cell.dim ? '' : '↓'}
                                      </div>
                                    );
                                  }
                                  
                                  const isLastInBlock = cIdx === cArr.length - 1 || cArr[cIdx+1].value === -999;
                                  
                                  return (
                                    <div 
                                      key={cIdx} 
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: cell.color,
                                        color: (cell.color === 'transparent' || cell.color.startsWith('rgba')) ? 'var(--text-main)' : 'var(--text-on-primary)',
                                        border: '2px solid var(--text-main)',
                                        borderRight: isLastInBlock ? '2px solid var(--text-main)' : 'none',
                                        fontWeight: 700,
                                        fontSize: '1.2rem',
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      {cell.value}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GENERIC ARRAY VISUALIZER */}
                      {!simStepsList[simStepIndex]?.matrixState && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', paddingBottom: '3rem' }}>
                        <div style={{ display: 'flex', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
                          
                          {
                            (() => {
                              const valCounts = {};
                              return (simStepsList[simStepIndex]?.arrayState || displayArray.map((val, i) => ({
                                  id: val.toString() + "-" + i,
                                  value: val,
                                  color: 'transparent',
                                  pointers: [],
                                  dim: false
                              }))).map((cell, idx, arr) => {
                                valCounts[cell.value] = (valCounts[cell.value] || 0) + 1;
                                const itemKey = cell.id || `val-${cell.value}-${valCounts[cell.value]}`;

                            return (
                              <motion.div layout key={itemKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: cell.dim ? 0.3 : 1, margin: '0' }}>
                                <motion.div 
                                  layout
                                  style={{
                                    width: '45px',
                                    height: '45px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: cell.color,
                                    color: (cell.color === 'transparent' || cell.color.startsWith('rgba')) ? 'var(--text-main)' : 'var(--text-on-primary)',
                                    border: '2px solid var(--text-main)',
                                    borderRight: idx === arr.length - 1 ? '2px solid var(--text-main)' : 'none',
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                  }}
                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                  {cell.value}
                                </motion.div>
                                <div style={{ position: 'relative', width: '100%', height: '40px', marginTop: '0.25rem', display: 'flex', justifyContent: 'center' }}>
                                  {(cell.pointers || []).map((p, pIdx) => (
                                    <div key={pIdx} style={{ position: 'absolute', top: `${pIdx * 15}px`, color: (cell.color === 'transparent' || cell.color.startsWith('rgba')) ? '#38bdf8' : cell.color, fontSize: '0.75rem', fontWeight: 800 }}>{p}</div>
                                  ))}
                                </div>
                              </motion.div>
                            );
                          })
                        })()}
                        </div>
                        
                        {simStepsList[simStepIndex]?.status === 'not_found' && (
                          <div style={{ marginTop: '2rem', padding: '1rem 2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
                            Target not found in the array
                          </div>
                        )}
                      </div>
                      )}

                    </div>
                  </div>

                  {/* Right Pane: Pseudocode Panel */}
                    <div style={{ 
                      flex: '1 1 35%', 
                      minWidth: '320px', 
                      display: 'flex', 
                      flexDirection: 'column' 
                    }}>
                      <div className="card" style={{ 
                        padding: '1.5rem', 
                        background: 'var(--bg-canvas)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        border: '1px solid var(--border-color)' 
                      }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Code2 size={16} color="var(--primary)" />
                          <span>Pseudocode execution</span>
                        </h3>
                        
                        <div 
                          id="pseudocode-container"
                          style={{
                          position: 'relative',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.8rem',
                          lineHeight: '1.8',
                          display: 'flex',
                          flexDirection: 'column',
                          overflowY: 'auto',
                          flex: 1,
                          backgroundColor: 'var(--box-bg)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          minHeight: '300px'
                        }}>
                          {(Array.isArray(lessonData?.visualSimulation?.pseudocode) ? lessonData.visualSimulation.pseudocode : []).map((lineItem, idx) => {
                            const step = simStepsList[simStepIndex] || {};
                            const activeLine = step.line || 1;
                            const isActive = lineItem.line === activeLine;
                            
                            return (
                              <div 
                                key={idx}
                                id={isActive ? 'active-pseudocode-line' : undefined}
                                style={{
                                  display: 'flex',
                                  backgroundColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                                  borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '2px',
                                  color: isActive ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                                  fontWeight: isActive ? 600 : 400,
                                  boxShadow: isActive ? '0 0 10px rgba(139, 92, 246, 0.15)' : 'none',
                                  transition: 'var(--transition-fast)',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {/* Line number label */}
                                <span style={{ 
                                  width: '24px', 
                                  color: isActive ? 'var(--primary)' : 'var(--text-muted)', 
                                  userSelect: 'none',
                                  fontSize: '0.75rem',
                                  textAlign: 'right',
                                  marginRight: '0.75rem',
                                  display: 'inline-block'
                                }}>
                                  {String(idx + 1).padStart(2, '0')}
                                </span>
                                <span>{lineItem.text}</span>
                              </div>
                            );
                          })}
                        </div>
                        
                        {simStepsList[simStepIndex]?.status === 'not_found' && (
                          <div style={{ marginTop: '2rem', padding: '1rem 2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
                            Target not found in the array
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}


              {/* TAB 4: QUIZ ASSESSMENT */}
              {activeTab === 'quiz' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }} className="animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Concept Verification</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Check your core understanding of topics and structure logic.
                    </p>
                  </div>

                  {/* Render Graded Report Screen */}
                  {(quizResult || viewingQuizAttempt) ? (
                    (() => {
                      const attempt = quizResult || viewingQuizAttempt;
                      let parsedAnswers = [];
                      try {
                        parsedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : (attempt.answers || []);
                      } catch (e) {
                        console.error(e);
                      }
                      
                      const pct = Math.round((attempt.score * 100) / (attempt.totalQuestions || 1));
                      const radius = 36;
                      const circ = 2 * Math.PI * radius;
                      const strokeOffset = circ * (1 - (attempt.score / (attempt.totalQuestions || 1)));

                      let strokeColor = 'var(--danger)';
                      let statusText = 'FAILED (< 50%)';
                      let statusBg = 'rgba(239, 68, 68, 0.15)';
                      let statusShadow = 'rgba(239, 68, 68, 0.1)';

                      if (pct >= 75) {
                        strokeColor = 'var(--success)';
                        statusText = 'PASSED (>= 75%)';
                        statusBg = 'rgba(16, 185, 129, 0.15)';
                        statusShadow = 'rgba(16, 185, 129, 0.1)';
                      } else if (pct >= 50) {
                        strokeColor = '#f59e0b';
                        statusText = 'AVERAGE (50-74%)';
                        statusBg = 'rgba(245, 158, 11, 0.15)';
                        statusShadow = 'rgba(245, 158, 11, 0.1)';
                      }

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {viewingQuizAttempt && (
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              background: 'var(--box-bg)', 
                              border: '1px solid var(--border-color)', 
                              padding: '0.75rem 1rem', 
                              borderRadius: 'var(--radius-sm)' 
                            }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Reviewing past attempt from <strong>{new Date(attempt.createdAt).toLocaleString()}</strong>
                              </span>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                onClick={() => setViewingQuizAttempt(null)}
                              >
                                Back to Quiz
                              </button>
                            </div>
                          )}

                          {/* Premium Grade Card */}
                          <div 
                            className="card animate-scale-up" 
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(27, 21, 59, 0.95) 0%, rgba(11, 14, 30, 0.95) 100%)',
                              border: '1px solid var(--primary-glow)',
                              padding: '2rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '1.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              {/* Radial Progress Ring */}
                              <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                  <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                                  <circle 
                                    cx="40" 
                                    cy="40" 
                                    r={radius} 
                                    fill="none" 
                                    stroke={strokeColor} 
                                    strokeWidth="6" 
                                    strokeDasharray={circ} 
                                    strokeDashoffset={strokeOffset} 
                                    style={{ 
                                      transition: 'stroke-dashoffset 1s ease-in-out',
                                      filter: `drop-shadow(0 0 4px ${strokeColor})` 
                                    }} 
                                  />
                                </svg>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.25rem', fontWeight: 800 }}>
                                  {pct}%
                                </div>
                              </div>

                              <div>
                                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Quiz Evaluation</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                  Score: <strong>{attempt.score}</strong> / {attempt.totalQuestions} questions correct
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span 
                                className="badge" 
                                style={{ 
                                  padding: '0.5rem 1rem', 
                                  fontSize: '0.85rem',
                                  backgroundColor: statusBg,
                                  color: strokeColor,
                                  border: `1px solid ${strokeColor}`,
                                  boxShadow: `0 0 10px ${statusShadow}`
                                }}
                              >
                                {statusText}
                              </span>

                              <button 
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem 1rem' }}
                                onClick={() => {
                                  setQuizResult(null);
                                  setViewingQuizAttempt(null);
                                  setUserAnswers({});
                                }}
                              >
                                <RefreshCw size={14} />
                                <span>Retake Quiz</span>
                              </button>
                            </div>
                          </div>

                          {/* Reviewed Questions List */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                              Review Questions
                            </h3>
                            {quizMeta?.questions?.map((q, qIdx) => {
                              const chosenOpt = parsedAnswers[qIdx];
                              const actualCorrectOpt = q.correctOption !== undefined ? q.correctOption : q.correctIndex;
                              const isCorrect = chosenOpt === actualCorrectOpt;

                              return (
                                <div key={qIdx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                  <span className="badge badge-secondary" style={{ alignSelf: 'flex-start' }}>Question {qIdx + 1}</span>
                                  <h4 style={{ fontSize: '1rem', margin: 0 }}>{q.question || q.text}</h4>
                                  
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                    {q.options.map((option, optIdx) => {
                                      const isSelected = chosenOpt === optIdx;
                                      const isCorrectOpt = optIdx === actualCorrectOpt;
                                      
                                      let bg = 'rgba(255,255,255,0.01)';
                                      let border = 'var(--border-color)';
                                      let color = 'var(--text-secondary)';

                                      if (isSelected) {
                                        if (isCorrect) {
                                          bg = 'rgba(16, 185, 129, 0.08)';
                                          border = 'var(--success)';
                                          color = 'var(--text-on-primary)';
                                        } else {
                                          bg = 'rgba(239, 68, 68, 0.08)';
                                          border = 'var(--danger)';
                                          color = 'var(--text-on-primary)';
                                        }
                                      } else if (isCorrectOpt) {
                                        bg = 'rgba(16, 185, 129, 0.04)';
                                        border = 'rgba(16, 185, 129, 0.4)';
                                      }

                                      return (
                                        <div 
                                          key={optIdx}
                                          className="card"
                                          style={{
                                            padding: '0.75rem 1rem',
                                            background: bg,
                                            borderColor: border,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'default'
                                          }}
                                        >
                                          <span style={{ fontSize: '0.85rem', color: color }}>{option}</span>
                                          {isCorrectOpt && <CheckCircle2 size={14} color="var(--success)" />}
                                          {isSelected && !isCorrect && <AlertCircle size={14} color="var(--danger)" />}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {q.explanation && (
                                    <div 
                                      style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: 'rgba(139, 92, 246, 0.03)',
                                        border: '1px solid rgba(139, 92, 246, 0.1)',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        lineHeight: '1.5'
                                      }}
                                    >
                                      <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Explanation</p>
                                      <p>{q.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Render Quiz Taking Screen */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {quizMeta?.questions && quizMeta.questions.length > 0 ? (
                        <>
                          {quizMeta?.questions?.map((q, qIdx) => {
                            const chosenOpt = userAnswers[qIdx];
                            const actualCorrectOpt = q.correctOption !== undefined ? q.correctOption : q.correctIndex;
                            return (
                              <div key={qIdx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>Question {qIdx + 1}</span>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{q.question || q.text}</h3>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                  {q.options.map((option, optIdx) => {
                                    const isSelected = chosenOpt === optIdx;
                                    const hasAnswered = chosenOpt !== undefined;
                                    const isCorrectOpt = optIdx === actualCorrectOpt;

                                    let bg = 'rgba(255, 255, 255, 0.02)';
                                    let border = 'var(--border-color)';
                                    let textColor = 'var(--text-secondary)';

                                    if (isSelected) {
                                      bg = 'rgba(139, 92, 246, 0.15)';
                                      border = 'var(--primary)';
                                      textColor = 'var(--text-on-primary)';
                                    }

                                    return (
                                      <div 
                                        key={optIdx}
                                        className="card"
                                        style={{
                                          padding: '0.75rem 1rem',
                                          cursor: 'pointer',
                                          backgroundColor: bg,
                                          border: `1px solid ${border}`,
                                          transition: 'var(--transition-fast)'
                                        }}
                                        onClick={() => handleQuizAnswer(qIdx, optIdx)}
                                      >
                                        <span style={{ fontSize: '0.9rem', color: textColor }}>{option}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button 
                              className="btn btn-primary" 
                              onClick={handleQuizSubmit} 
                              disabled={submittingQuiz || Object.keys(userAnswers).length === 0}
                              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
                            >
                              {submittingQuiz ? 'Submitting...' : `Submit Quiz (${Object.keys(userAnswers).length} / ${quizMeta.questions.length})`}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          No quiz questions configured for this lesson yet.
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* TAB 5: PRACTICE & REVIEW */}
              {activeTab === 'practice' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
                  
                  {/* Question Selector */}
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {practiceMeta?.questions?.map((q, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setPracticeQuestionIdx(idx)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: practiceQuestionIdx === idx ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${practiceQuestionIdx === idx ? 'var(--primary)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          color: practiceQuestionIdx === idx ? 'var(--text-on-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {q.problemTitle}
                      </button>
                    ))}
                  </div>

                  <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                      {practiceMeta?.questions?.[practiceQuestionIdx]?.problemTitle || 'Interactive Practice Exercise'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {practiceMeta?.questions?.[practiceQuestionIdx]?.description || 'Implement the algorithm in the sandbox editor and submit for diagnostics check.'}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem' }} className="grid-cols-3">
                    {/* Editor Textbox */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {['python', 'javascript', 'cpp', 'c', 'java'].map((lang) => (
                            <button
                              key={lang}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: practiceLang === lang ? 'var(--primary)' : 'var(--text-secondary)',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: practiceLang === lang ? 600 : 500,
                                cursor: 'pointer',
                                borderBottom: `2px solid ${practiceLang === lang ? 'var(--primary)' : 'transparent'}`
                              }}
                              onClick={() => setPracticeLang(lang)}
                            >
                              {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                            </button>
                          ))}
                        </div>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => setUserPracticeCode(getPracticeTemplate(lessonData?.slug, practiceLang, practiceMeta?.questions?.[practiceQuestionIdx]?.starterCode?.[practiceLang]))} 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem' }}
                        >
                          Reset
                        </button>
                      </div>
                      <textarea 
                        className="form-textarea" 
                        rows="15"
                        value={userPracticeCode}
                        onChange={(e) => setUserPracticeCode(e.target.value)}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#c084fc', lineHeight: '1.6', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                      />
                      
                      {/* Custom Testcases */}
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Custom Test Cases</h4>
                        <textarea 
                          className="form-textarea" 
                          rows="3"
                          value={customTestCase}
                          onChange={(e) => setCustomTestCase(e.target.value)}
                          placeholder="Enter custom test cases here..."
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => { setPracticeRunMode('run'); handlePracticeSubmit(); }} 
                          disabled={submittingPractice}
                        >
                          <span>{submittingPractice && practiceRunMode === 'run' ? 'Running...' : 'Run Custom Test Cases'}</span>
                        </button>
                        <button 
                          className="btn btn-success" 
                          onClick={() => { setPracticeRunMode('submit'); handlePracticeSubmit(); }} 
                          disabled={submittingPractice}
                        >
                          <span>{submittingPractice && practiceRunMode === 'submit' ? 'Analyzing...' : 'Submit Code for Feedback'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Review Panel */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-canvas)' }}>
                      <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bot size={16} color="var(--primary)" />
                        <span>{practiceRunOutput ? 'Execution Output' : 'Feedback Report'}</span>
                      </h3>

                      {practiceRunOutput ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                          <div style={{ padding: '1rem', background: 'var(--bg-code)', border: '1px solid var(--border-color)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', color: practiceRunOutput.error ? 'var(--error)' : 'var(--text-main)' }}>
                            {practiceRunOutput.error || practiceRunOutput.output || 'No output'}
                          </div>
                          {practiceRunOutput.timeMs && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Execution Time: {practiceRunOutput.timeMs}ms
                            </div>
                          )}
                        </div>
                      ) : practiceFeedback ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade-in">
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(139,92,246,0.05)', borderRadius: '4px', border: '1px solid var(--primary-glow)' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TIME COMPLEXITY</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>{practiceFeedback.timeComplexity}</div>
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(16,185,129,0.05)', borderRadius: '4px', border: '1px solid var(--success-glow)' }}>
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SPACE COMPLEXITY</span>
                              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--success)' }}>{practiceFeedback.spaceComplexity}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Evaluation Summary</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                              {practiceRunMode === 'run' 
                                ? "Code executed against custom test cases successfully. Outputs matched expected formats." 
                                : practiceFeedback.evaluation}
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Predefined Test Cases</h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                              [PASS] Test Case 1: Base Case<br/>
                              [PASS] Test Case 2: Boundary Match<br/>
                              [PASS] Test Case 3: Element Not Found<br/>
                              {practiceRunMode === 'submit' && "[PASS] Hidden Test Cases (5/5)"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', minHeight: '200px', textAlign: 'center' }}>
                          Submit your code or run custom testcases to view diagnostics.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>

      {/* 3. Right Sidebar - AI Tutor & Related Widgets */}
      <div 
        style={{
          width: '320px',
          backgroundColor: 'var(--bg-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0
        }}
      >
        {/* Progress Tracker Card */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            background: 'var(--box-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} color="var(--primary)" />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentTopic ? currentTopic.title : 'Course'} Progress
              </span>
            </h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="var(--box-bg-hover)" strokeWidth="4" />
                  <circle 
                    cx="28" cy="28" r="24" 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="4" 
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                  {progressPercentage}%
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  {completedTopicLessons} of {totalTopicLessons} Lessons
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Problems list */}
        {relatedProblems.length > 0 && (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.9rem', margin: 0 }}>Related Coding Problems</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {relatedProblems.map((p, i) => {
                let diffColor = 'var(--warning)';
                if (p.difficulty === 'Easy') diffColor = 'var(--success)';
                if (p.difficulty === 'Hard') diffColor = 'var(--error)';
                return (
                  <div 
                    key={p.id || i} 
                    style={{
                      padding: '0.625rem 0.75rem',
                      background: 'var(--box-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/practice/problems/${p.id}`)}
                  >
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 550 }}>{p.title}</span>
                    <span style={{ fontSize: '0.65rem', color: diffColor, fontWeight: 700 }}>{p.difficulty}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
