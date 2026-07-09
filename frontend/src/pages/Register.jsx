import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, Quote, Target, BarChart2, Zap, Trophy, User } from 'lucide-react';
import './auth.css';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const res = await register(username, email, password);
    if (res.success) {
      navigate('/login'); 
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Left Panel */}
      <div className="auth-hero-section">
        <div className="auth-hero-content">
          <div className="auth-badge">
            <Sparkles size={16} fill="currentColor" />
            <span>CodeMastery Learning</span>
          </div>
          
          <h1>Your Personalized<br/>Path to <span className="highlight-blue">Success</span></h1>
          <p>
            Experience an adaptive roadmap that evolves with your learning speed, identifying gaps before they become obstacles.
          </p>
          
          <div className="auth-testimonial-card">
            <Quote size={32} className="auth-testimonial-quote-icon" fill="currentColor" />
            <div className="auth-testimonial-text-content">
              <div className="auth-testimonial-text">
                "CodeMastery's adaptive path helped me land my dream job in tech within 6 months!"
              </div>
              <div className="auth-testimonial-author">
                — Sarah J., Software Engineer
              </div>
            </div>
            <img src="https://i.pravatar.cc/150?img=47" alt="User" className="auth-testimonial-avatar" />
          </div>

          <div className="auth-features-row">
            <div className="auth-feature">
              <div className="auth-feature-icon"><Target size={24} /></div>
              <span>Personalized<br/>Roadmaps</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><BarChart2 size={24} /></div>
              <span>Track<br/>Progress</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><Zap size={24} fill="currentColor" /></div>
              <span>Smart<br/>Recommendations</span>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon"><Trophy size={24} /></div>
              <span>Achieve Your<br/>Goals</span>
            </div>
          </div>
        </div>
        
        <div className="auth-illustration-container">
          <img 
            src="/assets/images/auth_illustration.jpg" 
            alt="Workspace" 
            className="auth-illustration" 
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-form-section">
        <div className="auth-form-card">
          <div className="auth-lock-icon-wrapper">
            <div className="auth-lock-icon">
              <Lock size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <h2>Create account</h2>
          <p>Join 50,000+ learners unlocking their potential today.</p>
          
          {error && <div className="auth-error-banner-clean">{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-form-group">
              <div className="auth-label-row">
                <label>Name</label>
              </div>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  className="auth-input-clean" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label>Email</label>
              </div>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon"><Mail size={18} /></div>
                <input 
                  type="email" 
                  className="auth-input-clean" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="auth-form-group">
              <div className="auth-label-row">
                <label>Password</label>
              </div>
              <div className="auth-input-wrapper">
                <div className="auth-input-icon"><Lock size={18} /></div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="auth-input-clean" 
                  required 
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
                <div className="auth-input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            <div className="auth-checkbox-group">
              <input type="checkbox" required id="terms" />
              <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</span>
            </div>

            <button type="submit" className="auth-submit-btn-clean" disabled={loading}>
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-divider-clean">or sign up with</div>

          <div className="auth-social-buttons">
            <button type="button" className="auth-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" className="auth-social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          <div className="auth-footer-clean">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
