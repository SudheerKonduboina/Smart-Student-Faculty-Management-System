import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import API from '../../services/api';

export const StudentQrScan = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let scanner;
    try {
      scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      }, false);

      scanner.render((decodedText) => {
        handleMarkQr(decodedText);
        scanner.clear();
      }, (err) => {
        // Ignore frame scan errors
      });
    } catch (e) {
      console.log("Scanner init error / no camera:", e);
    }

    return () => {
      if (scanner) scanner.clear().catch(e => console.error(e));
    };
  }, []);

  const handleMarkQr = async (qrToken) => {
    setError('');
    setScanResult(null);
    setLoading(true);
    try {
      const res = await API.post('/attendance/mark-qr', { token: qrToken });
      setScanResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process QR token.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      handleMarkQr(tokenInput.trim());
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Scan Class QR Code
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Position your camera over the projected QR code or enter the secure token string
        </p>
      </div>

      {scanResult && (
        <div style={{ padding: '1.25rem', background: 'var(--success-surface)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 'var(--radius-md)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <CheckCircle2 size={32} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Attendance Marked Successfully!</h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
              Subject: <strong>{scanResult.subject?.name}</strong> | Status: <strong>{scanResult.status}</strong>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '1.25rem', background: 'var(--danger-surface)', border: '1px solid rgba(244,63,94,0.4)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={32} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Scan Verification Failed</h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      )}

      {/* HTML5 Camera Reader Element */}
      <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Live Camera Viewfinder
        </h3>
        <div id="qr-reader" style={{ width: '100%', minHeight: '260px' }}></div>
      </div>

      {/* Manual Token String Backup Form */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Key size={18} color="var(--accent-primary)" /> Manual Token Fallback
        </h3>
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Paste encrypted JWT token here..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="gradient-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Verifying Token Signature...' : 'Submit QR Token'}
          </button>
        </form>
      </div>
    </div>
  );
};
