import { useState, useCallback } from 'react';
import axios from 'axios';
import SearchInput from './components/SearchInput';
import DualCodeDisplay from './components/DualCodeDisplay';
import { Activity, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (query) => {
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">Surgical Procedure Mapping</h1>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1 block">Clinical SLA Tool</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 transform transition-all hover:scale-[1.01] duration-300">
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 pb-2">
            Find Procedures & Map Codes
          </h2>
          <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Search for surgical procedures to view <strong className="text-indigo-600 font-semibold">Treatment Time Guarantees (TTGs)</strong> and cross-walk ICD-10-CM and ICD-11 code mappings seamlessly.
          </p>
        </div>

        <div className="transform transition-all duration-500 hover:shadow-xl rounded-2xl max-w-2xl mx-auto relative z-20">
          <SearchInput onSearch={handleSearch} />
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center shadow-sm">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-indigo-600"></div>
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full blur-[2px] opacity-20 -z-10"></div>
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="mt-16 transition-all duration-700 ease-out animate-in fade-in slide-in-from-bottom-4">
            {primaryProcedure && (
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-10 transform transition-all hover:shadow-xl hover:-translate-y-1 duration-300 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50"></div>
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                  <div className="flex-1">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm mb-4">
                      {primaryProcedure.speciality}
                    </span>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">{primaryProcedure.procedure_name}</h2>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 inline-flex">
                      {primaryProcedure.level && <span className="flex items-center"><strong className="mr-1 text-gray-900">Level:</strong> {primaryProcedure.level}</span>}
                      {primaryProcedure.level && primaryProcedure.care_icu && <span className="text-gray-300">|</span>}
                      {primaryProcedure.care_icu && <span className="flex items-center"><strong className="mr-1 text-gray-900">Setting:</strong> {primaryProcedure.care_icu}</span>}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-sm min-w-[280px]">
                    <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4 text-indigo-600" /> Treatment SLA Target
                    </h4>
                    <div className="text-4xl font-extrabold text-indigo-700">
                      {primaryProcedure.ttg_days ? `${primaryProcedure.ttg_days} days` : primaryProcedure.ttg_months}
                    </div>
                    {primaryProcedure.ttg_days && (
                      <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between text-sm py-2 px-3 bg-white rounded-lg border border-green-200 shadow-sm">
                          <span className="flex items-center gap-2 text-green-700 font-semibold">
                            <CheckCircle2 className="h-4 w-4" /> 1st Alert Minimum:
                          </span>
                          <span className="font-bold text-gray-900">{primaryProcedure.ttg_minimum_70_pct} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 px-3 bg-white rounded-lg border border-amber-200 shadow-sm">
                          <span className="flex items-center gap-2 text-amber-700 font-semibold">
                            <AlertTriangle className="h-4 w-4" /> 2nd Alert Maximum:
                          </span>
                          <span className="font-bold text-gray-900">{primaryProcedure.ttg_alert_90_pct} days</span>
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
        )}
      </main>
    </div>
  );
}
