import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import API from '../../services/api';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#6366f1', '#8b5cf6', '#06b6d4'];

export const AdminAnalytics = () => {
  const [attendanceDist, setAttendanceDist] = useState([]);
  const [deptPerf, setDeptPerf] = useState([]);
  const [gradeDist, setGradeDist] = useState([]);
  const [leaveStats, setLeaveStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const results = await Promise.allSettled([
        API.get('/analytics/attendance'),
        API.get('/analytics/students'),
        API.get('/analytics/grades'),
        API.get('/analytics/dashboard')
      ]);

      // Attendance distribution from /analytics/attendance
      if (results[0].status === 'fulfilled') {
        const attData = results[0].value.data || {};
        const comparison = attData.subjectComparison || [];
        if (comparison.length > 0) {
          setAttendanceDist(comparison.map(s => ({ name: s.subject || s.code, value: s.present || 1 })));
        } else {
          // Fallback: build from dashboard stats
          setAttendanceDist([
            { name: 'Active Students', value: attData.totalStudents || 0 },
            { name: 'Warning Threshold', value: attData.warningThreshold || 75 }
          ]);
        }
      }

      // Department performance from /analytics/students (byDepartment)
      if (results[1].status === 'fulfilled') {
        const stuData = results[1].value.data || {};
        const byDept = stuData.byDepartment || [];
        setDeptPerf(byDept.map(d => ({ name: d.department || d.code, avg: d.count || 0 })));
      }

      // Grade distribution from /analytics/grades
      if (results[2].status === 'fulfilled') {
        const gradeData = results[2].value.data || {};
        const dist = gradeData.gradeDistribution || [];
        if (Array.isArray(dist)) {
          setGradeDist(dist.map(d => ({ grade: d.grade, count: Number(d.count) || 0 })));
        }
      }

      // Leave stats from /analytics/dashboard
      if (results[3].status === 'fulfilled') {
        const dash = results[3].value.data || {};
        setLeaveStats([
          { status: 'Pending Leaves', count: dash.pendingLeaves || 0 },
          { status: 'Total Students', count: dash.totalStudents || 0 },
          { status: 'Total Faculty', count: dash.totalFaculty || 0 },
          { status: 'Total Subjects', count: dash.totalSubjects || 0 }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Academic Analytics & Insights
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Real-time visualizations for attendance trends, grade distributions, and leave patterns
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Attendance Distribution */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChartIcon size={18} color="var(--accent-primary)" /> Attendance Status Distribution
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {attendanceDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--accent-primary)" /> Grade Distribution Histogram
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDist}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="grade" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Average Attendance */}
        <div className="glass-card" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-primary)" /> Department-Wise Average Attendance (%)
          </h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerf}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis domain={[0, 100]} stroke="var(--text-secondary)" />
                <Tooltip />
                <Bar dataKey="avg" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
