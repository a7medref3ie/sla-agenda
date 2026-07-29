import {
  BarChart3, Scale, CalendarDays, Clock,
  TrendingUp, RefreshCw, Printer
} from 'lucide-react';
import { CASE_TYPES, CASE_STATUSES, SESSION_STATUSES } from '../../data/sampleData';
import { getStats, formatDate } from '../../utils/helpers';
import './Reports.css';

export default function ReportsPage({ cases, sessions, onResetData }) {
  const stats = getStats(cases, sessions);

  // Sessions by status
  const sessionsByStatus = {};
  sessions.forEach(s => {
    sessionsByStatus[s.status] = (sessionsByStatus[s.status] || 0) + 1;
  });

  // Cases by court
  const casesByCourt = {};
  cases.forEach(c => {
    casesByCourt[c.court] = (casesByCourt[c.court] || 0) + 1;
  });

  // Top 5 courts
  const topCourts = Object.entries(casesByCourt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Priority distribution
  const priorityDist = {
    high: cases.filter(c => c.priority === 'high').length,
    medium: cases.filter(c => c.priority === 'medium').length,
    low: cases.filter(c => c.priority === 'low').length,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
              <BarChart3 className="icon" size={28} />
              التقارير والإحصائيات
            </h1>
            <p className="page-subtitle">نظرة شاملة على أداء إدارة القضايا والجلسات</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-outline" onClick={handlePrint}>
              <Printer size={16} />
              طباعة التقرير
            </button>
            <button className="btn btn-ghost" onClick={onResetData}>
              <RefreshCw size={16} />
              إعادة البيانات التجريبية
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid stagger-children">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(212, 168, 67, 0.15)' }}>
            <Scale size={24} style={{ color: '#D4A843' }} />
          </div>
          <div className="stat-value">{stats.totalCases}</div>
          <div className="stat-label">إجمالي القضايا</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
            <TrendingUp size={24} style={{ color: '#34D399' }} />
          </div>
          <div className="stat-value">{stats.activeCases}</div>
          <div className="stat-label">قضايا نشطة</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(96, 165, 250, 0.15)' }}>
            <CalendarDays size={24} style={{ color: '#60A5FA' }} />
          </div>
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">إجمالي الجلسات</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <Clock size={24} style={{ color: '#8B5CF6' }} />
          </div>
          <div className="stat-value">{stats.weekSessions}</div>
          <div className="stat-label">جلسات هذا الأسبوع</div>
        </div>
      </div>

      <div className="reports-grid">
        {/* Cases by Type */}
        <div className="glass-card report-card">
          <h3 className="report-card-title">
            <Scale size={18} className="text-gold" />
            القضايا حسب النوع
          </h3>
          <div className="report-chart">
            {Object.entries(stats.casesByType).map(([type, count]) => {
              const percentage = Math.round((count / stats.totalCases) * 100);
              return (
                <div key={type} className="report-bar-item">
                  <div className="report-bar-info">
                    <div className="flex items-center gap-2">
                      <span className="report-dot" style={{ background: CASE_TYPES[type]?.color }} />
                      <span>{CASE_TYPES[type]?.label}</span>
                    </div>
                    <span className="report-bar-count">{count} ({percentage}%)</span>
                  </div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: CASE_TYPES[type]?.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cases by Status */}
        <div className="glass-card report-card">
          <h3 className="report-card-title">
            <BarChart3 size={18} className="text-purple" />
            القضايا حسب الحالة
          </h3>
          <div className="report-chart">
            {Object.entries(stats.casesByStatus).map(([status, count]) => {
              const percentage = Math.round((count / stats.totalCases) * 100);
              return (
                <div key={status} className="report-bar-item">
                  <div className="report-bar-info">
                    <div className="flex items-center gap-2">
                      <span className="report-dot" style={{ background: CASE_STATUSES[status]?.color }} />
                      <span>{CASE_STATUSES[status]?.label}</span>
                    </div>
                    <span className="report-bar-count">{count} ({percentage}%)</span>
                  </div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: CASE_STATUSES[status]?.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions by Status */}
        <div className="glass-card report-card">
          <h3 className="report-card-title">
            <CalendarDays size={18} className="text-info" />
            الجلسات حسب الحالة
          </h3>
          <div className="report-chart">
            {Object.entries(sessionsByStatus).map(([status, count]) => {
              const percentage = Math.round((count / stats.totalSessions) * 100);
              return (
                <div key={status} className="report-bar-item">
                  <div className="report-bar-info">
                    <div className="flex items-center gap-2">
                      <span className="report-dot" style={{ background: SESSION_STATUSES[status]?.color }} />
                      <span>{SESSION_STATUSES[status]?.label}</span>
                    </div>
                    <span className="report-bar-count">{count} ({percentage}%)</span>
                  </div>
                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        background: SESSION_STATUSES[status]?.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-card report-card">
          <h3 className="report-card-title">
            <TrendingUp size={18} className="text-warning" />
            توزيع الأولويات
          </h3>
          <div className="priority-circles">
            <div className="priority-circle">
              <div className="priority-ring high">
                <span className="priority-value">{priorityDist.high}</span>
              </div>
              <span className="priority-label">عالية</span>
            </div>
            <div className="priority-circle">
              <div className="priority-ring medium">
                <span className="priority-value">{priorityDist.medium}</span>
              </div>
              <span className="priority-label">متوسطة</span>
            </div>
            <div className="priority-circle">
              <div className="priority-ring low">
                <span className="priority-value">{priorityDist.low}</span>
              </div>
              <span className="priority-label">عادية</span>
            </div>
          </div>
        </div>

        {/* Top Courts */}
        <div className="glass-card report-card full-width">
          <h3 className="report-card-title">
            <Scale size={18} className="text-gold" />
            أكثر المحاكم تعاملاً
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>المحكمة</th>
                  <th>عدد القضايا</th>
                  <th>النسبة</th>
                </tr>
              </thead>
              <tbody>
                {topCourts.map(([court, count], i) => (
                  <tr key={court}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{court}</td>
                    <td>{count}</td>
                    <td>
                      <div className="table-bar-wrapper">
                        <div
                          className="table-bar"
                          style={{ width: `${(count / cases.length) * 100}%` }}
                        />
                        <span>{Math.round((count / cases.length) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="glass-card app-info-card">
        <div className="app-info-content">
          <h3>أجندة مستشاري قضايا الدولة الذكية</h3>
          <p>SLA Smart Agenda v1.0</p>
          <p className="text-xs text-muted mt-4">
            تطبيق ذكي لتنظيم جلسات مستشاري هيئة قضايا الدولة، مع ميزات ذكية مدعومة بالذكاء الاصطناعي.
            <br />
            يقتصر دور التطبيق على دعم البحث والتنظيم والتلخيص وتحسين كفاءة العمل، ولا يُستخدم في إصدار الأحكام أو اتخاذ القرارات القضائية.
          </p>
          <p className="text-xs text-muted mt-4">
            مشروع تخرج من دورة سفراء الذكاء الاصطناعي - هيئة قضايا الدولة © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
