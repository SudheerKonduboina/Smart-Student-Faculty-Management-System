import React, { useState, useEffect } from 'react';
import { CheckSquare, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import API from '../../services/api';

export const StudentAttendance = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await API.get('/attendance/my');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isLowAttendance = (summary?.overallPercentage || 100) < 75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          My Attendance Performance
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Subject-wise attendance breakdown and overall eligibility tracker
        </p>
      </div>

      {/* Low Attendance Warning Alert (<75%) */}
      {isLowAttendance && (
        <div style={{ padding: '1rem', background: 'var(--danger-surface)', border: '1px solid rgba(244,63,94,0.4)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={24} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Deformity Warning: Attendance below 75%!</h4>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>Your overall attendance is currently {summary?.overallPercentage?.toFixed(1)}%. You are at risk of exam debarment.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Overall Attendance</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: isLowAttendance ? 'var(--danger)' : 'var(--success)', marginTop: '0.2rem' }}>
            {summary?.overallPercentage?.toFixed(1) || '0.0'}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Lectures Attended</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {summary?.attendedCount || 0} / {summary?.totalLectures || 0}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Classes Absent</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)', marginTop: '0.2rem' }}>
            {(summary?.totalLectures || 0) - (summary?.attendedCount || 0)}
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown Table */}
      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Code</th>
              <th>Attended / Total</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary?.subjectBreakdown?.map((sb, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 700 }}>{sb.subjectName}</td>
                <td><span className="badge badge-primary">{sb.subjectCode}</span></td>
                <td>{sb.attendedCount} / {sb.totalLectures}</td>
                <td style={{ fontWeight: 800 }}>{sb.percentage.toFixed(1)}%</td>
                <td>
                  <span className={`badge ${sb.percentage >= 75 ? 'badge-success' : 'badge-danger'}`}>
                    {sb.percentage >= 75 ? 'Eligible' : 'Shortage'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
