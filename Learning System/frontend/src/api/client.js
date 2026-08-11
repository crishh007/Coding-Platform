import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_BASE_URL = `${baseUrl}/api/v1`;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for easy error logging
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default client;
