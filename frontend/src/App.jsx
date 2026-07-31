import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UserEntry from './pages/UserEntry';
import ContestsDashboard from './pages/contests/ContestsDashboard';
import ContestDetails from './pages/contests/ContestDetails';
import ContestArena from './pages/contests/ContestArena';
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

// Practice Module
import PracticeDashboard from './pages/practice/Dashboard';
import ProblemWorkspace from './pages/practice/ProblemWorkspace';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/modes" element={<UserEntry />} />

              {/* Learning Feature Routes (Unprotected) */}
              <Route path="/study" element={<StudyPage />} />
              <Route path="/courses" element={<CourseSelection />} />
              <Route path="/careers" element={<CareerSelection />} />
              <Route path="/careers/:id" element={<CareerPathsPage />} />
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/paths/:id" element={<PathsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                
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
                
                {/* Practice Module Routes */}
                <Route path="/practice" element={<PracticeDashboard />} />
                <Route path="/practice/problems/:id" element={<ProblemWorkspace />} />

                <Route path="/contests" element={<ContestsDashboard />} />
                <Route path="/contests/:id" element={<ContestDetails />} />
                <Route path="/contests/:id/arena" element={<ContestArena />} />
              </Route>
            </Routes>
          </Layout>
        </Router>
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
