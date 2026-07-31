import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { AuthContext } from './AuthContext';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const [progress, setProgress] = useState({
    completedLessonIds: [],
    details: []
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    if (!token || !user) return;
    try {
      const data = await client.get('/progress/status');
      setProgress(data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchProgress();
      // Optional polling every 30 seconds
      const interval = setInterval(fetchProgress, 30000);
      return () => clearInterval(interval);
    } else {
      setProgress({ completedLessonIds: [], details: [] });
      setLoading(false);
    }
  }, [token, user]);

  const toggleLessonCompletion = async (lessonId, isCompleted) => {
    const endpoint = isCompleted ? `/lessons/${lessonId}/complete` : `/lessons/${lessonId}/incomplete`;
    try {
      await client.post(endpoint);
      await fetchProgress(); // Refresh immediately
    } catch (err) {
      console.error('Failed to toggle lesson completion:', err);
    }
  };

  return (
    <ProgressContext.Provider value={{ progress, loading, fetchProgress, toggleLessonCompletion }}>
      {children}
    </ProgressContext.Provider>
  );
};
