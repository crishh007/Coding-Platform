import os
import re

source_file = "src/pages/HRInterview.jsx"
output_dir = "src/pages/hr"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(source_file, "r", encoding="utf-8") as f:
    content = f.read()

# Common imports to add
common_imports = """import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, PlayCircle, BarChart2, Star, Mic, UploadCloud, Users,
  ArrowRight, CheckCircle2, FileText, ChevronLeft, RotateCcw,
  TrendingUp, Award, Clock, Zap, AlertCircle, X, ChevronRight,
  Sparkles, Target, MessageSquare, Brain
} from 'lucide-react';
import axios from 'axios';
import ErrorBanner from '../../components/ErrorBanner';
import Spinner from '../../components/Spinner';
import ScoreRing from '../../components/ScoreRing';

const API = 'http://127.0.0.1:8080/api/interview';

// Local copy for Quick Practice
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

"""

# Split the content by the comment banners
dashboard_match = re.search(r'/\* ════+.*DASHBOARD.*════+ \*/(.*)/\* ════+.*QUESTION REPOSITORY.*════+ \*/', content, re.DOTALL)
questions_match = re.search(r'/\* ════+.*QUESTION REPOSITORY.*════+ \*/(.*)/\* ════+.*PRACTICE SESSION.*════+ \*/', content, re.DOTALL)
practice_match = re.search(r'/\* ════+.*PRACTICE SESSION.*════+ \*/(.*)/\* ════+.*PERFORMANCE.*════+ \*/', content, re.DOTALL)
performance_match = re.search(r'/\* ════+.*PERFORMANCE.*════+ \*/(.*)/\* ════+.*ROUTER.*════+ \*/', content, re.DOTALL)
router_match = re.search(r'/\* ════+.*ROUTER.*════+ \*/(.*)export default HRInterview;', content, re.DOTALL)

with open(os.path.join(output_dir, "InterviewDashboard.jsx"), "w", encoding="utf-8") as f:
    f.write(common_imports + dashboard_match.group(1).strip() + "\n\nexport default InterviewDashboard;\n")

with open(os.path.join(output_dir, "QuestionRepository.jsx"), "w", encoding="utf-8") as f:
    f.write(common_imports + questions_match.group(1).strip() + "\n\nexport default QuestionRepository;\n")

with open(os.path.join(output_dir, "PracticeSession.jsx"), "w", encoding="utf-8") as f:
    f.write(common_imports + practice_match.group(1).strip() + "\n\nexport default PracticeSession;\n")

# For Performance, we will inject the fetching logic later, but for now just extract it
with open(os.path.join(output_dir, "Performance.jsx"), "w", encoding="utf-8") as f:
    f.write(common_imports + performance_match.group(1).strip() + "\n\nexport default Performance;\n")

# Recreate the router file
router_content = """import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InterviewDashboard from './InterviewDashboard';
import QuestionRepository from './QuestionRepository';
import PracticeSession from './PracticeSession';
import Performance from './Performance';

const HRInterview = () => (
  <Routes>
    <Route path="/" element={<InterviewDashboard />} />
    <Route path="/questions" element={<QuestionRepository />} />
    <Route path="/practice" element={<PracticeSession />} />
    <Route path="/performance" element={<Performance />} />
  </Routes>
);

export default HRInterview;
"""

with open(os.path.join(output_dir, "HRInterview.jsx"), "w", encoding="utf-8") as f:
    f.write(router_content)

print("HRInterview split successfully.")
