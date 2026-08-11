import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProblemWorkspace from './pages/ProblemWorkspace';
import './index.css';

function App() {
  return (
    <Router>
      <div className="practice-app">
        <nav className="navbar">
          <div className="nav-brand">
            <span className="logo-icon">{"</>"}</span>
            <span className="logo-text">LeetCode Replica</span>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Explore</Link>
            <Link to="/" className="nav-link active">Problems</Link>
            <Link to="/" className="nav-link">Discuss</Link>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/problems/:id" element={<ProblemWorkspace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
