import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseForm from '../components/admin/CourseForm';
import TopicForm from '../components/admin/TopicForm';
import LessonForm from '../components/admin/LessonForm';
import PracticeProblemForm from '../components/admin/PracticeProblemForm';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('course');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/topics/tree`);
      setCourses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  return (
    <div className="admin-dashboard" style={{ padding: '2rem', color: 'white' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('course')} style={tabStyle(activeTab === 'course')}>Add Course</button>
        <button onClick={() => setActiveTab('topic')} style={tabStyle(activeTab === 'topic')}>Add Topic</button>
        <button onClick={() => setActiveTab('lesson')} style={tabStyle(activeTab === 'lesson')}>Add Lesson</button>
        <button onClick={() => setActiveTab('practice')} style={tabStyle(activeTab === 'practice')}>Add Practice Problem</button>
      </div>

      <div className="form-container" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px' }}>
        {activeTab === 'course' && <CourseForm onAdded={fetchCourses} />}
        {activeTab === 'topic' && <TopicForm courses={courses} onAdded={fetchCourses} />}
        {activeTab === 'lesson' && <LessonForm courses={courses} onAdded={fetchCourses} />}
        {activeTab === 'practice' && <PracticeProblemForm />}
      </div>
    </div>
  );
};

const tabStyle = (isActive) => ({
  marginRight: '1rem',
  padding: '0.5rem 1rem',
  background: isActive ? '#3b82f6' : '#333',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
});

export default AdminDashboard;
