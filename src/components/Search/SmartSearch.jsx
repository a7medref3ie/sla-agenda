import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search, Filter, Sparkles, Scale, CalendarDays,
  Clock, X
} from 'lucide-react';
import { CASE_TYPES, CASE_STATUSES } from '../../data/sampleData';
import { searchItems, formatDate, formatTime } from '../../utils/helpers';
import './Search.css';

export default function SmartSearch({ cases, sessions }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState('all');
  const [searchIn, setSearchIn] = useState('cases'); // 'cases' | 'sessions' | 'all'
  const [results, setResults] = useState({ cases: [], sessions: [] });
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) {
      setResults({ cases: [], sessions: [] });
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    let foundCases = [];
    let foundSessions = [];

    if (searchIn === 'cases' || searchIn === 'all') {
      foundCases = searchItems(cases, searchQuery, [
        'number', 'year', 'subject', 'plaintiff', 'defendant',
        'court', 'facts', 'notes'
      ]);
      if (filterType !== 'all') {
        foundCases = foundCases.filter(c => c.type === filterType);
      }
    }

    if (searchIn === 'sessions' || searchIn === 'all') {
      foundSessions = searchItems(sessions, searchQuery, [
        'court', 'hall', 'type', 'decision', 'notes'
      ]);
      // Enrich sessions with case data
      foundSessions = foundSessions.map(s => ({
        ...s,
        _case: cases.find(c => c.id === s.caseId),
      }));
    }

    setResults({ cases: foundCases, sessions: foundSessions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const highlightText = (text, q) => {
    if (!q.trim() || !text) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
  };

  const totalResults = results.cases.length + results.sessions.length;

  return (
    <div className="search-page">
      <div className="page-header">
        <h1 className="page-title">
          <Search className="icon" size={28} />
          البحث الذكي
        </h1>
        <p className="page-subtitle">بحث متقدم في القضايا والجلسات</p>
      </div>

      {/* Search Box */}
      <div className="glass-card search-box">
        <form onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <Search size={22} className="search-input-icon" />
            <input
              type="text"
              className="search-main-input"
              placeholder="ابحث برقم القضية، اسم المدعي، المحكمة، الموضوع..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" className="search-clear" onClick={() => { setQuery(''); setResults({ cases: [], sessions: [] }); setHasSearched(false); }}>
                <X size={18} />
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              بحث ذكي
            </button>
          </div>
        </form>

        <div className="search-filters">
          <div className="search-filter-group">
            <label>البحث في:</label>
            <div className="search-tabs">
              {[
                { value: 'all', label: 'الكل' },
                { value: 'cases', label: 'القضايا' },
                { value: 'sessions', label: 'الجلسات' },
              ].map(tab => (
                <button
                  key={tab.value}
                  className={`search-tab ${searchIn === tab.value ? 'active' : ''}`}
                  onClick={() => setSearchIn(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {(searchIn === 'cases' || searchIn === 'all') && (
            <div className="search-filter-group">
              <label><Filter size={14} /> نوع القضية:</label>
              <select className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
                <option value="all">الكل</option>
                {Object.entries(CASE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="search-results">
          <div className="search-results-header">
            <h2>
              نتائج البحث
              <span className="badge badge-gold" style={{ marginRight: 8 }}>{totalResults} نتيجة</span>
            </h2>
          </div>

          {totalResults === 0 ? (
            <div className="glass-card empty-state">
              <Search size={48} className="empty-icon" />
              <p className="empty-title">لم يتم العثور على نتائج</p>
              <p className="empty-text">جرب كلمات بحث مختلفة أو غيّر معايير الفلترة</p>
            </div>
          ) : (
            <>
              {/* Case Results */}
              {results.cases.length > 0 && (
                <div className="results-section">
                  <h3 className="results-section-title">
                    <Scale size={18} className="text-gold" />
                    القضايا ({results.cases.length})
                  </h3>
                  <div className="results-list">
                    {results.cases.map(c => (
                      <div key={c.id} className="glass-card result-card">
                        <div className="result-card-header">
                          <div className="flex items-center gap-3">
                            <span className="result-case-number">
                              قضية {highlightText(c.number, query)}/{c.year}
                            </span>
                            <span className="badge" style={{
                              background: `${CASE_TYPES[c.type]?.color}15`,
                              color: CASE_TYPES[c.type]?.color,
                            }}>{CASE_TYPES[c.type]?.label}</span>
                          </div>
                          <span className="badge" style={{
                            background: CASE_STATUSES[c.status]?.bg,
                            color: CASE_STATUSES[c.status]?.color,
                          }}>{CASE_STATUSES[c.status]?.label}</span>
                        </div>
                        <h4 className="result-subject">{highlightText(c.subject, query)}</h4>
                        <div className="result-meta">
                          <span>🏛️ {highlightText(c.court, query)}</span>
                          <span>👤 {highlightText(c.plaintiff, query)}</span>
                          <span>👥 {highlightText(c.defendant, query)}</span>
                        </div>
                        {c.facts && (
                          <p className="result-facts">{highlightText(c.facts.substring(0, 150) + '...', query)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Results */}
              {results.sessions.length > 0 && (
                <div className="results-section">
                  <h3 className="results-section-title">
                    <CalendarDays size={18} className="text-purple" />
                    الجلسات ({results.sessions.length})
                  </h3>
                  <div className="results-list">
                    {results.sessions.map(s => (
                      <div key={s.id} className="glass-card result-card session-result">
                        <div className="result-card-header">
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-gold" />
                            <span>{formatDate(s.date)} - {formatTime(s.date)}</span>
                          </div>
                          <span className="badge badge-gold">{s.type}</span>
                        </div>
                        <div className="result-meta">
                          <span>🏛️ {highlightText(s.court, query)}</span>
                          <span>📍 {s.hall}</span>
                          {s._case && <span>📋 قضية {s._case.number}/{s._case.year}</span>}
                        </div>
                        {s.decision && <p className="result-decision">القرار: {highlightText(s.decision, query)}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Quick Search Suggestions */}
      {!hasSearched && (
        <div className="search-suggestions">
          <h3 className="section-title">
            <Sparkles size={18} className="text-gold" />
            اقتراحات بحث سريعة
          </h3>
          <div className="suggestions-grid">
            {[
              { label: 'القضايا الإدارية', query: 'إداري' },
              { label: 'قضايا مؤجلة', query: 'مؤجلة' },
              { label: 'محكمة النقض', query: 'النقض' },
              { label: 'طعن على قرار', query: 'طعن' },
              { label: 'مطالبة مالية', query: 'مطالبة' },
              { label: 'تزوير', query: 'تزوير' },
            ].map(suggestion => (
              <button
                key={suggestion.query}
                className="glass-card suggestion-chip"
                onClick={() => { setQuery(suggestion.query); setSearchIn('all'); performSearch(suggestion.query); }}
              >
                <Search size={14} />
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
