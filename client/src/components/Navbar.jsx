import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Package, Upload, LayoutDashboard, UserCheck, Sparkles, LogOut } from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state initialization and persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [location]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Package className="logo-icon" size={24} />
          Project Marketplace
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="nav-link">Browse</Link>

          {user && user.role === 'creator' && (
            <Link to="/upload" className="nav-link">
              <Upload size={16} />
              Upload
            </Link>
          )}

          {user && user.role === 'creator' && (
            <Link to="/dashboard" className="nav-link">
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link">
              <UserCheck size={16} />
              Admin
            </Link>
          )}

          {user && user.role === 'viewer' && (
            <Link to="/request-creator" className="nav-link">
              <Sparkles size={16} />
              Become Creator
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
