import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import HomePage from './components/Home/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import CasesPage from './components/Cases/CasesPage';
import CalendarPage from './components/Calendar/CalendarPage';
import FeesCalculator from './components/Calculator/FeesCalculator';
import SmartSearch from './components/Search/SmartSearch';
import AIAssistant from './components/Assistant/AIAssistant';
import ReportsPage from './components/Reports/ReportsPage';
import { ProfileSetupModal, PasswordUnlockModal } from './components/Auth/ProfileAuthModals';
import { storage } from './utils/storage';
import { sampleCases, sampleSessions } from './data/sampleData';

function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [theme, setTheme] = useState('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [cases, setCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  
  // Profile & Auth State
  const [profile, setProfile] = useState(() => storage.getProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Initialize data
  useEffect(() => {
    // Set theme
    const savedTheme = storage.getTheme();
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Set sidebar state
    setSidebarCollapsed(storage.getSidebarCollapsed());

    // Load or initialize data
    if (!storage.isInitialized()) {
      storage.setCases(sampleCases);
      storage.setSessions(sampleSessions);
      storage.markInitialized();
      setCases(sampleCases);
      setSessions(sampleSessions);
    } else {
      setCases(storage.getCases());
      setSessions(storage.getSessions());
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    storage.setTheme(newTheme);
  }, [theme]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      storage.setSidebarCollapsed(!prev);
      return !prev;
    });
  }, []);

  // ── Case Operations ──
  const addCase = useCallback((caseData) => {
    const updated = storage.addCase(caseData);
    setCases(updated);
  }, []);

  const updateCase = useCallback((id, updates) => {
    const updated = storage.updateCase(id, updates);
    setCases(updated);
  }, []);

  const deleteCase = useCallback((id) => {
    const updatedCases = storage.deleteCase(id);
    setCases(updatedCases);
    setSessions(storage.getSessions());
  }, []);

  // ── Session Operations ──
  const addSession = useCallback((sessionData) => {
    const updated = storage.addSession(sessionData);
    setSessions(updated);
  }, []);

  const updateSession = useCallback((id, updates) => {
    const updated = storage.updateSession(id, updates);
    setSessions(updated);
  }, []);

  const deleteSession = useCallback((id) => {
    const updated = storage.deleteSession(id);
    setSessions(updated);
  }, []);

  // ── Profile Operations ──
  const handleSaveProfile = useCallback((updatedProfile) => {
    const saved = storage.setProfile(updatedProfile);
    setProfile(saved);
    setIsAuthenticated(true);
    setShowProfileModal(false);
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    storage.resetAll();
    storage.setCases(sampleCases);
    storage.setSessions(sampleSessions);
    storage.markInitialized();
    storage.setTheme(theme);
    setCases(sampleCases);
    setSessions(sampleSessions);
  }, [theme]);

  // If viewing the Standalone Landing Page (HomePage at /)
  if (isLandingPage) {
    return (
      <HomePage
        cases={cases}
        sessions={sessions}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // First-Time Setup Check (if password is not set yet)
  if (!profile?.password) {
    return (
      <ProfileSetupModal
        profile={profile}
        onSave={handleSaveProfile}
        isFirstUse={true}
      />
    );
  }

  // Session Password Protection Check
  if (!isAuthenticated) {
    return (
      <PasswordUnlockModal
        profile={profile}
        onUnlock={() => setIsAuthenticated(true)}
        onForgotOrReset={() => setShowProfileModal(true)}
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={toggleSidebar}
        profile={profile}
        onEditProfile={() => setShowProfileModal(true)}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          cases={cases}
          sessions={sessions}
          profile={profile}
          onEditProfile={() => setShowProfileModal(true)}
        />
        <div className="page-content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  cases={cases}
                  sessions={sessions}
                  profile={profile}
                />
              }
            />
            <Route
              path="/cases"
              element={
                <CasesPage
                  cases={cases}
                  sessions={sessions}
                  onAddCase={addCase}
                  onUpdateCase={updateCase}
                  onDeleteCase={deleteCase}
                  onAddSession={addSession}
                />
              }
            />
            <Route
              path="/calendar"
              element={
                <CalendarPage
                  cases={cases}
                  sessions={sessions}
                  onAddSession={addSession}
                  onUpdateSession={updateSession}
                  onDeleteSession={deleteSession}
                />
              }
            />
            <Route
              path="/calculator"
              element={<FeesCalculator />}
            />
            <Route
              path="/search"
              element={
                <SmartSearch
                  cases={cases}
                  sessions={sessions}
                />
              }
            />
            <Route
              path="/assistant"
              element={
                <AIAssistant
                  cases={cases}
                  sessions={sessions}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ReportsPage
                  cases={cases}
                  sessions={sessions}
                  onResetData={resetData}
                />
              }
            />
          </Routes>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileSetupModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}

export default App;
