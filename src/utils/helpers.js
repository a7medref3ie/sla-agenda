// ========================================
// دوال مساعدة - Helpers
// ========================================

// ── Date Formatting ──
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(dateStr) {
  return `${formatDate(dateStr)} - ${formatTime(dateStr)}`;
}

export function getDayName(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', { weekday: 'long' });
}

export function isToday(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isTomorrow(dateStr) {
  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

export function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  return date >= today && date <= endOfWeek;
}

export function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

export function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date - now;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMs < 0) {
    // Past
    if (diffMins > -60) return `منذ ${Math.abs(diffMins)} دقيقة`;
    if (diffHours > -24) return `منذ ${Math.abs(diffHours)} ساعة`;
    if (diffDays > -7) return `منذ ${Math.abs(diffDays)} يوم`;
    return formatDate(dateStr);
  }

  // Future
  if (isToday(dateStr)) {
    if (diffMins < 60) return `بعد ${diffMins} دقيقة`;
    return `اليوم الساعة ${formatTime(dateStr)}`;
  }
  if (isTomorrow(dateStr)) return `غداً الساعة ${formatTime(dateStr)}`;
  if (diffDays <= 7) return `بعد ${diffDays} أيام`;
  return formatDate(dateStr);
}

// ── ID Generation ──
export function generateId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ── Number Formatting ──
export function formatNumber(num) {
  return new Intl.NumberFormat('ar-EG').format(num);
}

// ── Sorting ──
export function sortByDate(items, field = 'date', ascending = true) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

// ── Filtering ──
export function filterItems(items, filters) {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'all') return true;
      return item[key] === value;
    });
  });
}

// ── Search ──
export function searchItems(items, query, fields) {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase().trim();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerQuery);
    })
  );
}

// ── Statistics ──
export function getStats(cases, sessions) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekEnd = new Date(todayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const activeCases = cases.filter(c => c.status !== 'closed').length;
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d >= todayStart && d < todayEnd && s.status === 'scheduled';
  }).length;
  const weekSessions = sessions.filter(s => {
    const d = new Date(s.date);
    return d >= todayStart && d < weekEnd && s.status === 'scheduled';
  }).length;
  const postponedCases = cases.filter(c => c.status === 'postponed').length;
  const newCases = cases.filter(c => c.status === 'new').length;
  const reservedCases = cases.filter(c => c.status === 'reserved').length;

  const casesByType = {};
  cases.forEach(c => {
    casesByType[c.type] = (casesByType[c.type] || 0) + 1;
  });

  const casesByStatus = {};
  cases.forEach(c => {
    casesByStatus[c.status] = (casesByStatus[c.status] || 0) + 1;
  });

  return {
    activeCases,
    todaySessions,
    weekSessions,
    postponedCases,
    newCases,
    reservedCases,
    totalCases: cases.length,
    totalSessions: sessions.length,
    casesByType,
    casesByStatus,
  };
}

// ── Calendar helpers ──
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  // Return 0-6 where 6 is Saturday (start of Arabic week)
  const day = new Date(year, month, 1).getDay();
  // Convert to Saturday-based week
  return (day + 1) % 7;
}

export function getMonthName(month) {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month];
}

export const WEEKDAYS = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];
