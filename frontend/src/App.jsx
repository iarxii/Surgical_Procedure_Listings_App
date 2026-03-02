import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from './context/ThemeContext';
import SearchInput from './components/SearchInput';
import DualCodeDisplay from './components/DualCodeDisplay';
import AuthorizedProcedures from './components/AuthorizedProcedures';
import Dashboard from './components/Dashboard';
import ThemeToggle from './components/ThemeToggle';
import { Activity, Clock, AlertTriangle, CheckCircle2, BarChart3, Search } from 'lucide-react';

import logo from './assets/gauteng-health_12_orig.jpg';

/* ─────────── Shared Header ─────────── */
function AppHeader() {
  return (
    <header
      className="backdrop-blur-md shadow-sm sticky top-0 z-10 transition-all duration-300"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="p-2.5 rounded-xl text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, var(--accent), var(--accent-dark))`,
              boxShadow: `0 4px 14px var(--shadow-color)`,
            }}
          >
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
              Surgical Procedure Mapping
            </h1>
            <span className="text-xs font-bold uppercase tracking-widest mt-1 block" style={{ color: 'var(--accent)' }}>
              Clinical SLA Tool
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="app-nav">
            <NavLink to="/" end className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
              <BarChart3 className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}>
              <Search className="h-4 w-4" /> Search
            </NavLink>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

/* ─────────── Search Page (original content) ─────────── */
function SearchPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query || query.length < 3) {
      setResults(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://127.0.0.1:8085/api/search?query=${query}`);
      setResults(response.data);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to fetch coding data. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  const primaryProcedure = results?.local_procedures?.[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 transform transition-all hover:scale-[1.01] duration-300">
        <img src={logo} alt="Gauteng Health Logo" className="w-auto h-50 mx-auto mb-4 rounded-xl" />
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl pb-2"
          style={{
            backgroundImage: `linear-gradient(to right, var(--text-primary), var(--text-secondary), var(--text-primary))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Find Procedures & Map Codes
        </h2>
        <p className="mt-6 text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Search for surgical procedures to view <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>Treatment Time Guarantees (TTGs)</strong> and cross-walk ICD-10-CM and ICD-11 code mappings seamlessly.
        </p>
      </div>

      <div className="transform transition-all duration-500 hover:shadow-xl rounded-2xl max-w-2xl mx-auto relative z-20">
        <SearchInput onSearch={handleSearch} externalValue={searchQuery} />
      </div>

      {error && (
        <div
          className="max-w-2xl mx-auto mt-8 px-4 py-3 rounded-xl flex items-center shadow-sm"
          style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-text)',
          }}
        >
          <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center my-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-14 w-14 border-b-4" style={{ borderColor: 'var(--accent)' }}></div>
            <div className="absolute inset-0 rounded-full blur-[2px] opacity-20 -z-10" style={{ border: '4px solid var(--border)' }}></div>
          </div>
        </div>
      )}

      {results && !loading ? (
        <div className="mt-16 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4">
          {primaryProcedure && (
            <div
              className="rounded-3xl shadow-lg p-8 mb-10 transform transition-all hover:shadow-xl hover:-translate-y-1 duration-300 overflow-hidden relative"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 opacity-50" style={{ backgroundColor: 'var(--accent-bg)' }}></div>
              <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                <div className="flex-1">
                  <span
                    className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm mb-4"
                    style={{
                      backgroundColor: 'var(--accent-bg)',
                      color: 'var(--accent)',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    {primaryProcedure.speciality}
                  </span>
                  <h2 className="text-3xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {primaryProcedure.procedure_name}
                  </h2>
                  <div
                    className="mt-4 flex flex-wrap gap-4 text-sm p-3 rounded-lg inline-flex"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {primaryProcedure.level && (
                      <span className="flex items-center">
                        <strong className="mr-1" style={{ color: 'var(--text-primary)' }}>Level:</strong> {primaryProcedure.level}
                      </span>
                    )}
                    {primaryProcedure.level && primaryProcedure.care_icu && (
                      <span style={{ color: 'var(--border)' }}>|</span>
                    )}
                    {primaryProcedure.care_icu && (
                      <span className="flex items-center">
                        <strong className="mr-1" style={{ color: 'var(--text-primary)' }}>Setting:</strong> {primaryProcedure.care_icu}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6 shadow-sm min-w-[280px]"
                  style={{
                    background: `linear-gradient(135deg, var(--accent-bg), var(--bg-card))`,
                    border: '1px solid var(--border-accent)',
                  }}
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--accent-text)' }}>
                    <Clock className="h-4 w-4" style={{ color: 'var(--accent)' }} /> Treatment SLA Target
                  </h4>
                  <div className="text-4xl font-extrabold" style={{ color: 'var(--accent)' }}>
                    {primaryProcedure.ttg_days ? `${primaryProcedure.ttg_days} days` : primaryProcedure.ttg_months}
                  </div>
                  {primaryProcedure.ttg_days && (
                    <div className="mt-5 space-y-3">
                      <div
                        className="flex items-center justify-between text-sm py-2 px-3 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: 'var(--success-bg)',
                          border: '1px solid var(--success-border)',
                        }}
                      >
                        <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--success-text)' }}>
                          <CheckCircle2 className="h-4 w-4" /> 1st Alert Minimum:
                        </span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{primaryProcedure.ttg_minimum_70_pct} days</span>
                      </div>
                      <div
                        className="flex items-center justify-between text-sm py-2 px-3 rounded-lg shadow-sm"
                        style={{
                          backgroundColor: 'var(--warning-bg)',
                          border: '1px solid var(--warning-border)',
                        }}
                      >
                        <span className="flex items-center gap-2 font-semibold" style={{ color: 'var(--warning-text)' }}>
                          <AlertTriangle className="h-4 w-4" /> 2nd Alert Maximum:
                        </span>
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{primaryProcedure.ttg_alert_90_pct} days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DualCodeDisplay
            icd10={results.icd10_suggestions}
            icd11={results.icd11_suggestions}
            procedures={results.local_procedures}
          />
        </div>
      ) : (
        !loading && <AuthorizedProcedures onSelectProcedure={handleSearch} />
      )}
    </main>
  );
}

/* ─────────── App Root ─────────── */
function AppContent() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <AppHeader />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}
