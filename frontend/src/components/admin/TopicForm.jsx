import React, { useState } from 'react';
import axios from 'axios';

const TopicForm = ({ courses, onAdded }) => {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) return alert('Please select a course');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/admin/topics`, { courseId, title });
      setTitle('');
      onAdded();
      alert('Topic added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add topic');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>Add New Topic</h2>
      <div style={formGroup}>
        <label>Select Course</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required style={inputStyle}>
          <option value="">-- Select a Course --</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div style={formGroup}>
        <label>Topic Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={inputStyle}
        />
      </div>
      <button type="submit" style={btnStyle}>Save Topic</button>
    </form>
  );
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const inputStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' };
const btnStyle = { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' };

export default TopicForm;
