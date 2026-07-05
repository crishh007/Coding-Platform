import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';

import ResumeDashboard from './ResumeDashboard';
import ResumeCreate from './ResumeCreate';
import ResumeEditor from './ResumeEditor';
import ResumePreview from './ResumePreview';

const ResumeBuilder = () => (
  <Routes>
    <Route path="/" element={<ResumeDashboard />} />
    <Route path="/create" element={<ResumeCreate />} />
    <Route path="/:id/edit" element={<ResumeEditor />} />
    <Route path="/:id/preview" element={<ResumePreview />} />
  </Routes>
);

export default ResumeBuilder;
