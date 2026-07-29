import { useState } from 'react';
import {
  Scale, Plus, Filter, Eye, Edit3, Trash2, X,
  Sparkles, ChevronDown, AlertCircle, CalendarPlus, CalendarDays
} from 'lucide-react';
import { CASE_TYPES, CASE_STATUSES, SESSION_STATUSES, COURTS } from '../../data/sampleData';
import { generateCaseSummary, suggestCaseType } from '../../utils/aiEngine';
import { formatDate, formatTime, generateId, searchItems, sortByDate } from '../../utils/helpers';
import SessionFormModal from '../Calendar/SessionFormModal';
import './Cases.css';

export default function CasesPage({ cases, sessions, onAddCase, onUpdateCase, onDeleteCase, onAddSession }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [viewingCase, setViewingCase] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [sessionModalCaseId, setSessionModalCaseId] = useState(null);

  // Filter & search cases
  let filteredCases = cases;
  if (filterType !== 'all') filteredCases = filteredCases.filter(c => c.type === filterType);
  if (filterStatus !== 'all') filteredCases = filteredCases.filter(c => c.status === filterStatus);
  if (searchQuery) {
    filteredCases = searchItems(filteredCases, searchQuery, ['number', 'subject', 'plaintiff', 'defendant', 'court']);
  }

  const handleSubmit = (formData) => {
    if (editingCase) {
      onUpdateCase(editingCase.id, formData);
    } else {
      onAddCase({
        ...formData,
        id: generateId('case'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    // Reset filters and search so newly added case is immediately visible at the top
    setFilterType('all');
    setFilterStatus('all');
    setSearchQuery('');
    setShowForm(false);
    setEditingCase(null);
  };

  const handleEdit = (caseData) => {
    setEditingCase(caseData);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    onDeleteCase(id);
    setShowDeleteConfirm(null);
    setViewingCase(null);
  };

  const handleAISummary = (caseData) => {
    setAiSummary('');
    setTimeout(() => {
      setAiSummary(generateCaseSummary(caseData));
    }, 500);
  };

  // Count sessions for a case
  const getSessionCount = (caseId) => sessions.filter(s => s.caseId === caseId).length;

  return (
    <div className="cases-page">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              <Scale className="icon" size={28} />
              إدارة القضايا
            </h1>
            <p className="page-subtitle">
              {filteredCases.length} قضية {filterType !== 'all' || filterStatus !== 'all' ? '(مُفلترة)' : ''}
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingCase(null); setShowForm(true); }}>
            <Plus size={18} />
            إضافة قضية
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="cases-filters glass-card">
        <div className="filter-search">
          <input
            type="text"
            className="form-input"
            placeholder="البحث في القضايا..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} className="text-muted" />
          <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">كل الأنواع</option>
            {Object.entries(CASE_TYPES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            {Object.entries(CASE_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="cases-grid stagger-children">
        {filteredCases.length === 0 ? (
          <div className="empty-state glass-card">
            <Scale size={48} className="empty-icon" />
            <p className="empty-title">لا توجد قضايا</p>
            <p className="empty-text">
              {searchQuery ? 'جرب تعديل كلمات البحث' : 'أضف قضية جديدة للبدء'}
            </p>
          </div>
        ) : (
          filteredCases.map(c => (
            <div key={c.id} className="glass-card case-card">
              <div className="case-card-header">
                <div className="case-number-badge">
                  <span style={{ color: CASE_TYPES[c.type]?.color }}>●</span>
                  قضية {c.number}/{c.year}
                </div>
                <span
                  className="badge"
                  style={{
                    background: CASE_STATUSES[c.status]?.bg,
                    color: CASE_STATUSES[c.status]?.color,
                    border: `1px solid ${CASE_STATUSES[c.status]?.color}30`,
                  }}
                >
                  {CASE_STATUSES[c.status]?.label}
                </span>
              </div>

              <h3 className="case-card-subject">{c.subject}</h3>

              <div className="case-card-meta">
                <div className="meta-row">
                  <span className="meta-label">النوع:</span>
                  <span className="badge" style={{
                    background: `${CASE_TYPES[c.type]?.color}15`,
                    color: CASE_TYPES[c.type]?.color,
                    border: `1px solid ${CASE_TYPES[c.type]?.color}30`,
                  }}>
                    {CASE_TYPES[c.type]?.label}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">المحكمة:</span>
                  <span className="meta-value">{c.court}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">المدعي:</span>
                  <span className="meta-value">{c.plaintiff}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">المدعى عليه:</span>
                  <span className="meta-value">{c.defendant}</span>
                </div>
              </div>

              <div className="case-card-footer">
                <span className="text-xs text-muted">
                  {getSessionCount(c.id)} جلسة • {formatDate(c.updatedAt)}
                </span>
                <div className="case-card-actions">
                  <button className="btn-icon sm text-gold" title="إضافة جلسة للقضية" onClick={() => setSessionModalCaseId(c.id)}>
                    <CalendarPlus size={16} />
                  </button>
                  <button className="btn-icon sm" title="عرض" onClick={() => { setViewingCase(c); handleAISummary(c); }}>
                    <Eye size={16} />
                  </button>
                  <button className="btn-icon sm" title="تعديل" onClick={() => handleEdit(c)}>
                    <Edit3 size={16} />
                  </button>
                  <button className="btn-icon sm text-danger" title="حذف" onClick={() => setShowDeleteConfirm(c.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {c.priority === 'high' && <div className="priority-indicator" />}
            </div>
          ))
        )}
      </div>

      {/* Add Session Modal for Case */}
      {sessionModalCaseId && (
        <SessionFormModal
          initialCaseId={sessionModalCaseId}
          cases={cases}
          onSubmit={(sessionData) => {
            onAddSession({
              ...sessionData,
              id: generateId('sess'),
            });
            setSessionModalCaseId(null);
          }}
          onClose={() => setSessionModalCaseId(null)}
        />
      )}

      {/* Case Form Modal */}
      {showForm && (
        <CaseFormModal
          caseData={editingCase}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingCase(null); }}
        />
      )}

      {/* Case Detail Modal */}
      {viewingCase && (
        <div className="modal-overlay" onClick={() => { setViewingCase(null); setAiSummary(''); }}>
          <div className="modal-content case-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Scale size={20} className="text-gold" />
                قضية {viewingCase.number}/{viewingCase.year}
              </h2>
              <button className="btn-icon" onClick={() => { setViewingCase(null); setAiSummary(''); }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">الموضوع</span>
                  <span className="detail-value">{viewingCase.subject}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">النوع</span>
                  <span className="badge" style={{
                    background: `${CASE_TYPES[viewingCase.type]?.color}15`,
                    color: CASE_TYPES[viewingCase.type]?.color,
                  }}>{CASE_TYPES[viewingCase.type]?.label}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">الحالة</span>
                  <span className="badge" style={{
                    background: CASE_STATUSES[viewingCase.status]?.bg,
                    color: CASE_STATUSES[viewingCase.status]?.color,
                  }}>{CASE_STATUSES[viewingCase.status]?.label}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">المحكمة</span>
                  <span className="detail-value">{viewingCase.court} - {viewingCase.circuit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">المدعي</span>
                  <span className="detail-value">{viewingCase.plaintiff}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">المدعى عليه</span>
                  <span className="detail-value">{viewingCase.defendant}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">الوقائع</span>
                  <p className="detail-value detail-facts">{viewingCase.facts}</p>
                </div>
                {viewingCase.notes && (
                  <div className="detail-item full-width">
                    <span className="detail-label">ملاحظات</span>
                    <p className="detail-value">{viewingCase.notes}</p>
                  </div>
                )}
              </div>

              {/* Case Sessions History */}
              {(() => {
                const caseSessions = sortByDate(sessions.filter(s => s.caseId === viewingCase.id), 'date', true);
                return (
                  <div className="case-sessions-detail-section mt-6">
                    <h3 className="flex items-center gap-2 mb-3 text-base font-bold text-primary" style={{ fontSize: '1rem' }}>
                      <CalendarDays size={18} className="text-gold" />
                      سجل وقرارات الجلسات ({caseSessions.length})
                    </h3>

                    {caseSessions.length === 0 ? (
                      <div className="p-4 text-center text-muted text-xs rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)' }}>
                        لا توجد جلسات مسجلة لهذه القضية حتى الآن.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {caseSessions.map(s => (
                          <div key={s.id} className="p-3 rounded-lg flex items-center justify-between gap-3 text-xs flex-wrap" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-light)' }}>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gold">{formatDate(s.date)}</span>
                              <span className="text-muted">({formatTime(s.date)})</span>
                              <span className="badge badge-gold text-xs">{s.type}</span>
                              <span className="text-secondary">{s.court} - {s.hall || 'القاعة غير محددة'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-primary" style={{ background: 'rgba(212,168,67,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(212,168,67,0.2)' }}>
                                {s.decision ? `القرار: ${s.decision}` : 'لم يتخذ قرار بعد'}
                              </span>
                              <span className="badge" style={{
                                background: `${SESSION_STATUSES[s.status]?.color}15`,
                                color: SESSION_STATUSES[s.status]?.color,
                              }}>
                                {SESSION_STATUSES[s.status]?.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* AI Summary */}
              <div className="ai-summary-section">
                <h3 className="flex items-center gap-2">
                  <Sparkles size={18} className="text-gold" />
                  التلخيص الذكي
                </h3>
                {aiSummary ? (
                  <pre className="ai-summary-content">{aiSummary}</pre>
                ) : (
                  <div className="ai-summary-loading">
                    <div className="animate-spin"><Sparkles size={20} /></div>
                    <span>جاري التحليل الذكي...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
              <AlertCircle size={48} className="text-danger" style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>تأكيد الحذف</h3>
              <p className="text-secondary text-sm">هل أنت متأكد من حذف هذه القضية؟ سيتم حذف جميع الجلسات المرتبطة بها.</p>
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

// ── Case Form Modal Component ──
function CaseFormModal({ caseData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    number: caseData?.number || '',
    year: caseData?.year || new Date().getFullYear().toString(),
    type: caseData?.type || 'civil',
    status: caseData?.status || 'new',
    court: caseData?.court || '',
    circuit: caseData?.circuit || '',
    plaintiff: caseData?.plaintiff || '',
    defendant: caseData?.defendant || '',
    subject: caseData?.subject || '',
    facts: caseData?.facts || '',
    notes: caseData?.notes || '',
    priority: caseData?.priority || 'medium',
  });

  const handleChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'number' || field === 'year') {
      // Allow only numbers
      sanitizedValue = value.replace(/\D/g, '');
    }
    setForm(prev => ({ ...prev, [field]: sanitizedValue }));
    // Auto-suggest case type when facts change
    if (field === 'facts' && value.length > 20) {
      const suggested = suggestCaseType(value);
      if (!caseData) setForm(prev => ({ ...prev, type: suggested }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form.number || !form.year || !form.plaintiff || !form.defendant || !form.subject) return;
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Scale size={20} className="text-gold" />
            {caseData ? 'تعديل القضية' : 'إضافة قضية جديدة'}
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">رقم القضية (أرقام فقط) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="form-input"
                  value={form.number}
                  onChange={e => handleChange('number', e.target.value)}
                  required
                  placeholder="مثال: 1245"
                />
              </div>
              <div className="form-group">
                <label className="form-label">السنة القضائية (أرقام فقط) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="form-input"
                  value={form.year}
                  onChange={e => handleChange('year', e.target.value)}
                  required
                  placeholder="مثال: 2026"
                />
              </div>
            </div>
            {form.number && form.year && (
              <div className="text-xs text-gold mb-4 p-2 rounded-lg" style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)' }}>
                📌 رقم الدعوى المدمج: <strong>قضية {form.number} لسنة {form.year}</strong>
              </div>
            )}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">نوع القضية</label>
                <select className="form-select" value={form.type} onChange={e => handleChange('type', e.target.value)}>
                  {Object.entries(CASE_TYPES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">حالة القضية</label>
                <select className="form-select" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  {Object.entries(CASE_STATUSES).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
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
                <label className="form-label">الدائرة</label>
                <input className="form-input" value={form.circuit} onChange={e => handleChange('circuit', e.target.value)} placeholder="مثال: الدائرة الثالثة" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">المدعي *</label>
                <input className="form-input" value={form.plaintiff} onChange={e => handleChange('plaintiff', e.target.value)} required placeholder="اسم المدعي" />
              </div>
              <div className="form-group">
                <label className="form-label">المدعى عليه *</label>
                <input className="form-input" value={form.defendant} onChange={e => handleChange('defendant', e.target.value)} required placeholder="اسم المدعى عليه" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">موضوع الدعوى *</label>
              <input className="form-input" value={form.subject} onChange={e => handleChange('subject', e.target.value)} required placeholder="موضوع الدعوى باختصار" />
            </div>
            <div className="form-group">
              <label className="form-label">
                وقائع القضية
                <span className="text-xs text-gold" style={{ marginRight: 8 }}>
                  <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> يتم اقتراح النوع تلقائياً
                </span>
              </label>
              <textarea className="form-textarea" value={form.facts} onChange={e => handleChange('facts', e.target.value)} placeholder="اكتب وقائع القضية بالتفصيل..." rows={4} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">الأولوية</label>
                <select className="form-select" value={form.priority} onChange={e => handleChange('priority', e.target.value)}>
                  <option value="low">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ملاحظات</label>
                <input className="form-input" value={form.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="ملاحظات إضافية" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              {caseData ? 'حفظ التعديلات' : 'إضافة القضية'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
