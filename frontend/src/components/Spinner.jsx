import React from 'react';

const Spinner = ({ size = 40, color = 'var(--accent-primary)', style = {} }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...style
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: `3px solid var(--bg-tertiary)`,
        borderTopColor: color,
        animation: 'spinner-rotate 0.7s linear infinite',
        boxShadow: `0 0 0 1px transparent`
      }} />
      <style>{`
        @keyframes spinner-rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Spinner;
