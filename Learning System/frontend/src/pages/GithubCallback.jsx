import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function GithubCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithGithubCode } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('No authorization code provided');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const exchangeCode = async () => {
      const res = await loginWithGithubCode(code);
      if (res.success) {
        navigate('/practice');
      } else {
        setError(res.error || 'Failed to authenticate with GitHub');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    exchangeCode();
  }, [searchParams, loginWithGithubCode, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main, #0b0f1e)', color: 'var(--text-main, #fff)' }}>
      {error ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Authentication Error</h2>
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #9ca3af)' }}>Redirecting back to login...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Loader2 size={48} className="animate-spin" color="var(--primary, #8b5cf6)" />
          <h2>Authenticating with GitHub...</h2>
          <p style={{ color: 'var(--text-secondary, #9ca3af)' }}>Please wait while we securely log you in.</p>
        </div>
      )}
    </div>
  );
}
