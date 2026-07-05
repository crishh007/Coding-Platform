import React from 'react';

const ScoreRing = ({ score, label, max = 10, size = 64, strokeWidth = 5, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / max) * circumference;

  const getColor = (s) => {
    if (color) return color;
    if (s >= 8) return 'var(--success)';
    if (s >= 5) return 'var(--warning)';
    return 'var(--error)';
  };

  const ringColor = getColor(score);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: size * 0.28, color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          {score}
        </div>
      </div>
      {label && (
        <span style={{
          fontSize: '0.68rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-tertiary)'
        }}>{label}</span>
      )}
    </div>
  );
};

export default ScoreRing;
