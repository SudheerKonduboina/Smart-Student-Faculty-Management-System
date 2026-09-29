import React, { useState, useEffect } from 'react';
import { Calendar, Plus, AlertTriangle, Clock, MapPin, UserCheck } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import API from '../../services/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const AdminTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedClass, setSelectedClass] = useState('CS-A');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState('');

  const [formData, setFormData] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: '',
    facultyId: '',
    className: 'CS-A',
    roomNumber: 'Room-101'
  });

  useEffect(() => {
    fetchTimetable();
    fetchSubjects();
    fetchFaculties();
  }, [selectedClass]);

  const fetchTimetable = async () => {
    try {
      const res = await API.get(`/timetable?className=${selectedClass}`);
      setTimetable(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      setSubjects(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await API.get('/faculty');
      setFaculties(res.data?.content || res.data || []);
    } catch (err) {
      console.error(err);
      setFaculties([]);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setConflictError('');
    try {
      await API.post('/timetable', {
        ...formData,
        subjectId: parseInt(formData.subjectId),
        facultyId: parseInt(formData.facultyId)
      });
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      setConflictError(err.response?.data?.message || 'Schedule conflict detected!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Timetable Scheduler
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Class schedule with enforced 3-way conflict validation (Faculty, Room, Class)
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="gradient-btn">
          <Plus size={18} /> Add Schedule Slot
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label className="form-label" style={{ margin: 0 }}>Select Class Section:</label>
        <select className="form-select" style={{ width: '180px' }} value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
          <option value="CS-A">CS-A</option>
          <option value="CS-B">CS-B</option>
          <option value="EC-A">EC-A</option>
          <option value="ME-A">ME-A</option>
        </select>
      </div>

      {/* Weekly Schedule Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {DAYS.map(day => {
          const slots = timetable.filter(t => t.dayOfWeek === day);
          return (
            <div key={day} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{day}</h4>
                <span className="badge badge-info">{slots.length} Classes</span>
              </div>

              {slots.length === 0 ? (
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>No lectures scheduled</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {slots.map(s => (
                    <div key={s.id} style={{ padding: '0.85rem', borderRadius: '8px', background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-primary)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {s.subject?.name} ({s.subject?.code})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                        <Clock size={14} /> {s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}
                        <MapPin size={14} style={{ marginLeft: '0.5rem' }} /> {s.roomNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Faculty: {s.faculty?.user?.firstName} {s.faculty?.user?.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Timetable Slot">
        {conflictError && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--danger-surface)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> {conflictError}
          </div>
        )}

        <form onSubmit={handleAddSlot}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select className="form-select" value={formData.dayOfWeek} onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Class Section</label>
              <input className="form-input" value={formData.className} onChange={(e) => setFormData({ ...formData, className: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-select" value={formData.subjectId} onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })} required>
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Faculty</label>
              <select className="form-select" value={formData.facultyId} onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })} required>
                <option value="">Select Faculty</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Room Number</label>
              <input className="form-input" placeholder="e.g. Room-101" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="gradient-btn">Check & Schedule</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
