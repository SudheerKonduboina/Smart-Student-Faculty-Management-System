import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, UserCheck } from 'lucide-react';
import API from '../../services/api';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    fetchMyTimetable();
  }, []);

  const fetchMyTimetable = async () => {
    try {
      const res = await API.get('/timetable/my');
      setTimetable(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          My Class Schedule
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Weekly timetable for your section, subject room allocations, and faculty
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {DAYS.map(day => {
          const slots = timetable.filter(t => t.dayOfWeek === day);
          return (
            <div key={day} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{day}</h4>
                <span className="badge badge-info">{slots.length} Lectures</span>
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
                        Prof. {s.faculty?.user?.firstName} {s.faculty?.user?.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
