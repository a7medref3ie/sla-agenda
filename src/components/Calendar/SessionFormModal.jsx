import { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { SESSION_STATUSES, COURTS } from '../../data/sampleData';

export default function SessionFormModal({ session, initialCaseId, cases: casesList, selectedDate, onSubmit, onClose }) {
  const getDefaultDate = () => {
    if (session?.date) return session.date.slice(0, 16);
    if (selectedDate) {
      const d = new Date(selectedDate);
      d.setHours(10, 0);
      return d.toISOString().slice(0, 16);
    }
    // Default to tomorrow 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const initialCase = casesList.find(c => c.id === (session?.caseId || initialCaseId));

  const [form, setForm] = useState({
    caseId: session?.caseId || initialCaseId || '',
    date: getDefaultDate(),
    court: session?.court || initialCase?.court || '',
    circuit: session?.circuit || initialCase?.circuit || '',
    hall: session?.hall || '',
    type: session?.type || 'نظر',
    status: session?.status || 'scheduled',
    decision: session?.decision || '',
    notes: session?.notes || '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Auto-fill court when case is selected
    if (field === 'caseId') {
      const selectedCase = casesList.find(c => c.id === value);
      if (selectedCase) {
        setForm(prev => ({
          ...prev,
          caseId: value,
          court: selectedCase.court,
          circuit: selectedCase.circuit,
        }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form.caseId || !form.date) return;
    onSubmit({ ...form, date: new Date(form.date).toISOString() });
  };

  const activeCases = casesList.filter(c => c.status !== 'closed');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <CalendarDays size={20} className="text-gold" />
            {session ? 'تعديل الجلسة' : 'إضافة جلسة جديدة'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">القضية *</label>
              <select className="form-select" value={form.caseId} onChange={e => handleChange('caseId', e.target.value)} required>
                <option value="">اختر القضية</option>
                {activeCases.map(c => (
                  <option key={c.id} value={c.id}>
                    قضية {c.number}/{c.year} - {c.subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">التاريخ والوقت *</label>
                <input type="datetime-local" className="form-input" value={form.date} onChange={e => handleChange('date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">نوع الجلسة</label>
                <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                  <option value="أولى">أولى</option>
                  <option value="نظر">نظر</option>
                  <option value="مرافعة">مرافعة</option>
                  <option value="تحقيق">تحقيق</option>
                  <option value="استماع للخبير">استماع للخبير</option>
                  <option value="نطق بالحكم">نطق بالحكم</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">المحكمة</label>
                <select className="form-select" value={form.court} onChange={e => handleChange('court', e.target.value)}>
                  <option value="">اختر المحكمة</option>
                  {COURTS.map(court => (
                    <option key={court} value={court}>{court}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">القاعة</label>
                <input className="form-input" value={form.hall} onChange={e => handleChange('hall', e.target.value)} placeholder="مثال: القاعة 5" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">الدائرة</label>
                <input className="form-input" value={form.circuit} onChange={e => handleChange('circuit', e.target.value)} placeholder="الدائرة" />
              </div>
              <div className="form-group">
                <label className="form-label">حالة الجلسة</label>
                <select className="form-select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  {Object.entries(SESSION_STATUSES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">قرار الجلسة</label>
              <input className="form-input" value={form.decision} onChange={e => handleChange('decision', e.target.value)} placeholder="القرار الصادر في الجلسة" />
            </div>
            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea className="form-textarea" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="ملاحظات إضافية..." rows={3} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {session ? 'حفظ التعديلات' : 'إضافة الجلسة'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
