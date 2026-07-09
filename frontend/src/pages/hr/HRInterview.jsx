import React from 'react';
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
