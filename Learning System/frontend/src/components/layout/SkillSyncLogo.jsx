import React from 'react';

export default function SkillSyncLogo({ size = 'md', showText = true, animated = false, className = '' }) {
  const sizes = {
    sm: { icon: 28, font: '1.05rem', gap: '0.6rem' },
    md: { icon: 34, font: '1.25rem', gap: '0.75rem' },
    lg: { icon: 46, font: '1.75rem', gap: '1rem' },
    xl: { icon: 60, font: '2.25rem', gap: '1.25rem' }
  };

  const { icon: iconSize, font: fontSize, gap } = sizes[size] || sizes.md;

  return (
    <div 
      className={`skillsync-brand-logo ${className}`}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: gap, 
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Dynamic Geometric Gradient Icon */}
      <div 
        style={{ 
          width: `${iconSize}px`, 
          height: `${iconSize}px`, 
          borderRadius: `${Math.round(iconSize * 0.28)}px`,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(56, 189, 248, 0.25) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(139, 92, 246, 0.35)',
          position: 'relative',
          flexShrink: 0,
          backdropFilter: 'blur(8px)'
        }}
      >
        <svg 
          width={Math.round(iconSize * 0.65)} 
          height={Math.round(iconSize * 0.65)} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ss-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="ss-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          {/* Sync Node S-Wave Left Arc */}
          <path 
            d="M7 16a5 5 0 0 1-.02-7.07l2.14-2.14A5 5 0 0 1 16.2 6.7" 
            stroke="url(#ss-grad-1)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Sync Node S-Wave Right Arc */}
          <path 
            d="M17 8a5 5 0 0 1 .02 7.07l-2.14 2.14A5 5 0 0 1 7.8 17.3" 
            stroke="url(#ss-grad-2)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Upper Sync Arrowhead */}
          <polyline 
            points="17 4 17 8 13 8" 
            stroke="url(#ss-grad-1)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Lower Sync Arrowhead */}
          <polyline 
            points="7 20 7 16 11 16" 
            stroke="url(#ss-grad-2)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Center Glowing Sparkle Dot */}
          <circle cx="12" cy="12" r="1.75" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              fontSize: fontSize, 
              fontWeight: 800, 
              color: '#ffffff', 
              letterSpacing: '-0.02em',
              fontFamily: "'Inter', sans-serif"
            }}>
              Skill
            </span>
            <span style={{ 
              fontSize: fontSize, 
              fontWeight: 800, 
              background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              fontFamily: "'Inter', sans-serif"
            }}>
              Sync
            </span>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#38bdf8',
              marginLeft: '3px',
              marginBottom: '2px',
              boxShadow: '0 0 8px #38bdf8'
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
