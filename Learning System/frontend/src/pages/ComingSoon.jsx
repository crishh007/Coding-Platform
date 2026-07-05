import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Sparkles, 
  ArrowLeft
} from 'lucide-react';

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - var(--navbar-height) - 4rem)',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background neon glows */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '15%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Main Glassmorphic Panel */}
      <div 
        className="card" 
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          background: 'rgba(11, 14, 30, 0.55)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.15)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        {/* Animated Icon Ring */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.15)',
            filter: 'blur(10px)',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(139, 92, 246, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-hover)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
            zIndex: 1
          }}>
            <Lock size={28} />
          </div>
        </div>

        {/* Text Headers */}
        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0, color: '#fff' }}>
            Coming Soon
          </h2>
        </div>

        {/* Interactive Buttons */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/modes')}
            className="btn btn-secondary"
            style={{
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={16} />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
