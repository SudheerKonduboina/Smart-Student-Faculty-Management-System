import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(usernameOrEmail, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, pass) => {
    setUsernameOrEmail(email);
    setPassword(pass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Branding Box */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', background: 'var(--accent-surface)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem' }}>
            <Shield size={18} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Enterprise Academic Suite</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem' }}>
            Smart Student & <br />
            <span className="gradient-text">Faculty Management</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            A centralized platform for real-time QR attendance, automated grade calculations, timetable scheduling, and comprehensive academic analytics.
          </p>

          {/* Quick Demo Credentials */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserCheck size={16} color="var(--accent-primary)" /> Quick Demo Logins
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => fillDemo('admin@sms.edu', 'Admin@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.825rem', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ color: 'var(--danger)' }}>Admin:</strong> admin@sms.edu
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Admin@123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('priya.sharma@sms.edu', 'Faculty@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.825rem', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ color: 'var(--warning)' }}>Faculty:</strong> priya.sharma@sms.edu
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Faculty@123</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('arjun.kumar@sms.edu', 'Student@123')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.825rem', textAlign: 'left' }}
              >
                <div>
                  <strong style={{ color: 'var(--accent-primary)' }}>Student:</strong> arjun.kumar@sms.edu
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Student@123</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Sign In to Account</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enter your username or institutional email</p>
          </div>

          {searchParams.get('session_expired') && (
            <div style={{ padding: '0.75rem', background: 'var(--warning-surface)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--danger-surface)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="admin@sms.edu"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button
              type="submit"
              className="gradient-btn"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '1rem', fontSize: '1rem' }}
            >
              {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
