import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const apiBase = `${API_BASE_URL}/auth`;

  useEffect(() => {
    // If we have a token, we could optionally fetch user details here
    // For now, we rely on the token existing and user data being set during login
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${apiBase}/login`, { email, password });
      setToken(res.data.access_token);
      setUser(res.data.user);
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(`${apiBase}/register`, { username, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const triggerMockOAuth = (provider) => {
    return new Promise((resolve, reject) => {
      const width = 450;
      const height = 550;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open('', `${provider}-oauth`, `width=${width},height=${height},left=${left},top=${top}`);
      
      if (!popup) {
        reject(new Error("Popup blocked"));
        return;
      }
      
      const html = `
        <html>
            <head><title>Sign in to GitHub</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f6f8fa;">
                <div style="background: white; border: 1px solid #d0d7de; border-radius: 6px; padding: 30px; text-align: center; width: 100%; max-width: 320px; box-sizing: border-box; box-shadow: 0 3px 6px rgba(140,149,159,0.15);">
                    <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" style="margin-bottom: 24px;"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>
                    <h2 style="margin: 0 0 24px 0; font-weight: 300; font-size: 24px;">Sign in to GitHub</h2>
                    
                    <button onclick="window.opener.postMessage({type: 'MOCK_OAUTH_SUCCESS', provider: 'github', email: 'dev@github.com', name: 'GitHub Developer'}, '*'); window.close();" style="width: 100%; padding: 12px; background: #2da44e; color: white; border: 1px solid rgba(27,31,36,0.15); border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='#2c974b'" onmouseout="this.style.background='#2da44e'">
                        Authorize SkillSync
                    </button>
                </div>
            </body>
        </html>
      `;
      
      popup.document.write(html);
      
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'MOCK_OAUTH_SUCCESS' && event.data.provider === provider) {
          window.removeEventListener('message', handleMessage);
          resolve(event.data);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      const checkInterval = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkInterval);
          window.removeEventListener('message', handleMessage);
          reject(new Error("Popup closed by user"));
        }
      }, 1000);
    });
  };

  const loginWithGoogleData = (userInfo) => {
    try {
      const mockUser = { username: userInfo.name, email: userInfo.email, role: "student", picture: userInfo.picture };
      setToken("mock_google_token_real");
      setUser(mockUser);
      localStorage.setItem('access_token', "mock_google_token_real");
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Google Login failed' };
    }
  };

  const loginWithGithubCode = async (code) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/github`, { code });
      const { access_token, user } = res.data;
      
      setToken(access_token);
      setUser(user);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'GitHub Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, loginWithGoogleData, loginWithGithubCode }}>
      {children}
    </AuthContext.Provider>
  );
};

