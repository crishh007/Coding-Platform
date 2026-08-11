import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    // In development, the Go backend runs on 8081
    axios.get('http://localhost:8081/api/v1/problems')
      .then(res => setProblems(res.data))
      .catch(err => console.error("Failed to load problems:", err));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Practice Problems</h1>
        <div className="filters">
          <select className="filter-select">
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select className="filter-select">
            <option value="all">Status</option>
            <option value="todo">Todo</option>
            <option value="solved">Solved</option>
          </select>
        </div>
      </div>

      <table className="problems-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Title</th>
            <th>Acceptance</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map(p => (
            <tr key={p.id}>
              <td style={{ color: 'var(--text-secondary)' }}>-</td>
              <td>
                <Link to={`/problems/${p.id}`} className="problem-link">
                  {p.id}. {p.title}
                </Link>
              </td>
              <td>{p.acceptance}</td>
              <td className={`difficulty ${p.difficulty.toLowerCase()}`}>
                {p.difficulty}
              </td>
            </tr>
          ))}
          {problems.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                Loading problems...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
