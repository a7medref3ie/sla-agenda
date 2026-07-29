import { useState, useMemo } from 'react';
import {
  CalendarDays, Plus, ChevronRight, ChevronLeft, X,
  Clock, MapPin, Edit3, Trash2, AlertCircle
} from 'lucide-react';
import { CASE_TYPES, SESSION_STATUSES, COURTS } from '../../data/sampleData';
import {
  getDaysInMonth, getFirstDayOfMonth, getMonthName, WEEKDAYS,
  formatTime, formatDate, generateId, isToday
} from '../../utils/helpers';
import SessionFormModal from './SessionFormModal';
import './Calendar.css';

export default function CalendarPage({ cases, sessions, onAddSession, onUpdateSession, onDeleteSession }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      const d = new Date(s.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(s);
      }
    });
    return map;
  }, [sessions, currentMonth, currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (day) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
  };

  const selectedDaySessions = selectedDate
    ? sessions.filter(s => {
        const d = new Date(s.date);
        return d.getDate() === selectedDate.getDate()
          && d.getMonth() === selectedDate.getMonth()
          && d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  const handleSubmit = (formData) => {
    if (editingSession) {
      onUpdateSession(editingSession.id, formData);
    } else {
      onAddSession({
        ...formData,
        id: generateId('sess'),
      });
    }
    setShowForm(false);
    setEditingSession(null);
  };

  const handleDelete = (id) => {
    onDeleteSession(id);
    setShowDeleteConfirm(null);
  };

  // Build calendar grid
  const calendarDays = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }
  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const daySessions = sessionsByDate[day] || [];
    const isCurrentDay = day === today.getDate()
      && currentMonth === today.getMonth()
      && currentYear === today.getFullYear();
    const isSelected = selectedDate
      && day === selectedDate.getDate()
      && currentMonth === selectedDate.getMonth()
      && currentYear === selectedDate.getFullYear();

    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${isCurrentDay ? 'today' : ''} ${isSelected ? 'selected' : ''} ${daySessions.length > 0 ? 'has-sessions' : ''}`}
        onClick={() => handleDayClick(day)}
      >
        <span className="day-number">{day}</span>
        {daySessions.length > 0 && (
          <div className="day-sessions-dots">
            {daySessions.slice(0, 3).map((s, i) => {
              const caseData = cases.find(c => c.id === s.caseId);
              return (
                <span
                  key={i}
                  className="session-dot"
                  style={{ background: CASE_TYPES[caseData?.type]?.color || '#666' }}
                  title={`${caseData?.number || ''} - ${s.type}`}
                />
              );
            })}
            {daySessions.length > 3 && (
              <span className="session-dot-more">+{daySessions.length - 3}</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              <CalendarDays className="icon" size={28} />
              تقويم الجلسات
            </h1>
            <p className="page-subtitle">إدارة ومتابعة جلسات القضايا</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingSession(null); setShowForm(true); }}>
            <Plus size={18} />
            إضافة جلسة
          </button>
        </div>
      </div>

      <div className="calendar-layout">
        {/* Calendar Grid */}
        <div className="glass-card calendar-container">
          <div className="calendar-header">
            <button className="btn btn-ghost" onClick={prevMonth}>
              <ChevronRight size={20} />
            </button>
            <div className="calendar-title">
              <h2>{getMonthName(currentMonth)} {currentYear}</h2>
              <button className="btn btn-sm btn-outline" onClick={goToToday}>اليوم</button>
            </div>
            <button className="btn btn-ghost" onClick={nextMonth}>
              <ChevronLeft size={20} />
            </button>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays}
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            {Object.entries(CASE_TYPES).map(([key, val]) => (
              <div key={key} className="legend-item">
                <span className="legend-dot" style={{ background: val.color }} />
                <span>{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="glass-card day-detail-panel">
          {selectedDate ? (
            <>
              <div className="day-detail-header">
                <h3>
                  {isToday(selectedDate.toISOString()) ? '📅 اليوم' : formatDate(selectedDate.toISOString())}
                </h3>
                <span className="badge badge-gold">{selectedDaySessions.length} جلسة</span>
              </div>
              {selectedDaySessions.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <CalendarDays size={36} className="empty-icon" />
                  <p className="empty-title">لا توجد جلسات</p>
                  <button
                    className="btn btn-sm btn-outline mt-4"
                    onClick={() => { setEditingSession(null); setShowForm(true); }}
                  >
                    <Plus size={14} /> إضافة جلسة
                  </button>
                </div>
              ) : (
                <div className="day-sessions-list">
                  {selectedDaySessions.map(session => {
                    const caseData = cases.find(c => c.id === session.caseId);
                    const caseType = CASE_TYPES[caseData?.type];
                    return (
                      <div key={session.id} className="day-session-card">
                        <div
                          className="day-session-stripe"
                          style={{ background: caseType?.color || '#666' }}
                        />
                        <div className="day-session-content">
                          <div className="flex items-center justify-between">
                            <span className="day-session-time">
                              <Clock size={14} /> {formatTime(session.date)}
                            </span>
                            <span
                              className="badge"
                              style={{
                                background: `${SESSION_STATUSES[session.status]?.color}15`,
                                color: SESSION_STATUSES[session.status]?.color,
                              }}
                            >
                              {SESSION_STATUSES[session.status]?.label}
                            </span>
                          </div>
                          <div className="day-session-case">
                            قضية {caseData?.number}/{caseData?.year}
                          </div>
                          <div className="day-session-meta">
                            <span><MapPin size={12} /> {session.court}</span>
                            <span>{session.hall}</span>
                          </div>
                          <div className="day-session-type">
                            نوع الجلسة: <strong>{session.type}</strong>
                          </div>
                          {session.decision && (
                            <div className="day-session-decision">
                              القرار: {session.decision}
                            </div>
                          )}
                          {session.notes && (
                            <div className="day-session-notes text-xs text-muted">
                              {session.notes}
                            </div>
                          )}
                          <div className="day-session-actions">
                            <button className="btn btn-sm btn-ghost" onClick={() => { setEditingSession(session); setShowForm(true); }}>
                              <Edit3 size={14} /> تعديل
                            </button>
                            <button className="btn btn-sm btn-ghost text-danger" onClick={() => setShowDeleteConfirm(session.id)}>
                              <Trash2 size={14} /> حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <CalendarDays size={48} className="empty-icon" />
              <p className="empty-title">اختر يوماً من التقويم</p>
              <p className="empty-text">لعرض تفاصيل الجلسات المقررة</p>
            </div>
          )}
        </div>
      </div>

      {/* Session Form Modal */}
      {showForm && (
        <SessionFormModal
          session={editingSession}
          cases={cases}
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingSession(null); }}
        />
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>تأكيد الحذف</h3>
              <p className="text-secondary text-sm">هل أنت متأكد من حذف هذه الجلسة؟</p>
              <div className="flex gap-3 justify-center mt-6">
                <button className="btn btn-danger" onClick={() => handleDelete(showDeleteConfirm)}>
                  <Trash2 size={16} /> نعم، حذف
                </button>
                <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


