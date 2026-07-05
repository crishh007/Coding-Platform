import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserEntry from './pages/UserEntry';
import PathsPage from './pages/PathsPage';
import StudyPage from './pages/StudyPage';
import ComingSoon from './pages/ComingSoon';
import AdminDashboard from './pages/AdminDashboard';
import CourseSelection from './pages/CourseSelection';
import CareerSelection from './pages/CareerSelection';
import CareerPathsPage from './pages/CareerPathsPage';

// module_i imports
import HRInterview from './pages/hr/HRInterview';
import ResumeBuilder from './pages/resume/ResumeBuilder';
import { Aptitude } from './pages/Aptitude';
import { SystemDesign } from './pages/SystemDesign';
import MockInterview from './pages/MockInterview';
import CodingInterview from './pages/CodingInterview';
import InterviewsDashboard from './pages/InterviewsDashboard';
import FoundationalLayout from './components/layout/FoundationalLayout';
import FoundationalContent from './pages/FoundationalContent';

import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/modes" element={<UserEntry />} />
          <Route path="/paths/:id" element={<PathsPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/courses" element={<CourseSelection />} />
          <Route path="/careers" element={<CareerSelection />} />
          <Route path="/careers/:id" element={<CareerPathsPage />} />
          
          {/* module_i integrated routes */}
          <Route path="/interviews" element={<InterviewsDashboard />} />
          <Route path="/interview/*" element={<HRInterview />} />
          <Route path="/resume/*" element={<ResumeBuilder />} />
          <Route path="/mock-interview/*" element={<MockInterview />} />
          <Route path="/coding-interview/*" element={<CodingInterview />} />
          <Route path="/aptitude/*" element={<Aptitude />} />
          <Route path="/system-design/*" element={<SystemDesign />} />
          
          <Route path="/interviews/foundational" element={<FoundationalLayout />}>
            <Route path=":feature/:topic" element={<FoundationalContent />} />
            <Route path=":feature" element={<FoundationalContent />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
