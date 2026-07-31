import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { 
  Home as HomeIcon,
  Compass, 
  Code2,
  Trophy,
  Briefcase,
  Sparkles,
  Layers,
  Users,

  Terminal,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Target
} from 'lucide-react';
import client from '../../api/client';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [serverOnline, setServerOnline] = useState(false);

  // Admin/Developer Mode and Toggle visibility states
  const [adminMode, setAdminMode] = useState(() => localStorage.getItem('codemastery_admin_mode') === 'true');
  const [toggleUnlocked, setToggleUnlocked] = useState(() => localStorage.getItem('codemastery_toggle_unlocked') === 'true');
  
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState('');
  
  // Profile dropdown state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    client.get('/modes')
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false));
  }, []);

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(`Switched Theme`);
  };

  // Hidden developer keyboard shortcut to unlock (Ctrl + Alt + A)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        unlockToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unlockToggle = () => {
    setToggleUnlocked(true);
    localStorage.setItem('codemastery_toggle_unlocked', 'true');
    showToast('🔓 Developer settings unlocked! Toggle View in header.');
  };

  const lockToggle = () => {
    setToggleUnlocked(false);
    localStorage.setItem('codemastery_toggle_unlocked', 'false');
    // Lock also resets back to Student Mode
    setAdminMode(false);
    localStorage.setItem('codemastery_admin_mode', 'false');
    window.dispatchEvent(new Event('admin-mode-change'));
    showToast('🔒 Developer configurations locked.');
  };

  const handleToggleAdminMode = (e) => {
    const newMode = e.target.checked;
    setAdminMode(newMode);
    localStorage.setItem('codemastery_admin_mode', newMode.toString());
    window.dispatchEvent(new Event('admin-mode-change'));
    showToast(newMode ? '🔓 Switched to Developer View' : '🎓 Switched to Student View');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: HomeIcon },
    { 
      label: 'Learning', 
      icon: Compass, 
      subItems: [
        { label: 'Quick Learn', path: '/study?mode=quick_learn', icon: Compass },
        { label: 'Courses', path: '/courses', icon: BookOpen },
        { label: 'Career Path', path: '/careers', icon: GraduationCap }
      ]
    },
    { label: 'Practice', path: '/practice', icon: Code2 },
    { label: 'Contests & Ranks', path: '/contests', icon: Trophy },
    { 
      label: 'Interview Prep', 
      icon: Briefcase,
      subItems: [
        { label: 'Foundational', path: '/interviews?mode=foundational', icon: BookOpen },
        { label: 'Specialized', path: '/interviews?mode=specialized', icon: Layers },
        { label: 'Simulations', path: '/interviews?mode=simulations', icon: Target }
      ]
    }
  ];

  const [hoveredNav, setHoveredNav] = useState(null);

  const getInitials = (username) => {
    if (!username) return 'U';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="app-container">
      {/* Main Content Layout */}
      <main className="main-content">
        <header className="navbar" style={{ padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {/* Left Side: Brand Logo */}
          <div 
            onDoubleClick={unlockToggle}
            title="Double-click to unlock developer panel"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              width: '32px', 
              height: '32px', 
              borderRadius: 'var(--radius-sm)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
            }}>
              <Terminal size={18} color="#fff" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px' }}>CodeMastery</h4>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '0.25rem', zIndex: 10 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = !!item.subItems;
              
              // Determine if active
              let isActive = false;
              if (item.path === '/') {
                isActive = location.pathname === '/';
              } else if (hasSubItems) {
                // If it's a dropdown, it's active if the current path matches any subitem path
                isActive = item.subItems.some(sub => {
                  const [base, query] = sub.path.split('?');
                  return location.pathname.startsWith(base) && (!query || location.search.includes(query));
                });
              } else if (!item.external && item.path) {
                isActive = location.pathname.startsWith(item.path);
              }

              const linkStyle = {
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.75rem',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-glow)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                transition: 'var(--transition-fast)',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                position: 'relative',
                cursor: 'pointer'
              };

              let displayLabel = item.label;
              if (hasSubItems && isActive) {
                const activeSub = item.subItems.find(sub => {
                  const [base, query] = sub.path.split('?');
                  return location.pathname.startsWith(base) && (!query || location.search.includes(query));
                });
                if (activeSub) {
                  displayLabel = activeSub.label;
                }
              }

              // Render Dropdown for items with subItems
              if (hasSubItems) {
                return (
                  <div 
                    key={item.label}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setHoveredNav(item.label)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <div style={linkStyle}>
                      <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
                      <span style={{ fontSize: '0.85rem' }}>{displayLabel}</span>
                      <ChevronDown 
                        size={14} 
                        style={{ 
                          marginLeft: '2px', 
                          transition: 'transform 0.2s',
                          transform: hoveredNav === item.label ? 'rotate(180deg)' : 'none'
                        }} 
                      />
                    </div>
                    
                    {hoveredNav === item.label && (
                      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', paddingTop: '0.5rem', zIndex: 100 }}>
                        <div 
                          style={{
                            background: 'var(--bg-card)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-md)',
                            padding: '0.5rem',
                            minWidth: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            animation: 'fadeIn 0.2s ease-out forwards'
                          }}
                        >
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const [base, query] = subItem.path.split('?');
                          const isSubActive = location.pathname.startsWith(base) && (!query || location.search.includes(query));
                          return (
                            <Link 
                              key={subItem.label}
                              to={subItem.path}
                              onClick={() => setHoveredNav(null)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 0.75rem',
                                color: isSubActive ? 'var(--primary)' : 'var(--text-main)',
                                backgroundColor: isSubActive ? 'var(--primary-glow)' : 'transparent',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                fontWeight: isSubActive ? 600 : 500,
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (!isSubActive) e.currentTarget.style.backgroundColor = 'var(--box-bg)';
                              }}
                              onMouseLeave={(e) => {
                                if (!isSubActive) e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              {SubIcon && <SubIcon size={16} color={isSubActive ? 'var(--primary)' : 'var(--text-secondary)'} />}
                              {subItem.label}
                            </Link>
                          );
                        })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // Standard Link
              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
                    <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                  </a>
                );
              }

              const linkProps = item.dummy ? {
                to: '#',
                onClick: (e) => {
                  e.preventDefault();
                  showToast(`${item.label} module is a placeholder for dashboard integration.`);
                }
              } : {
                to: item.path
              };

              return (
                <Link 
                  key={item.label} 
                  {...linkProps}
                  style={linkStyle}
                >
                  <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          {/* Right Side: Avatar, and Admin Mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Streak indicator badge */}


            {/* Theme Toggle */}
            <button 
              className="pr-btn-icon" 
              onClick={handleToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Conditional Glowing Admin Toggle */}
            {toggleUnlocked && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.65rem',
                backgroundColor: adminMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${adminMode ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                padding: '0.35rem 0.65rem',
                borderRadius: '100px',
                boxShadow: adminMode ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none',
                transition: 'var(--transition-normal)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 650, color: adminMode ? 'var(--primary-hover)' : 'var(--text-secondary)', userSelect: 'none' }}>
                  {adminMode ? '🔓 Developer' : '🎓 Student'}
                </span>
                <label style={{ 
                  position: 'relative', 
                  display: 'inline-block', 
                  width: '28px', 
                  height: '16px',
                  margin: 0
                }}>
                  <input 
                    type="checkbox" 
                    checked={adminMode}
                    onChange={handleToggleAdminMode}
                    style={{ 
                      opacity: 0, 
                      width: 0, 
                      height: 0 
                    }} 
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transition: '.3s',
                    borderRadius: '34px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '10px',
                      width: '10px',
                      left: '2px',
                      bottom: '2px',
                      backgroundColor: adminMode ? 'var(--primary)' : 'var(--text-secondary)',
                      transition: '.3s',
                      borderRadius: '50%',
                      transform: adminMode ? 'translateX(12px)' : 'none'
                    }} />
                  </span>
                </label>
                <button 
                  onClick={lockToggle}
                  title="Lock & Hide Admin Toggle"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    lineHeight: 1,
                    padding: '0 2px',
                    marginLeft: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Profile/Auth Actions */}
            <div className="navbar-right" style={{ position: 'relative' }}>
              {user ? (
                <div>
                  <div 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-on-primary)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                      border: '2px solid transparent',
                      boxShadow: showProfileMenu ? '0 0 0 2px var(--primary)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    {getInitials(user.username)}
                  </div>
                  
                  {showProfileMenu && (
                    <div 
                      className="card"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        minWidth: '220px',
                        padding: '1rem',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease-out forwards',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                    >
                      <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.75rem' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1rem' }}>{user.username || 'User'}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.8, marginTop: '2px' }}>{user.email || 'No email provided'}</div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9 }}>
                          Role: <span style={{ color: 'var(--primary)', textTransform: 'capitalize', fontWeight: 'bold', opacity: 1 }}>{user.role || 'Student'}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }} 
                          style={{ 
                            marginTop: '0.5rem',
                            padding: '0.5rem', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.3)', 
                            borderRadius: 'var(--radius-sm)', 
                            cursor: 'pointer', 
                            color: 'var(--danger)',
                            fontWeight: '600',
                            width: '100%',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                          onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to="/login" style={{ textDecoration: 'none', padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>Login</Link>
                  <Link to="/register" style={{ textDecoration: 'none', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-sm)' }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Layout Body */}
        <div className="content-body animate-fade-in" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>

      {/* Floating Glassmorphic Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-glow)',
          boxShadow: 'var(--shadow-glow)',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-main)',
          zIndex: 99999,
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out forwards'
        }}>
          <span style={{ color: 'var(--primary-hover)' }}>✦</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
