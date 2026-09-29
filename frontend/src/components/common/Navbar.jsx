import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Bell, LogOut, User as UserIcon, Shield, CheckCheck } from 'lucide-react';
import API from '../../services/api';

export const Navbar = () => {
  const { user, role, logout, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/my');
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
    } catch (err) {
      // Ignore background fetch error
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'badge-danger';
      case 'FACULTY': return 'badge-warning';
      case 'STUDENT': return 'badge-primary';
      default: return 'badge-info';
    }
  };

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '0.85rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', sticky: 'top', zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '10px', display: 'flex', color: '#fff' }}>
          <Shield size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>SmartSMS</h1>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Academic Management System</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Dark/Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px', justifyContent: 'center' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#f59e0b" />}
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '50%', width: '38px', height: '38px', justifyContent: 'center', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '-3px', right: '-3px', background: 'var(--danger)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="glass-card" style={{ position: 'absolute', right: 0, top: '48px', width: '340px', padding: '1rem', zIndex: 200, boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCheck size={14} /> Mark read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{ padding: '0.65rem', borderRadius: '8px', marginBottom: '0.5rem', background: n.read ? 'transparent' : 'var(--accent-surface)', borderLeft: n.read ? '3px solid transparent' : '3px solid var(--accent-primary)' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{n.message}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-light)' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-surface)', border: '1px solid var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {user?.firstName?.[0] || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {user?.firstName} {user?.lastName}
            </span>
            <span className={`badge ${getRoleColor()}`} style={{ marginTop: '0.15rem', alignSelf: 'flex-start' }}>
              {role}
            </span>
          </div>

          <button
            onClick={logout}
            className="btn-danger"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}
            title="Log Out"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};
