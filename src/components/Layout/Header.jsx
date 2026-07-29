import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X } from 'lucide-react';
import { isToday } from '../../utils/helpers';
import './Header.css';

export default function Header({ onToggleSidebar, sidebarCollapsed, cases, sessions, profile, onEditProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Count today's sessions for badge
  const todaySessions = sessions.filter(s => isToday(s.date) && s.status === 'scheduled');

  const handleSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const notifications = [];
  if (todaySessions.length > 0) {
    notifications.push({
      id: 1,
      text: `لديك ${todaySessions.length} جلسة مقررة اليوم`,
      type: 'warning'
    });
  }
  const highPriority = cases.filter(c => c.priority === 'high' && c.status !== 'closed');
  if (highPriority.length > 0) {
    notifications.push({
      id: 2,
      text: `${highPriority.length} قضية تتطلب متابعة عاجلة`,
      type: 'danger'
    });
  }
  const reserved = cases.filter(c => c.status === 'reserved');
  if (reserved.length > 0) {
    notifications.push({
      id: 3,
      text: `${reserved.length} قضية محجوزة للحكم`,
      type: 'info'
    });
  }

  const getInitial = () => {
    return profile?.name ? profile.name.trim().charAt(0) : 'م';
  };

  return (
    <header className="app-header">
      <div className="header-right">
        <button className="header-icon-btn mobile-only" onClick={onToggleSidebar}>
          {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <form onSubmit={handleSearch} className="header-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="بحث سريع في القضايا والتفاصيل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="header-left flex items-center gap-4">
        <div className="notification-wrapper">
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>الإشعارات</h3>
                <span className="text-xs text-muted">{notifications.length} إشعار</span>
              </div>
              {notifications.length === 0 ? (
                <p className="notification-empty">لا توجد إشعارات</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`notification-item notification-${n.type}`}>
                    <div className="notification-dot" />
                    <span>{n.text}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          className="header-profile-btn flex items-center gap-2 btn btn-ghost btn-sm"
          onClick={onEditProfile}
          title="تعديل بيانات الحساب والرمز السري"
        >
          <div className="profile-avatar sm" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{getInitial()}</div>
          <span className="text-xs font-bold text-primary">{profile?.title || 'مستشار'} {profile?.name || ''}</span>
        </button>
      </div>
    </header>
  );
}
