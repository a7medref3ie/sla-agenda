import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, CalendarDays, Clock,
  AlertTriangle, Gavel, TrendingUp, ArrowUpLeft, Sparkles,
  Plus, Search, Bot, BarChart3, ChevronLeft, ShieldCheck,
  CheckCircle2, Scale, MapPin, Eye, FileText, ArrowRight
} from 'lucide-react';
import { CASE_TYPES, CASE_STATUSES } from '../../data/sampleData';
import { getSmartAlerts } from '../../utils/aiEngine';
import {
  formatTime, formatDate, isToday, isTomorrow, isThisWeek,
  getRelativeTime, getStats, sortByDate
} from '../../utils/helpers';
import './Dashboard.css';

export default function Dashboard({ cases, sessions, profile }) {
  const navigate = useNavigate();
  const stats = getStats(cases, sessions);
  const alerts = getSmartAlerts(cases, sessions);

  // Time state for live clock greeting
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get upcoming sessions (today and future, sorted by date)
  const upcomingSessions = sortByDate(
    sessions.filter(s => {
      const d = new Date(s.date);
      return d >= new Date(new Date().setHours(0, 0, 0, 0)) && s.status === 'scheduled';
    }),
    'date',
    true
  );

  // Next Session Spotlight (very next upcoming session)
  const nextSession = upcomingSessions[0];
  const nextSessionCase = nextSession ? cases.find(c => c.id === nextSession.caseId) : null;

  // Recent cases
  const recentCases = sortByDate(cases, 'createdAt', false).slice(0, 5);

  // Case type distribution for chart
  const typeDistribution = Object.entries(stats.casesByType).map(([type, count]) => ({
    type,
    label: CASE_TYPES[type]?.label || type,
    color: CASE_TYPES[type]?.color || '#666',
    count,
    percentage: Math.round((count / (stats.totalCases || 1)) * 100),
  }));

  // Greeting based on time of day
  const hour = currentTime.getHours();
  const greetingText = hour < 12 ? 'صباح الخير' : 'مساء الخير';

  return (
    <div className="dashboard-container">
      {/* 👑 Executive Judicial Hero Banner */}
      <div className="glass-card hero-banner">
        <div className="hero-glow-accent" />
        <div className="hero-content">
          <div className="hero-header-badge">
            <span className="live-dot" />
            <ShieldCheck size={14} className="text-gold" />
            <span>المنظومة الذكية لهيئة قضايا الدولة • متصل ومحدث</span>
          </div>

          <h1 className="hero-title">
            {greetingText}، {profile?.title || 'سيادة المستشار'} <span className="highlight-name">{profile?.name || 'أحمد عبد العزيز'}</span> ⚖️
          </h1>

          <p className="hero-subtitle">
            لوحة المعلومات القضائية الرئيسية لتنظيم الجلسات، التلخيص الذكي، ودعم كفاءة العمل الإداري والقانوني.
          </p>

          {/* Hero Quick Action Bar */}
          <div className="hero-actions">
            <Link to="/cases" className="hero-btn primary">
              <Plus size={16} />
              <span>إضافة قضية جديدة</span>
            </Link>
            <Link to="/calendar" className="hero-btn secondary">
              <CalendarDays size={16} />
              <span>جدول الجلسات</span>
            </Link>
            <Link to="/assistant" className="hero-btn outline">
              <Sparkles size={16} />
              <span>المساعد الذكي</span>
            </Link>
            <Link to="/reports" className="hero-btn ghost">
              <BarChart3 size={16} />
              <span>التقارير الإحصائية</span>
            </Link>
          </div>
        </div>

        <div className="hero-date-box">
          <div className="date-box-time">
            {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="date-box-day">
            {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div className="date-box-status">
            <CheckCircle2 size={12} className="text-success" /> {stats.todaySessions} جلسات اليوم
          </div>
        </div>
      </div>

      {/* 🎯 Next Session Spotlight Card (If available) */}
      {nextSession && nextSessionCase && (
        <div className="glass-card next-session-spotlight mb-8">
          <div className="spotlight-badge">
            <Clock size={16} className="animate-pulse" />
            <span>الجلسة القادمة مباشرة</span>
          </div>

          <div className="spotlight-body">
            <div className="spotlight-main">
              <div className="spotlight-case-number">
                <Scale size={20} className="text-gold" />
                <span>قضية رقم {nextSessionCase.number} لسنة {nextSessionCase.year}</span>
                <span className="badge badge-gold">{nextSession.type}</span>
              </div>
              <h3 className="spotlight-subject">{nextSessionCase.subject}</h3>
              <div className="spotlight-meta">
                <span>🏛️ {nextSession.court}</span>
                <span>⚖️ {nextSession.circuit || nextSessionCase.circuit}</span>
                <span>📍 {nextSession.hall || 'القاعة غير محددة'}</span>
              </div>
            </div>

            <div className="spotlight-time-col">
              <div className="spotlight-time">{formatTime(nextSession.date)}</div>
              <div className="spotlight-date">{getRelativeTime(nextSession.date)}</div>
              <button
                className="btn btn-sm btn-primary mt-3"
                onClick={() => navigate(`/cases?q=${nextSessionCase.number}`)}
              >
                <Eye size={14} /> عرض تفاصيل القضية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📊 KPI Executive Stats Grid */}
      <div className="stats-grid stagger-children">
        <div className="glass-card stat-card stat-card-gold">
          <div className="stat-icon-wrapper gold">
            <Briefcase size={24} />
          </div>
          <div className="stat-data">
            <div className="stat-value">{stats.activeCases}</div>
            <div className="stat-label">قضية نشطة وقائمة</div>
          </div>
          <div className="stat-footer text-gold">
            <TrendingUp size={14} />
            <span>من إجمالي {stats.totalCases} قضية مسجلة</span>
          </div>
          <Briefcase size={90} className="stat-bg-watermark" />
        </div>

        <div className="glass-card stat-card stat-card-purple">
          <div className="stat-icon-wrapper purple">
            <CalendarDays size={24} />
          </div>
          <div className="stat-data">
            <div className="stat-value">{stats.todaySessions}</div>
            <div className="stat-label">جلسات مقترنة اليوم</div>
          </div>
          <div className="stat-footer text-purple">
            <Clock size={14} />
            <span>تحتاج متابعة وحضور</span>
          </div>
          <CalendarDays size={90} className="stat-bg-watermark" />
        </div>

        <div className="glass-card stat-card stat-card-info">
          <div className="stat-icon-wrapper info">
            <Clock size={24} />
          </div>
          <div className="stat-data">
            <div className="stat-value">{stats.weekSessions}</div>
            <div className="stat-label">جلسات هذا الأسبوع</div>
          </div>
          <div className="stat-footer text-info">
            <ArrowUpLeft size={14} />
            <span>موزعة على المحاكم</span>
          </div>
          <Clock size={90} className="stat-bg-watermark" />
        </div>

        <div className="glass-card stat-card stat-card-warning">
          <div className="stat-icon-wrapper warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-data">
            <div className="stat-value">{stats.postponedCases}</div>
            <div className="stat-label">قضايا مؤجلة ومحجوزة</div>
          </div>
          <div className="stat-footer text-warning">
            <Gavel size={14} />
            <span>{stats.reservedCases} محجوزة للحكم</span>
          </div>
          <AlertTriangle size={90} className="stat-bg-watermark" />
        </div>
      </div>

      {/* 🏛️ Main Dashboard Content Layout */}
      <div className="dashboard-content-layout">
        {/* Left / Main Column: Upcoming Sessions Timeline */}
        <div className="dashboard-main-col">
          <div className="glass-card dashboard-section">
            <div className="section-header">
              <h2 className="section-title">
                <CalendarDays size={22} className="text-gold" />
                جدول الجلسات القادمة
              </h2>
              <Link to="/calendar" className="view-all-link">
                <span>عرض التقويم الكامل</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            <div className="sessions-timeline-list">
              {upcomingSessions.slice(0, 6).length === 0 ? (
                <div className="empty-state p-8 text-center">
                  <CalendarDays size={44} className="empty-icon text-muted" />
                  <p className="empty-title">لا توجد جلسات قادمة مؤكدة</p>
                  <Link to="/calendar" className="btn btn-sm btn-outline mt-3">
                    <Plus size={14} /> إضافة جلسة جديدة
                  </Link>
                </div>
              ) : (
                upcomingSessions.slice(0, 6).map((session, index) => {
                  const caseData = cases.find(c => c.id === session.caseId);
                  const caseType = CASE_TYPES[caseData?.type];
                  return (
                    <div key={session.id} className="timeline-session-item">
                      <div className="timeline-badge-col">
                        <div className="time-badge">{formatTime(session.date)}</div>
                        <div className="relative-date-pill">
                          {isToday(session.date) ? 'اليوم' :
                           isTomorrow(session.date) ? 'غداً' :
                           getRelativeTime(session.date)}
                        </div>
                      </div>

                      <div className="timeline-card-content">
                        <div className="timeline-card-top">
                          <span className="case-ref">
                            قضية {caseData?.number || '—'}/{caseData?.year || ''}
                          </span>
                          <span className="badge" style={{
                            background: `${caseType?.color}15`,
                            color: caseType?.color,
                            border: `1px solid ${caseType?.color}30`
                          }}>
                            {caseType?.label || session.type}
                          </span>
                        </div>

                        <h4 className="timeline-case-subject">{caseData?.subject || 'موضوع غير محدد'}</h4>

                        <div className="timeline-card-footer">
                          <span className="court-info">
                            🏛️ {session.court} • {session.hall || 'القاعة غير محددة'}
                          </span>
                          <span className="session-kind-chip">{session.type}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 📂 Recent Active Cases Table Card */}
          <div className="glass-card dashboard-section mt-6">
            <div className="section-header">
              <h2 className="section-title">
                <Gavel size={22} className="text-gold" />
                أحدث القضايا المضافة والمنظورة
              </h2>
              <Link to="/cases" className="view-all-link">
                <span>عرض كاف القضايا</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            <div className="recent-cases-table-container">
              {recentCases.map(c => (
                <div key={c.id} className="recent-case-row" onClick={() => navigate('/cases')}>
                  <div className="case-row-main">
                    <span className="case-row-num">قضية {c.number}/{c.year}</span>
                    <span className="case-row-subject truncate">{c.subject}</span>
                  </div>

                  <div className="case-row-meta">
                    <span className="case-row-court truncate">{c.court}</span>
                    <span
                      className="badge"
                      style={{
                        background: CASE_STATUSES[c.status]?.bg,
                        color: CASE_STATUSES[c.status]?.color,
                      }}
                    >
                      {CASE_STATUSES[c.status]?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Intelligence & Analytics */}
        <div className="dashboard-side-col">
          {/* 🤖 AI Judicial Intelligence Center */}
          <div className="glass-card dashboard-section ai-center-card">
            <div className="ai-card-header">
              <Sparkles size={20} className="text-gold animate-spin" />
              <h3>مركز الذكاء الاصطناعي والتوصيات</h3>
            </div>

            <p className="ai-card-intro text-xs text-secondary">
              تحليل ذكي تلقائي للجدول القضائي والمهل القانونية والقضايا ذات الأهمية.
            </p>

            <div className="ai-alerts-feed">
              {alerts.slice(0, 4).map(alert => (
                <div key={alert.id} className={`ai-alert-pill alert-${alert.type}`}>
                  <div className="ai-alert-content">
                    <strong>{alert.title}</strong>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/assistant" className="btn btn-sm btn-outline w-full justify-center mt-4">
              <Bot size={16} />
              استشارة المساعد الذكي
            </Link>
          </div>

          {/* 📈 Case Breakdown Analytics */}
          <div className="glass-card dashboard-section">
            <div className="section-header mb-4">
              <h2 className="section-title text-base">
                <BarChart3 size={18} className="text-purple" />
                توزيع القضايا حسب النوع
              </h2>
            </div>

            <div className="analytics-bars-container">
              {typeDistribution.map(item => (
                <div key={item.type} className="analytics-bar-item">
                  <div className="analytics-bar-label">
                    <span>{item.label}</span>
                    <span className="bar-count-badge">{item.count} قضية ({item.percentage}%)</span>
                  </div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${item.percentage}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
