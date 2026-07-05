import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
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
