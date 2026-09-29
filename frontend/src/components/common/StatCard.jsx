import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'indigo' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald': return { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' };
      case 'rose': return { bg: 'rgba(244, 63, 94, 0.12)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.2)' };
      case 'amber': return { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' };
      case 'cyan': return { bg: 'rgba(6, 182, 212, 0.12)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.2)' };
      case 'purple': return { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.2)' };
      default: return { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.2)' };
    }
  };

  const style = getColorStyles();

  return (
    <div className="glass-card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.2 }}>
            {value}
          </div>
          {trend !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: 700, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                {trend >= 0 ? `+${trend}%` : `${trend}%`}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{trendLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: style.bg, border: `1px solid ${style.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.text }}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
    </div>
  );
};
