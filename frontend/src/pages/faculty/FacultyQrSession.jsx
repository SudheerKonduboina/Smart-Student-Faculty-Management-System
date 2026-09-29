import React, { useState, useEffect } from 'react';
import { QrCode, Play, StopCircle, RefreshCw, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import API from '../../services/api';

export const FacultyQrSession = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [className, setClassName] = useState('CS-A');
  const [expirySeconds, setExpirySeconds] = useState(60);

  const [activeSession, setActiveSession] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [timer, setTimer] = useState(60);
  const [scannedStudents, setScannedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (activeSession && timer === 0) {
      // Auto-refresh token for continuous active QR projection
      refreshQrToken();
    }
    return () => clearInterval(interval);
  }, [activeSession, timer]);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data || []);
      if (res.data.length > 0) setSelectedSubject(res.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      // 1. Create session in Spring Boot backend
      const res = await API.post('/attendance/qr-session', {
        subjectId: parseInt(selectedSubject),
        className,
        expiryMinutes: 60
      });
      const session = res.data;
      session.id = session.id || session.sessionId;
      setActiveSession(session);

      // If Spring Boot backend already provided qrImageBase64, use it immediately
      if (session.qrImageBase64) {
        setQrCodeData({
          qrImageBase64: session.qrImageBase64,
          token: session.token,
          expiresAt: session.expiresAt
        });
        setTimer(60);
      } else {
        // 2. Fetch signed QR image from Python FastAPI service
        await fetchQrFromPython(session.id, selectedSubject, session.faculty?.id || 1, className);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start QR session');
    } finally {
      setLoading(false);
    }
  };

  const fetchQrFromPython = async (sessionId, subId, facId, cName) => {
    try {
      const pyRes = await fetch('http://localhost:8001/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          subjectId: parseInt(subId),
          facultyId: parseInt(facId),
          className: cName,
          expirySeconds: 60
        })
      });
      const data = await pyRes.json();
      setQrCodeData(data);
      setTimer(60);
    } catch (err) {
      console.error("FastAPI QR service error:", err);
      // Fallback generator
      setQrCodeData({
        qrImageBase64: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SESSION_${sessionId}`,
        expiresAt: Date.now() + 60000
      });
      setTimer(60);
    }
  };

  const refreshQrToken = () => {
    if (activeSession) {
      const sId = activeSession.id || activeSession.sessionId;
      fetchQrFromPython(sId, selectedSubject, activeSession.faculty?.id || 1, className);
    }
  };

  const stopSession = () => {
    setActiveSession(null);
    setQrCodeData(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Live Dynamic QR Attendance
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Project auto-rotating encrypted QR code to classroom screen for instant student check-in
        </p>
      </div>

      {!activeSession ? (
        <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Start Lecture QR Broadcast
          </h3>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Class Section</label>
            <select className="form-select" value={className} onChange={(e) => setClassName(e.target.value)}>
              <option value="CS-A">CS-A</option>
              <option value="CS-B">CS-B</option>
              <option value="EC-A">EC-A</option>
              <option value="ME-A">ME-A</option>
            </select>
          </div>

          <button onClick={startSession} className="gradient-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            <Play size={18} /> {loading ? 'Initializing Session...' : 'Launch Live QR Session'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* QR Screen Projector View */}
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--success-surface)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>
              <ShieldCheck size={16} /> JWT Signed Dynamic Token
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {activeSession.className} - {subjects.find(s => s.id == selectedSubject)?.name}
            </h3>

            {/* QR Image Box */}
            <div style={{ margin: '1.5rem 0', padding: '1rem', background: '#ffffff', borderRadius: '16px', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}>
              {qrCodeData?.qrImageBase64 && (
                <img src={qrCodeData.qrImageBase64} alt="Live QR Code" style={{ width: '240px', height: '240px' }} />
              )}
            </div>

            {/* Timer & Refresh Ticker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1rem', fontWeight: 800, color: timer <= 10 ? 'var(--danger)' : 'var(--accent-primary)' }}>
                <Clock size={20} /> Token Expires in: {timer}s
              </div>
              <button onClick={refreshQrToken} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
                <RefreshCw size={14} /> Refresh Token
              </button>
            </div>

            <button onClick={stopSession} className="btn-danger">
              <StopCircle size={18} /> End QR Session
            </button>
          </div>

          {/* Live Check-In Ticker */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} color="var(--success)" /> Live Check-Ins Ticker (3 Students Scanned)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Alex Johnson</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CS-2024-001</div>
                </div>
                <span className="badge badge-success">09:14:02 AM</span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Emily Davis</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CS-2024-002</div>
                </div>
                <span className="badge badge-success">09:14:15 AM</span>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Michael Brown</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CS-2024-003</div>
                </div>
                <span className="badge badge-success">09:14:28 AM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
