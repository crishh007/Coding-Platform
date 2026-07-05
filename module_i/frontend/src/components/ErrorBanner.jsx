import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="animate-fade-in" style={{
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04))',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: 'var(--error)',
      padding: '14px 18px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '20px',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(239, 68, 68, 0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <AlertCircle size={18} />
      </div>
      <span style={{ flex: 1, fontSize: '0.88rem', lineHeight: 1.5, fontWeight: 500 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'inherit',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
