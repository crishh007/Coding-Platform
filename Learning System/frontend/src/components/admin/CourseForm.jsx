import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../api/client';

const CourseForm = ({ onAdded }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/admin/courses`, { title });
      setTitle('');
      onAdded();
      alert('Course added successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to add course');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>Add New Course</h2>
      <div style={formGroup}>
        <label>Course Title</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
          style={inputStyle}
        />
      </div>
      <button type="submit" style={btnStyle}>Save Course</button>
    </form>
  );
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
const formGroup = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };
const inputStyle = { padding: '0.5rem', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' };
const btnStyle = { padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: 'fit-content' };

export default CourseForm;
