import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Scale, CalendarDays, Search,
  Bot, BarChart3, Calculator, ChevronRight, ChevronLeft,
  Sun, Moon, Sparkles
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة المعلومات' },
  { path: '/cases', icon: Scale, label: 'إدارة القضايا' },
  { path: '/calendar', icon: CalendarDays, label: 'تقويم الجلسات' },
  { path: '/calculator', icon: Calculator, label: 'حاسبة الرسوم' },
  { path: '/search', icon: Search, label: 'البحث الذكي' },
  { path: '/assistant', icon: Bot, label: 'المساعد الذكي' },
  { path: '/reports', icon: BarChart3, label: 'التقارير' },
];

export default function Sidebar({ collapsed, theme, onToggleTheme, onToggleSidebar, profile, onEditProfile }) {
  const location = useLocation();

  const getInitial = () => {
    return profile?.name ? profile.name.trim().charAt(0) : 'م';
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Link to Home */}
      <Link to="/" className="sidebar-logo-link">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Sparkles size={collapsed ? 24 : 28} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <h1>أجندة قضايا الدولة</h1>
              <span>SLA Smart Agenda</span>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            end={item.path === '/'}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className="nav-icon" />
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {!collapsed && location.pathname === item.path && (
              <div className="nav-indicator" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="sidebar-btn theme-toggle"
          onClick={onToggleTheme}
          title="تبديل المظهر"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span>{theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
          )}
        </button>

        <button
          className="sidebar-btn toggle-btn"
          onClick={onToggleSidebar}
          title={collapsed ? 'توسيع' : 'طي'}
        >
          {collapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          {!collapsed && <span>طي القائمة</span>}
        </button>

        {/* Dynamic Profile Section */}
        {!collapsed && (
          <div className="sidebar-profile" onClick={onEditProfile} title="تعديل بيانات الحساب والأمان" style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">{getInitial()}</div>
            <div className="profile-info">
              <div className="profile-name">{profile?.name || 'أحمد عبد العزيز'}</div>
              <div className="profile-role">{profile?.title || 'مستشار'}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
