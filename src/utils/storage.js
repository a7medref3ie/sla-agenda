// ========================================
// إدارة التخزين المحلي - LocalStorage Manager
// ========================================

const STORAGE_KEYS = {
  CASES: 'sla_agenda_cases',
  SESSIONS: 'sla_agenda_sessions',
  THEME: 'sla_agenda_theme',
  SIDEBAR: 'sla_agenda_sidebar',
  INITIALIZED: 'sla_agenda_initialized',
  PROFILE: 'sla_agenda_profile',
};

const DEFAULT_PROFILE = {
  name: 'أحمد عبد العزيز',
  title: 'مستشار',
  court: 'هيئة قضايا الدولة',
  password: '',
};

export const storage = {
  // ── Generic ──
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // ── Cases ──
  getCases() {
    return this.get(STORAGE_KEYS.CASES) || [];
  },

  setCases(cases) {
    this.set(STORAGE_KEYS.CASES, cases);
  },

  addCase(caseData) {
    const cases = this.getCases();
    const updated = [caseData, ...cases];
    this.setCases(updated);
    return updated;
  },

  updateCase(id, updates) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === id);
    if (index !== -1) {
      cases[index] = { ...cases[index], ...updates, updatedAt: new Date().toISOString() };
      this.setCases(cases);
    }
    return [...cases];
  },

  deleteCase(id) {
    const cases = this.getCases().filter(c => c.id !== id);
    this.setCases(cases);
    // Also delete related sessions
    const sessions = this.getSessions().filter(s => s.caseId !== id);
    this.setSessions(sessions);
    return cases;
  },

  // ── Sessions ──
  getSessions() {
    return this.get(STORAGE_KEYS.SESSIONS) || [];
  },

  setSessions(sessions) {
    this.set(STORAGE_KEYS.SESSIONS, sessions);
  },

  addSession(session) {
    const sessions = this.getSessions();
    const updated = [session, ...sessions];
    this.setSessions(updated);
    return updated;
  },

  updateSession(id, updates) {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
      sessions[index] = { ...sessions[index], ...updates };
      this.setSessions(sessions);
    }
    return sessions;
  },

  deleteSession(id) {
    const sessions = this.getSessions().filter(s => s.id !== id);
    this.setSessions(sessions);
    return sessions;
  },

  // ── Theme ──
  getTheme() {
    return this.get(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // ── Profile ──
  getProfile() {
    return this.get(STORAGE_KEYS.PROFILE) || DEFAULT_PROFILE;
  },

  setProfile(profile) {
    this.set(STORAGE_KEYS.PROFILE, profile);
    return profile;
  },

  // ── Sidebar ──
  getSidebarCollapsed() {
    return this.get(STORAGE_KEYS.SIDEBAR) || false;
  },

  setSidebarCollapsed(collapsed) {
    this.set(STORAGE_KEYS.SIDEBAR, collapsed);
  },

  // ── Initialization ──
  isInitialized() {
    return this.get(STORAGE_KEYS.INITIALIZED) === true;
  },

  markInitialized() {
    this.set(STORAGE_KEYS.INITIALIZED, true);
  },

  // ── Reset ──
  resetAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

export default storage;
